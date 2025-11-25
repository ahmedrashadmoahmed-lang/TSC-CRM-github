import { NextResponse } from 'next/server';
import { withAuth, adminOnly } from '@/middleware/auth';
import DataImportService from '@/services/DataImportService';
import { writeFile } from 'fs/promises';
import path from 'path';
import logger from '@/lib/logger';

/**
 * Upload and import data from Excel/CSV
 * POST /api/import/upload
 */
export const POST = withAuth(adminOnly, async (req) => {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const dataType = formData.get('type');
        const tenantId = req.tenantId;

        if (!file || !dataType) {
            return NextResponse.json(
                { error: 'File and data type are required' },
                { status: 400 }
            );
        }

        // Save file temporarily
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), 'uploads');
        const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);

        // Create uploads directory if it doesn't exist
        await writeFile(filePath, buffer);

        logger.info('File uploaded for import', { filePath, dataType });

        // Validate file
        const validation = await DataImportService.validateImportFile(
            filePath,
            dataType
        );

        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Import data
        const result = await DataImportService.importFromExcel(
            filePath,
            tenantId,
            dataType
        );

        // Clean up file
        // await unlink(filePath);

        return NextResponse.json({
            success: true,
            imported: result.imported,
            errors: result.errors,
            details: result.details,
        });
    } catch (error) {
        logger.error('Import error', { error: error.message });
        return NextResponse.json(
            { error: 'Failed to import data' },
            { status: 500 }
        );
    }
});

export const config = {
    api: {
        bodyParser: false,
    },
};
