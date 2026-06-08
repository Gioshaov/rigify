import fs from 'fs';
import path from 'path';

/**
 * Simple audit script to find potential missing test IDs
 *
 * LIMITATIONS:
 * - Regex cannot parse JSX reliably
 * - Misses multiline element declarations
 * - False positives on commented code
 * - Cannot detect semantic "should this have a test ID?" logic
 *
 * USE FOR: Quick spot-checks during development
 * DO NOT USE FOR: CI gates or strict validation
 */

const interactiveElements = [
  'button',
  'input',
  'select',
  'textarea',
  'Link', // Next.js Link component
];

interface Finding {
  file: string;
  line: number;
  element: string;
  snippet: string;
}

function findMissingTestIds(dir: string, findings: Finding[] = []): Finding[] {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      findMissingTestIds(fullPath, findings);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Skip commented lines (basic check)
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          return;
        }

        for (const element of interactiveElements) {
          // Simple pattern: <element with no data-testid
          const pattern = new RegExp(`<${element}[^>]*>`, 'i');
          if (pattern.test(line) && !line.includes('data-testid')) {
            findings.push({
              file: fullPath.replace(process.cwd(), ''),
              line: index + 1,
              element,
              snippet: line.trim().substring(0, 80),
            });
          }
        }
      });
    }
  }

  return findings;
}

// Run audit
const findings = findMissingTestIds('./app');
findMissingTestIds('./components', findings);

if (findings.length === 0) {
  console.log('✅ No obvious missing test IDs found (note: this is a basic check)');
} else {
  console.log(`⚠️  Found ${findings.length} potential missing test IDs:\n`);

  // Group by file
  const byFile = findings.reduce((acc, f) => {
    if (!acc[f.file]) acc[f.file] = [];
    acc[f.file].push(f);
    return acc;
  }, {} as Record<string, Finding[]>);

  Object.entries(byFile).forEach(([file, items]) => {
    console.log(`📄 ${file}`);
    items.forEach(item => {
      console.log(`   Line ${item.line}: <${item.element}> - ${item.snippet}...`);
    });
    console.log('');
  });

  console.log('⚠️  NOTE: This audit has false positives. Review each finding manually.');
}
