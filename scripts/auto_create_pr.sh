#!/bin/bash

# Enhanced Auto PR Creation with Duplicate Check
# Creates PR from feature branches to main with safety checks

set -e

BRANCH=$(git branch --show-current)
BASE_BRANCH="main"

echo "🔍 Checking current branch: $BRANCH"

# Check if on feature branch
if [[ ! $BRANCH =~ ^feature/ ]]; then
    echo "❌ Not on a feature branch. Current branch: $BRANCH"
    exit 1
fi

# Check if PR already exists
echo "🔍 Checking for existing PRs..."
EXISTING_PR=$(gh pr list --head "$BRANCH" --base "$BASE_BRANCH" --json number --jq '.[0].number')

if [ -n "$EXISTING_PR" ]; then
    echo "⚠️  PR already exists: #$EXISTING_PR"
    echo "📝 Updating existing PR..."
    gh pr edit "$EXISTING_PR" --add-label "updated"
    exit 0
fi

# Extract feature name
FEATURE_NAME=$(echo "$BRANCH" | sed 's/feature\///')

# Get commit messages for PR description
COMMITS=$(git log --oneline "$BASE_BRANCH..$BRANCH" | head -10)

# Create PR
echo "📝 Creating new PR..."
PR_BODY="## Changes

$COMMITS

## Checklist
- [ ] Code builds without errors
- [ ] Tests pass
- [ ] No security vulnerabilities
- [ ] Documentation updated
- [ ] Ready for review

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
"

gh pr create \
    --title "feat: $FEATURE_NAME" \
    --body "$PR_BODY" \
    --base "$BASE_BRANCH" \
    --head "$BRANCH" \
    --label "feature" \
    --label "needs-review"

echo "✅ PR created successfully!"
echo "🔗 View PR: $(gh pr view --web)"
