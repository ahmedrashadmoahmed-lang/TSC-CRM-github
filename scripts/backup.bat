@echo off
REM Database Backup Script for Windows
REM Run this script to backup the PostgreSQL database

SET BACKUP_DIR=backups
SET DATE_TIME=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
SET DATE_TIME=%DATE_TIME: =0%
SET BACKUP_FILE=%BACKUP_DIR%\backup_%DATE_TIME%.sql

REM Create backup directory if it doesn't exist
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

echo Starting database backup...
echo Backup file: %BACKUP_FILE%

REM Perform backup
pg_dump %DATABASE_URL% > %BACKUP_FILE%

if %ERRORLEVEL% EQU 0 (
    echo Backup completed successfully!
    
    REM Compress the backup (requires 7-Zip)
    if exist "C:\Program Files\7-Zip\7z.exe" (
        "C:\Program Files\7-Zip\7z.exe" a -tgzip %BACKUP_FILE%.gz %BACKUP_FILE%
        del %BACKUP_FILE%
        echo Backup compressed: %BACKUP_FILE%.gz
    )
    
    echo Backup process finished!
) else (
    echo Backup failed!
    exit /b 1
)
