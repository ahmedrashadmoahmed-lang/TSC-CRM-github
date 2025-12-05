// RFQ Templates API Route
// Handles template CRUD operations

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import RFQTemplateEngine from '@/lib/rfqTemplateEngine';

// GET - Fetch all templates or single template
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId') || 'default';
        const templateId = searchParams.get('id');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        if (templateId) {
            // Fetch single template
            const template = await prisma.rFQTemplate.findUnique({
                where: { id: templateId }
            });

            if (!template) {
                return NextResponse.json({
                    success: false,
                    error: 'Template not found'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                data: template
            });
        }

        // Fetch all templates
        const where = { tenantId, isActive: true };
        if (category) {
            where.category = category;
        }

        let templates = await prisma.rFQTemplate.findMany({
            where,
            orderBy: [
                { isDefault: 'desc' },
                { usageCount: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Search if query provided
        if (search) {
            templates = RFQTemplateEngine.searchTemplates(templates, search);
        }

        // Get popular templates
        const popular = RFQTemplateEngine.getPopularTemplates(templates);

        // Get templates by category
        const byCategory = {};
        RFQTemplateEngine.categories.forEach(cat => {
            byCategory[cat.id] = templates.filter(t => t.category === cat.id);
        });

        return NextResponse.json({
            success: true,
            data: {
                templates,
                popular,
                byCategory,
                categories: RFQTemplateEngine.categories
            }
        });

    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// POST - Create new template
export async function POST(request) {
    try {
        const body = await request.json();
        const { tenantId, createdBy, name, description, category, fields, isDefault } = body;

        // Validate template
        const validation = RFQTemplateEngine.validateTemplate({ name, category, fields });
        if (!validation.isValid) {
            return NextResponse.json({
                success: false,
                error: validation.errors.join(', ')
            }, { status: 400 });
        }

        // Create template
        const template = await prisma.rFQTemplate.create({
            data: {
                name,
                description,
                category,
                fields,
                isDefault: isDefault || false,
                tenantId,
                createdBy
            }
        });

        return NextResponse.json({
            success: true,
            data: template
        });

    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// PATCH - Update template
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { templateId, action, ...updateData } = body;

        const template = await prisma.rFQTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            return NextResponse.json({
                success: false,
                error: 'Template not found'
            }, { status: 404 });
        }

        let updates = {};

        switch (action) {
            case 'update':
                // Validate if fields are being updated
                if (updateData.fields) {
                    const validation = RFQTemplateEngine.validateTemplate({
                        name: updateData.name || template.name,
                        category: updateData.category || template.category,
                        fields: updateData.fields
                    });
                    if (!validation.isValid) {
                        return NextResponse.json({
                            success: false,
                            error: validation.errors.join(', ')
                        }, { status: 400 });
                    }
                }
                updates = updateData;
                break;

            case 'increment_usage':
                updates = {
                    usageCount: template.usageCount + 1
                };
                break;

            case 'toggle_active':
                updates = {
                    isActive: !template.isActive
                };
                break;

            case 'clone':
                const cloned = await prisma.rFQTemplate.create({
                    data: {
                        ...template,
                        id: undefined,
                        name: `${template.name} (Copy)`,
                        isDefault: false,
                        usageCount: 0,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
                return NextResponse.json({
                    success: true,
                    data: cloned
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }

        const updatedTemplate = await prisma.rFQTemplate.update({
            where: { id: templateId },
            data: updates
        });

        return NextResponse.json({
            success: true,
            data: updatedTemplate
        });

    } catch (error) {
        console.error('Error updating template:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// DELETE - Delete template
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const templateId = searchParams.get('id');

        if (!templateId) {
            return NextResponse.json({
                success: false,
                error: 'Template ID required'
            }, { status: 400 });
        }

        // Soft delete by setting isActive to false
        await prisma.rFQTemplate.update({
            where: { id: templateId },
            data: { isActive: false }
        });

        return NextResponse.json({
            success: true,
            message: 'Template deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

