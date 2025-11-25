---
description: Automated Git workflow for safe commits and pushes
---

# Git Workflow - Automated Commit & Push

This workflow ensures safe and organized commits to GitHub after completing features.

## When to Use
- After completing a major feature or page
- After fixing critical bugs
- At the end of each development session
- Before starting new major work

## Workflow Steps

### 1. Check Current Status
```bash
git status
```
**Purpose**: See what files have changed

---

### 2. Review Changes (Optional but Recommended)
```bash
git diff
```
**Purpose**: Review what actually changed in the code

---

### 3. Stage All Changes
// turbo
```bash
git add .
```
**Purpose**: Add all modified files to staging area

---

### 4. Create Meaningful Commit
```bash
git commit -m "feat: [Feature Name] - Brief description

- Key change 1
- Key change 2
- Key change 3"
```

**Commit Message Format**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Example**:
```bash
git commit -m "feat: Complete Contacts page with import/export

- Added contact management with CRUD operations
- Implemented 3 views (Grid/List/Table)
- Created contact details modal with 6 tabs
- Added CSV/Excel import and export
- Integrated advanced filters and search
- Made fully responsive with dark mode support"
```

---

### 5. Push to GitHub
**⚠️ IMPORTANT**: This step requires user approval for safety
```bash
git push origin main
```
**Purpose**: Upload changes to GitHub

---

### 6. Verify Push Success
```bash
git log -1
```
**Purpose**: Confirm the last commit was successful

---

## Safety Checks

Before committing, ensure:
- ✅ Code compiles without errors
- ✅ No console errors in browser
- ✅ Features work as expected
- ✅ Dark mode works
- ✅ Mobile responsive
- ✅ No sensitive data in code

---

## Automated Workflow Trigger

**When I complete a feature, I will automatically**:
1. Run `git status` to check changes
2. Run `git add .` to stage all files
3. Create a descriptive commit message
4. **Ask for your approval** before pushing
5. Push to GitHub after approval

---

## Rollback (If Needed)

If something goes wrong:
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Force push (use with caution)
git push origin main --force
```

---

## Best Practices

1. **Commit Often**: Small, focused commits are better
2. **Meaningful Messages**: Describe what and why
3. **Test Before Commit**: Ensure code works
4. **Review Changes**: Use `git diff` to review
5. **Keep Main Clean**: Only push working code
6. **Backup Important Work**: Push regularly

---

## Automation Rules

**I will automatically commit and push when**:
- ✅ A complete page/feature is finished (100%)
- ✅ All tests pass
- ✅ No build errors
- ✅ User approves the push

**I will ask for approval before**:
- Pushing to GitHub
- Force pushing
- Deleting branches
- Reverting commits

---

## Example Session Flow

1. **Start Work**: Pull latest changes
2. **Develop**: Build features
3. **Test**: Verify everything works
4. **Commit**: Stage and commit with message
5. **Push**: Upload to GitHub (with approval)
6. **Verify**: Check GitHub for success
