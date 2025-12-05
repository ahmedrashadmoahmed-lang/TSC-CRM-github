// Opportunity Detail Page
'use client';

import MainLayoutNew from '@/components/layout/MainLayoutNew';
import { exportToExcel } from '@/lib/excel';
import { logActivity } from '@/lib/logger';
import { generateInvoiceQR } from '@/lib/qrcode';
import { ArrowLeft, Download, Edit, FileText, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function OpportunityDetailPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQRCode] = useState(null);

  useEffect(() => {
    fetchOpportunity();
  }, [unwrappedParams.id]);

  const fetchOpportunity = async () => {
    try {
      const res = await fetch(`/api/opportunities/${unwrappedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setOpportunity(data);

        // Generate QR code
        const qr = await generateInvoiceQR({
          number: data.title,
          total: data.value,
          date: data.createdAt,
          id: data.id,
        });
        if (qr.success) {
          setQRCode(qr.dataUrl);
        }
      }
    } catch (error) {
      console.error('Failed to fetch opportunity:', error);
      toast.error('فشل تحميل الفرصة');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRFQ = () => {
    // Log activity
    logActivity(opportunity.customerId, 'CREATE_RFQ_FROM_OPPORTUNITY', {
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
    });

    // Navigate to RFQ creation with pre-filled data
    router.push(`/rfq?opportunityId=${opportunity.id}`);
  };

  const handleExport = () => {
    const exportData = [
      {
        'رقم الفرصة': opportunity.id,
        العنوان: opportunity.title,
        العميل: opportunity.customer?.name || 'N/A',
        القيمة: opportunity.value,
        المرحلة: opportunity.stage,
        'تاريخ الإنشاء': new Date(opportunity.createdAt).toLocaleDateString('ar-EG'),
      },
    ];

    exportToExcel(exportData, `opportunity-${opportunity.id}.xlsx`, {
      sheetName: 'Opportunity Details',
    });

    toast.success('تم التصدير بنجاح');
  };

  const handleStageChange = async (newStage) => {
    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOpportunity(updated);
        toast.success('تم تحديث المرحلة');

        // Log activity
        logActivity(opportunity.customerId, 'UPDATE_OPPORTUNITY_STAGE', {
          opportunityId: opportunity.id,
          oldStage: opportunity.stage,
          newStage,
        });
      }
    } catch (error) {
      console.error('Failed to update stage:', error);
      toast.error('فشل تحديث المرحلة');
    }
  };

  if (loading) {
    return (
      <MainLayoutNew title="تحميل..." subtitle="جاري تحميل تفاصيل الفرصة">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayoutNew>
    );
  }

  if (!opportunity) {
    return (
      <MainLayoutNew title="خطأ" subtitle="الفرصة غير موجودة">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">الفرصة غير موجودة</p>
          <button
            onClick={() => router.push('/pipeline')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            العودة إلى Pipeline
          </button>
        </div>
      </MainLayoutNew>
    );
  }

  const stageColors = {
    leads: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    quotes: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    negotiations: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    won: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const stageNames = {
    leads: 'عملاء محتملون',
    quotes: 'عروض مرسلة',
    negotiations: 'مفاوضات',
    won: 'صفقات مكتملة',
    lost: 'صفقات مفقودة',
  };

  return (
    <MainLayoutNew
      title={opportunity.title}
      subtitle="تفاصيل الفرصة"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/pipeline')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {opportunity.title}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[opportunity.stage]}`}
                >
                  {stageNames[opportunity.stage]}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">العميل</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {opportunity.customer?.name || 'غير محدد'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">القيمة المتوقعة</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(
                      opportunity.value
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">تاريخ الإنشاء</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(opportunity.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            </div>

            {qrCode && (
              <div className="mr-6">
                <img src={qrCode} alt="QR Code" className="w-32 h-32" />
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={handleCreateRFQ}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              إنشاء RFQ
            </button>

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              تصدير Excel
            </button>

            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <Mail className="w-5 h-5" />
              إرسال بريد
            </button>

            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <Edit className="w-5 h-5" />
              تعديل
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">التفاصيل</h2>
          {opportunity.description ? (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {opportunity.description}
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">لا توجد تفاصيل إضافية</p>
          )}
        </div>

        {/* Linked RFQs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            طلبات الأسعار المرتبطة
          </h2>
          {opportunity.rfqs && opportunity.rfqs.length > 0 ? (
            <div className="space-y-3">
              {opportunity.rfqs.map((rfq) => (
                <div
                  key={rfq.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => router.push(`/rfq/${rfq.id}`)}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{rfq.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(rfq.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400">عرض التفاصيل ←</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                لا توجد طلبات أسعار مرتبطة بهذه الفرصة
              </p>
              <button
                onClick={handleCreateRFQ}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                إنشاء طلب سعر جديد
              </button>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">سجل النشاطات</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-2 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">تم إنشاء الفرصة</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(opportunity.createdAt).toLocaleString('ar-EG')}
                </p>
              </div>
            </div>

            {opportunity.updatedAt !== opportunity.createdAt && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-2 bg-green-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">تم تحديث الفرصة</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(opportunity.updatedAt).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayoutNew>
  );
}
