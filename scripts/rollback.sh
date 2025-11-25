#!/bin/bash

# Rollback Script - Reverts to previous stable version
# Usage: ./rollback.sh [version_tag]

set -e

echo "🔄 Starting rollback process..."

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📍 Current version: v$CURRENT_VERSION"

# Get target version (from argument or previous tag)
if [ -n "$1" ]; then
    TARGET_TAG="$1"
else
    # Get previous tag
    TARGET_TAG=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo "")
    if [ -z "$TARGET_TAG" ]; then
        echo "❌ No previous tag found. Please specify a version."
        exit 1
    fi
fi

echo "🎯 Target version: $TARGET_TAG"

# Confirm rollback
read -p "⚠️  Are you sure you want to rollback to $TARGET_TAG? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Rollback cancelled"
    exit 0
fi

# Create backup branch
BACKUP_BRANCH="backup/pre-rollback-$(date +%Y%m%d-%H%M%S)"
echo "💾 Creating backup branch: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"

# Checkout target version
echo "📦 Checking out $TARGET_TAG..."
git checkout "$TARGET_TAG"

# Install dependencies
echo "📥 Installing dependencies..."
npm ci

# Run health check
echo "🏥 Running health check..."
npm run build
npm start &
SERVER_PID=$!
sleep 10

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
kill $SERVER_PID

if [ "$HEALTH_CHECK" != "200" ]; then
    echo "❌ Health check failed! Aborting rollback."
    git checkout main
    exit 1
fi

# Force push to main (with safety)
echo "🚀 Deploying rollback..."
git checkout -B main
git push origin main --force-with-lease

# Create rollback tag
ROLLBACK_TAG="rollback-to-$TARGET_TAG-$(date +%Y%m%d-%H%M%S)"
git tag -a "$ROLLBACK_TAG" -m "Rollback to $TARGET_TAG"
git push origin "$ROLLBACK_TAG"

echo "✅ Rollback completed successfully!"
echo "📍 Current version: $TARGET_TAG"
echo "💾 Backup branch: $BACKUP_BRANCH"
echo "🏷️  Rollback tag: $ROLLBACK_TAG"
