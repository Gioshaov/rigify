# Rigify Workflows

This document describes the git workflow, code review protocol, and session management processes.

---

## Git Workflow

### Branching Strategy

- **Always create a feature branch** before making changes
- **Branch naming**: `feature/short-description`
- **Never commit directly to `master` or `staging`** — both are long-lived deploy branches
- **Promotion flow**: `feature/*` → PR into `staging` → merge to `staging` deploys to staging.rigify.ge → merge `staging` into `master` ships to production
- Create PR when ready for review

### Branch Creation

```bash
git checkout -b feature/add-booking-flow
# Make changes
git add .
git commit -m "Add booking flow with calendar picker"
```

---

## Code Review Protocol

See **CLAUDE.md → "Code Review Protocol"** for the canonical rules (which reviews run, when to skip, how `/ponytail-review` findings are handled, PASS/FAIL semantics). Do not duplicate the protocol here — keep one source of truth so rule updates don't drift.

---

## Session Management

Rigify uses a **two-file system** to track development progress across sessions.

### File Roles

**1. LATEST_SESSION.md** - Living Document
- **Read at session start** to understand current state
- Current implementation status
- Latest session work
- What&apos;s next
- Stays concise, always current

**2. SESSION_HISTORY.md** - Full Archive
- Full chronological record of all sessions
- Complete audit trail
- Reference only (not read each session)
- Only read when needed to trace back

---

## At Session Start

1. **Read `LATEST_SESSION.md`** to understand current state
2. **Do NOT read `SESSION_HISTORY.md`** (saves context)
3. Review what was accomplished last session
4. Understand what&apos;s next

---

## When User Says &quot;Session End&quot;

### Step 1: Update LATEST_SESSION.md

**Update these sections**:

1. **&quot;Current Implementation Status&quot;** (if features added)
   - Move items from ❌ to ✅ if completed
   - Update percentage if applicable

2. **&quot;Latest Session Work&quot;**
   - Replace with this session&apos;s work
   - Include: objectives, accomplishments, files changed

3. **&quot;What&apos;s Next&quot;**
   - Update based on current priorities
   - Reflect what&apos;s ready for next session

4. **Dates**
   - Update &quot;Last Updated&quot; at top
   - Update date at bottom

### Step 2: Append to SESSION_HISTORY.md

Add new session entry to &quot;Session History&quot; section:

```markdown
### Session N - Date: Title

**Objective**: What we set out to do

**Accomplished**:
- Feature 1 built
- Bug fixed
- Migration created
- Tests added

**Files Changed**: X created, Y modified

**Commits**: 
- <hash> - commit message
- <hash> - commit message

**Next Steps**: What&apos;s ready for next session
```

### Session Entry Template

```markdown
### Session 19 - June 12, 2026: Documentation Restructuring

**Objective**: Restructure MD files into smaller, focused documents (max 200 lines) to improve retention and findability

**Accomplished**:
- Created 4-tier loading strategy (Critical/Active/Contextual/Archive)
- Split CLAUDE.md into 5 focused files (CRITICAL_RULES, ARCHITECTURE, PATTERNS, WORKFLOWS, GOTCHAS)
- Split UI_GUIDE.md into 4 files (UI_SYSTEM, COMPONENTS, ACCESSIBILITY, docs/UI_ROADMAP)
- Created docs/ directory for planning documents
- Moved PERFORMANCE_OPTIMIZATION.md, Test Automation Plan, booking-flow-review to docs/
- Updated CLAUDE.md to navigation hub (773 → 150 lines)
- Session start context reduced by 67% (1,859 → 608 lines)

**Files Changed**: 
- 9 files created (CRITICAL_RULES, ARCHITECTURE, PATTERNS, WORKFLOWS, GOTCHAS, UI_SYSTEM, COMPONENTS, ACCESSIBILITY, docs/UI_ROADMAP)
- 2 files modified (CLAUDE.md, TESTING.md)
- 4 files moved to docs/
- 1 file deleted (UI_GUIDE.md)

**Commits**: 
- b7068a5 - Restructure documentation: split into focused files

**Next Steps**: 
- Test new structure in one session
- Verify improved retention of critical rules
- Adjust cross-references if needed
```

---

## Never

- Create separate session files (`SESSION_SUMMARY_DAY3.md`, etc.)
- Skip updating both files
- Read `SESSION_HISTORY.md` at session start (only when needed for reference)

---

## Commit Message Guidelines

**Format**: `<type>: <description>`

**Types**:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `refactor:` — Code refactoring (no functionality change)
- `test:` — Adding/updating tests
- `chore:` — Maintenance (deps, configs)

**Examples**:
```
feat: add booking flow with calendar picker
fix: resolve overlap detection bug in availability logic
docs: restructure MD files for better retention
refactor: extract Supabase client to shared utility
test: add E2E tests for guest booking flow
chore: update dependencies to latest versions
```

**Co-Author**:
Always add co-author line at end of commit message:

```
feat: add booking flow with calendar picker

Add public booking page with date/time selection, staff picker, and confirmation screen.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Deployment Workflow

### Vercel (Production)

**Auto-deploy on push to `master`**:
- Push to `master` branch → Vercel auto-deploys production (rigify.ge)
- Push to `staging` branch → Vercel auto-deploys staging (staging.rigify.ge)
- Check deploy status at vercel.com/dashboard
- Review build logs if deployment fails

**Manual deploy**:
```bash
vercel --prod
```

### Database Migrations

**Apply migrations**:
```bash
supabase db push
```

**Reset database** (destructive):
```bash
supabase db reset
```

---

## See Also

- **CRITICAL_RULES.md** — Code review protocol details
- **LATEST_SESSION.md** — Current status (read at session start)
- **SESSION_HISTORY.md** — Full development history
- **CLAUDE.md** — Commands, project overview
