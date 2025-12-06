'use client';

import MainLayoutNew from '@/components/layout/MainLayoutNew';
import { useDashboardQuery } from '@/hooks/useDashboardQuery';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function Dashboard() {
  // const { data: session } = useSession();
  const session = { user: { name: 'Admin User' } };
  const router = useRouter();
  const [dateRange, setDateRange] = useState('month');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const searchRef = useRef(null);

  // Use custom React Query hook
  const {
    data: dashboardData,
    isLoading: loading,
    error,
    refetch: refresh,
    kpis,
    activities,
    topCustomers,
    topDeals,
  } = useDashboardQuery();

  const isDark = false; // Simplified for now, or import useTheme if needed

  const chartColors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    grid: isDark ? '#374151' : '#e5e7eb',
    text: isDark ? '#f3f4f6' : '#1f2937',
  };

  // Chart Data Configurations
  const revenueTrendData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        label: 'الإيرادات',
        data: [120000, 150000, 180000, 160000, 200000, 220000],
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}20`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const salesFunnelData = {
    labels: ['عملاء محتملين', 'فرص', 'عروض', 'صفقات', 'فواتير'],
    datasets: [
      {
        label: 'عدد العناصر',
        data: [45, 32, 18, 12, 8],
        backgroundColor: [
          chartColors.primary,
          chartColors.secondary,
          '#6366f1',
          chartColors.success,
          '#10b981',
        ],
      },
    ],
  };

  const salesDistributionData = {
    labels: ['مبيعات مباشرة', 'عملاء جدد', 'عملاء حاليين', 'شركاء'],
    datasets: [
      {
        data: [35, 25, 30, 10],
        backgroundColor: [
          chartColors.primary,
          chartColors.secondary,
          chartColors.success,
          chartColors.warning,
        ],
        borderWidth: 0,
      },
    ],
  };

  const salesCycleData = {
    labels: ['Lead', 'Opportunity', 'Quote', 'Deal', 'Invoice'],
    datasets: [
      {
        label: 'متوسط الأيام',
        data: [3, 7, 5, 10, 2],
        backgroundColor: chartColors.primary,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: chartColors.text, padding: 15, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: chartColors.text,
        bodyColor: chartColors.text,
        borderColor: chartColors.grid,
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: chartColors.grid, display: false },
        ticks: { color: chartColors.text },
      },
      y: {
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.text },
      },
    },
  };

  const workflowStages = [
    {
      name: 'عملاء محتملين',
      count: 45,
      icon: 'bi-person-plus',
      color: 'from-blue-500 to-blue-600',
    },
    { name: 'فرص', count: 32, icon: 'bi-bullseye', color: 'from-purple-500 to-purple-600' },
    {
      name: 'عروض أسعار',
      count: 18,
      icon: 'bi-file-earmark-text',
      color: 'from-indigo-500 to-indigo-600',
    },
    { name: 'صفقات', count: 12, icon: 'bi-handshake', color: 'from-green-500 to-green-600' },
    { name: 'فواتير', count: 8, icon: 'bi-receipt', color: 'from-emerald-500 to-emerald-600' },
  ];

  const headerActions = (
    <div className="flex items-center gap-2">
      <select
        className="select select-bordered select-sm"
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
      >
        <option value="today">اليوم</option>
        <option value="week">هذا الأسبوع</option>
        <option value="month">هذا الشهر</option>
        <option value="year">هذه السنة</option>
      </select>
      <button onClick={() => console.log('Export')} className="btn btn-ghost btn-sm" title="تصدير">
        <i className="bi bi-download"></i>
      </button>
      <button onClick={() => refresh()} className="btn btn-ghost btn-circle btn-sm" title="تحديث">
        <i className="bi bi-arrow-clockwise"></i>
      </button>
    </div>
  );

  // Error State
  if (error) {
    return (
      <MainLayoutNew title="خطأ" subtitle="حدث خطأ أثناء تحميل البيانات">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="text-red-500 text-6xl mb-4 animate-bounce">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            حدث خطأ في تحميل البيانات
          </h2>
          <p className="opacity-70 mb-4">{error.message}</p>
          <button onClick={() => refresh()} className="btn btn-primary">
            <i className="bi bi-arrow-clockwise ml-2"></i>
            إعادة المحاولة
          </button>
        </div>
      </MainLayoutNew>
    );
  }

  return (
    <MainLayoutNew
      title="لوحة التحكم"
      subtitle="نظرة شاملة على أداء الأعمال"
      actions={headerActions}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">إيرادات الشهر</p>
                  <h2 className="text-3xl font-bold">
                    {loading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      (kpis.revenueMTD?.value || 0).toLocaleString('ar-EG')
                    )}
                  </h2>
                  <p className="text-xs opacity-80 mt-1">ج.م</p>
                </div>
                <div className="text-5xl opacity-20">
                  <i className="bi bi-cash-stack"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">فرص جديدة</p>
                  <h2 className="text-3xl font-bold">
                    {loading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      kpis.newOpportunities?.value || 0
                    )}
                  </h2>
                  <p className="text-xs opacity-80 mt-1">هذا الشهر</p>
                </div>
                <div className="text-5xl opacity-20">
                  <i className="bi bi-bullseye"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">معدل الفوز</p>
                  <h2 className="text-3xl font-bold">
                    {loading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      (kpis.winRate?.value || 0).toFixed(1)
                    )}
                  </h2>
                  <p className="text-xs opacity-80 mt-1">%</p>
                </div>
                <div className="text-5xl opacity-20">
                  <i className="bi bi-trophy-fill"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">طلبات معلقة</p>
                  <h2 className="text-3xl font-bold">
                    {loading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      kpis.pendingRFQs?.value || 0
                    )}
                  </h2>
                  <p className="text-xs opacity-80 mt-1">RFQ</p>
                </div>
                <div className="text-5xl opacity-20">
                  <i className="bi bi-file-earmark-text-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Tracker */}
        <div className="card bg-white dark:bg-gray-800 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <i className="bi bi-diagram-3 text-primary"></i>
              مخطط سير العمل
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {workflowStages.map((stage, index) => (
                <div key={index} className="relative">
                  <div
                    className={`card bg-gradient-to-br ${stage.color} text-white shadow-lg hover:shadow-xl transition-all cursor-pointer`}
                  >
                    <div className="card-body p-4 text-center">
                      <i className={`bi ${stage.icon} text-3xl mb-2`}></i>
                      <div className="text-2xl font-bold">{stage.count}</div>
                      <div className="text-xs opacity-90 mt-1">{stage.name}</div>
                    </div>
                  </div>
                  {index < workflowStages.length - 1 && (
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 text-gray-400 dark:text-gray-600">
                      <i className="bi bi-arrow-left text-2xl"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card shadow-xl bg-white dark:bg-gray-800">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">
                <i className="bi bi-graph-up text-primary"></i>
                اتجاه الإيرادات
              </h3>
              <div className="h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : (
                  <Line data={revenueTrendData} options={chartOptions} />
                )}
              </div>
            </div>
          </div>

          <div className="card shadow-xl bg-white dark:bg-gray-800">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">
                <i className="bi bi-funnel text-secondary"></i>
                قمع المبيعات
              </h3>
              <div className="h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : (
                  <Bar data={salesFunnelData} options={chartOptions} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights & Quick Actions UI omitted for brevity, adding tables */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card shadow-xl bg-white dark:bg-gray-800">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">أهم العملاء</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>القيمة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.slice(0, 5).map((c, i) => (
                      <tr key={i}>
                        <td>{c.name}</td>
                        <td>{c.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayoutNew>
  );
}
