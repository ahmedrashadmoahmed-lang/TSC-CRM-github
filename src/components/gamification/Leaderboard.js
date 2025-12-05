// Leaderboard Component
// Gamification leaderboard for sales team

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import styles from './Leaderboard.module.css';

export default function Leaderboard({ tenantId, period = 'month' }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [tenantId, period]);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`/api/advanced?action=leaderboard&tenantId=${tenantId}&period=${period}`);
            const result = await response.json();
            if (result.success) {
                setLeaderboard(result.data);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy size={20} className={styles.gold} />;
        if (rank === 2) return <Medal size={20} className={styles.silver} />;
        if (rank === 3) return <Award size={20} className={styles.bronze} />;
        return <span className={styles.rankNumber}>{rank}</span>;
    };

    return (
        <div className={styles.leaderboard}>
            <div className={styles.header}>
                <Trophy size={20} />
                <h3>Leaderboard</h3>
                <select
                    className={styles.periodSelect}
                    value={period}
                    onChange={(e) => fetchLeaderboard()}
                >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                </select>
            </div>

            <div className={styles.list}>
                {leaderboard.map((user, index) => (
                    <div key={user.userId} className={styles.userCard}>
                        <div className={styles.rank}>
                            {getRankIcon(user.rank)}
                        </div>
                        <div className={styles.userInfo}>
                            <span className={styles.name}>{user.name}</span>
                            <div className={styles.badges}>
                                {user.badges?.slice(0, 3).map((badge, idx) => (
                                    <span key={idx} className={styles.badge} title={badge}>
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className={styles.stats}>
                            <div className={styles.points}>
                                <span className={styles.pointsValue}>{user.points}</span>
                                <span className={styles.pointsLabel}>points</span>
                            </div>
                            {user.trend && (
                                <div className={styles.trend}>
                                    <TrendingUp size={14} className={user.trend > 0 ? styles.up : styles.down} />
                                    <span>{Math.abs(user.trend)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
