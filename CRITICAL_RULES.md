# Critical Rules for Rigify

**⚠️ READ THIS FILE EVERY SESSION ⚠️**

These are the 4 rules that cause the most rework when forgotten. They are **MANDATORY** and **NON-NEGOTIABLE**.

---

## 1. Test IDs Are Mandatory

**EVERY TIME YOU CREATE OR MODIFY A COMPONENT, YOU MUST ADD `data-testid` ATTRIBUTES.**

This is NOT optional. This is NOT a separate task. This is part of the definition of "done" for any component work.

**If you create/modify a component without test IDs, the work is incomplete.**

### Rules

- **Every interactive and meaningful element must have a `data-testid`.**
- **Every `data-testid` must be unique within the page/view.**
- **Naming convention:** Use the pattern `{context}-{purpose}-{type}` in kebab-case.
   - `context` = feature + component, e.g. `edit-service`, `browse-studios`, `booking-flow`
   - `purpose` = what the element is for, e.g. `name`, `search`, `confirm`, `close`
   - `type` = element kind, e.g. `input`, `btn`, `select`, `link`, `modal`
   - Full examples: `edit-service-name-input`, `booking-flow-confirm-btn`
   - Never use generic names like `button`, `input`, `item` without context and purpose prefixes
- **Dynamic lists:** Include the record identifier — e.g. `service-card-{serviceId}`
- **Do not reuse IDs across different components**, even if they look similar.

**What needs test IDs:**
- All buttons (primary actions, navigation, forms)
- All form inputs (text, select, checkbox, radio)
- All links (navigation, CTAs)
- Key containers (cards, summaries, sections that tests will verify)

**What doesn&apos;t need test IDs:**
- Pure decorative elements (dividers, spacers)
- Static text that won&apos;t be interacted with
- Icons inside labeled buttons (test the button, not the icon)

---

## 2. JSX Text Escaping

**ALWAYS escape apostrophes and quotes in JSX text content to prevent ESLint errors and Vercel build failures.**

### Rules

- **Apostrophes in contractions** → Use `&apos;`
  - ❌ WRONG: `We're here to help`
  - ✅ CORRECT: `We&apos;re here to help`
  - Examples: don&apos;t, it&apos;s, Georgia&apos;s

- **Double quotes in text** → Use `&quot;`
  - ❌ WRONG: `Rigify ("we", "our", "us")`
  - ✅ CORRECT: `Rigify (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;)`

### Why This Matters

- ESLint rule `react/no-unescaped-entities` will fail the build on Vercel if not escaped
- Prevents deployment failures and CI/CD issues
- Required for all user-facing text content in JSX

### When to Apply

- **Always** when writing user-facing text in JSX elements
- Marketing pages, error messages, help text, descriptions
- Any `<p>`, `<h1>-<h6>`, `<span>`, `<li>` text content with apostrophes or quotes

---

## 3. Stitch Design Preservation

**When implementing ANY page with a Stitch design, you MUST:**

1. **Reference the original design file** at `design-assets/stitch_rigify/<design-name>/`
   - Read the `code.html` file to see exact classes and structure
   - View the `screen.png` to understand visual behavior
   
2. **Preserve ALL hover effects and transitions:**
   - Image hover effects (scale, grayscale transitions)
   - Border hover effects (color changes)
   - Text hover effects (color transitions)
   - Card/container hover effects
   - Check transition durations (duration-300, duration-700, etc.)
   
3. **Verify before committing:**
   - Compare your implementation to the design file
   - Check all interactive states (hover, focus, active)
   - Test in browser to verify animations work
   
4. **Add design reference comment in code:**
   ```tsx
   // Stitch Design: design-assets/stitch_rigify/<design-name>/
   ```

**If you simplify or modify a Stitch component**, you risk losing critical visual design elements. Always start from the original design and adapt, don&apos;t rebuild from scratch.

---

## 4. Code Review Protocol

After every commit (except trivial changes), **Claude must invoke @code-reviewer**.

### What Qualifies as Trivial (Can Skip Reviews)

- Documentation updates (README, code comments only - **excludes CLAUDE.md**)
- Typo fixes in strings/text
- Formatting changes (spacing, indentation)
- Version bumps in package.json

### What Requires Reviews (Never Skip)

- Any code logic changes
- New features or functionality
- Security-related changes
- Database migrations
- API routes or server actions
- Authentication or authorization code
- **CLAUDE.md workflow changes** (always require review)

### Workflow

1. Make changes and commit locally
2. Claude invokes `@code-reviewer` (thorough review)
   - **User should verify review happened before pushing**
3. Fix any CRITICAL or MAJOR issues found
4. Re-commit fixes if needed
5. Push to GitHub only after `@code-reviewer` passes (PASS or CONDITIONAL PASS)
   - **CONDITIONAL PASS** requires resolving all flagged conditions before pushing

**FAIL verdict = DO NOT push, fix issues first**

---

## See Also

- **TESTING.md** — Test ID patterns, Playwright setup, test organization
- **WORKFLOWS.md** — Complete git workflow, session management
- **UI_SYSTEM.md** — Stitch design system details, color palette
