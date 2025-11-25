#!/bin/bash

# Enhanced Version and Changelog Script
# Automatically determines version bump type and creates Git tag

set -e

echo "📦 Auto Version & Changelog Generator"

# Get last commit message
LAST_COMMIT=$(git log -1 --pretty=%B)

# Determine version bump type
VERSION_TYPE="patch"
if echo "$LAST_COMMIT" | grep -qi "BREAKING:"; then
    VERSION_TYPE="major"
    echo "🔴 BREAKING CHANGE detected → Major version bump"
elif echo "$LAST_COMMIT" | grep -qi "^feat:"; then
    VERSION_TYPE="minor"
    echo "🟡 Feature detected → Minor version bump"
else
    echo "🟢 Patch detected → Patch version bump"
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📍 Current version: v$CURRENT_VERSION"

# Bump version
npm version "$VERSION_TYPE" --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✨ New version: v$NEW_VERSION"

# Update CHANGELOG
DATE=$(date +%Y-%m-%d)
CHANGELOG_ENTRY="## [$NEW_VERSION] - $DATE

### Changes
$LAST_COMMIT

"

# Prepend to CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
    echo "$CHANGELOG_ENTRY$(cat CHANGELOG.md)" > CHANGELOG.md
else
    echo "$CHANGELOG_ENTRY" > CHANGELOG.md
fi

echo "📝 CHANGELOG updated"

# Run build to ensure new version works
echo "🔨 Building to verify..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Reverting version bump..."
    git checkout package.json CHANGELOG.md
    exit 1
fi

# Commit changes
git add package.json CHANGELOG.md
git commit -m "chore: bump version to v$NEW_VERSION

[skip ci]"

# Create Git tag
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION

$LAST_COMMIT"

echo "✅ Version bumped to v$NEW_VERSION"
echo "🏷️  Git tag created: v$NEW_VERSION"
echo "📌 Ready to push: git push && git push --tags"
