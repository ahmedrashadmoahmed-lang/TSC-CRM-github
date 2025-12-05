import styles from './LoadingSkeleton.module.css';

export function KPISkeleton() {
    return (
        <div className={styles.kpiCard}>
            <div className={styles.skeletonLine} style={{ width: '60%', height: '1rem' }}></div>
            <div className={styles.skeletonLine} style={{ width: '40%', height: '2rem', marginTop: '0.5rem' }}></div>
            <div className={styles.skeletonLine} style={{ width: '30%', height: '0.875rem', marginTop: '0.5rem' }}></div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className={styles.chartCard}>
            <div className={styles.skeletonLine} style={{ width: '40%', height: '1.25rem', marginBottom: '1rem' }}></div>
            <div className={styles.chartBars}>
                {[60, 80, 70, 90, 65].map((height, i) => (
                    <div
                        key={i}
                        className={styles.skeletonBar}
                        style={{ height: `${height}%` }}
                    ></div>
                ))}
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }) {
    return (
        <div className={styles.table}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className={styles.tableRow}>
                    <div className={styles.skeletonLine} style={{ width: '25%' }}></div>
                    <div className={styles.skeletonLine} style={{ width: '20%' }}></div>
                    <div className={styles.skeletonLine} style={{ width: '15%' }}></div>
                    <div className={styles.skeletonLine} style={{ width: '30%' }}></div>
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className={styles.card}>
            <div className={styles.skeletonLine} style={{ width: '70%', height: '1.5rem' }}></div>
            <div className={styles.skeletonLine} style={{ width: '100%', height: '1rem', marginTop: '1rem' }}></div>
            <div className={styles.skeletonLine} style={{ width: '90%', height: '1rem', marginTop: '0.5rem' }}></div>
            <div className={styles.skeletonLine} style={{ width: '80%', height: '1rem', marginTop: '0.5rem' }}></div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className={styles.dashboard}>
            {/* KPIs */}
            <div className={styles.kpiGrid}>
                <KPISkeleton />
                <KPISkeleton />
                <KPISkeleton />
                <KPISkeleton />
            </div>

            {/* Charts */}
            <div className={styles.chartsGrid}>
                <ChartSkeleton />
                <ChartSkeleton />
            </div>

            {/* Table */}
            <TableSkeleton rows={8} />
        </div>
    );
}
