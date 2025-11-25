#!/bin/bash

# Database Backup Script
# Run this script to backup the PostgreSQL database

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting database backup..."
echo "Backup file: $BACKUP_FILE"

# Perform backup
pg_dump $DATABASE_URL > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    
    # Compress the backup
    gzip $BACKUP_FILE
    echo "✅ Backup compressed: ${BACKUP_FILE}.gz"
    
    # Optional: Upload to cloud storage (uncomment and configure)
    # aws s3 cp ${BACKUP_FILE}.gz s3://your-bucket/backups/
    
    # Keep only last 7 days of backups
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
    echo "✅ Old backups cleaned up"
else
    echo "❌ Backup failed!"
    exit 1
fi
