'use client';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="alert alert-success mb-6">
          <i className="bi bi-check-circle text-2xl"></i>
          <div>
            <h3 className="font-bold">✅ Dashboard يعمل!</h3>
            <div className="text-sm">React 18.2.0 + Next.js 14.2.0 - بدون أخطاء webpack</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">لوحة التحكم</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <div className="card-body p-6">
              <p className="text-sm opacity-90 mb-1">إيرادات الشهر</p>
              <h2 className="text-3xl font-bold">125,000</h2>
              <p className="text-xs opacity-80 mt-1">ج.م</p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <div className="card-body p-6">
              <p className="text-sm opacity-90 mb-1">فرص جديدة</p>
              <h2 className="text-3xl font-bold">24</h2>
              <p className="text-xs opacity-80 mt-1">هذا الشهر</p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
            <div className="card-body p-6">
              <p className="text-sm opacity-90 mb-1">معدل الفوز</p>
              <h2 className="text-3xl font-bold">68.5%</h2>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl">
            <div className="card-body p-6">
              <p className="text-sm opacity-90 mb-1">طلبات معلقة</p>
              <h2 className="text-3xl font-bold">12</h2>
              <p className="text-xs opacity-80 mt-1">RFQ</p>
            </div>
          </div>
        </div>

        <div className="mt-6 card bg-white dark:bg-gray-800 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <i className="bi bi-info-circle text-blue-500"></i>
              ملاحظة
            </h3>
            <p className="text-sm">
              هذا dashboard بسيط للتأكد من أن React 18 + Next.js 14 يعملان بشكل صحيح.
              <br />
              يمكن الآن إضافة المميزات المتقدمة تدريجياً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
