// Deal Velocity Analysis Engine
// Tracks and analyzes deal movement speed through pipeline

export class DealVelocityEngine {
    /**
     * Calculate velocity metrics for a deal
     */
    static calculateDealVelocity(opportunity, stageHistory) {
        const stages = this.processStageHistory(stageHistory);
        const currentStageTime = this.getCurrentStageTime(opportunity, stageHistory);
        const totalTime = this.getTotalPipelineTime(opportunity);

        return {
            currentStage: opportunity.stage,
            currentStageTime,
            totalTime,
            stages,
            avgTimePerStage: stages.length > 0 ? totalTime / stages.length : 0,
            velocity: this.calculateVelocityScore(totalTime, opportunity.stage),
            bottlenecks: this.identifyBottlenecks(stages),
            prediction: this.predictClosingTime(opportunity, stages)
        };
    }

    /**
     * Process stage history into usable format
     */
    static processStageHistory(stageHistory) {
        if (!stageHistory || stageHistory.length === 0) return [];

        const stages = [];
        const sorted = [...stageHistory].sort((a, b) =>
            new Date(a.changedAt) - new Date(b.changedAt)
        );

        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];

            const startTime = new Date(current.changedAt);
            const endTime = next ? new Date(next.changedAt) : new Date();
            const daysInStage = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));

            stages.push({
                stage: current.stage,
                startDate: startTime,
                endDate: next ? endTime : null,
                daysInStage,
                isCurrentStage: !next
            });
        }

        return stages;
    }

    /**
     * Get time in current stage
     */
    static getCurrentStageTime(opportunity, stageHistory) {
        if (!stageHistory || stageHistory.length === 0) {
            const created = new Date(opportunity.createdAt);
            return Math.ceil((new Date() - created) / (1000 * 60 * 60 * 24));
        }

        const lastChange = stageHistory[0];
        const lastChangeDate = new Date(lastChange.changedAt);
        return Math.ceil((new Date() - lastChangeDate) / (1000 * 60 * 60 * 24));
    }

    /**
     * Get total time in pipeline
     */
    static getTotalPipelineTime(opportunity) {
        const created = new Date(opportunity.createdAt);
        return Math.ceil((new Date() - created) / (1000 * 60 * 60 * 24));
    }

    /**
     * Calculate velocity score (0-100)
     */
    static calculateVelocityScore(totalDays, currentStage) {
        const benchmarks = {
            'lead': 7,
            'qualified': 21,
            'proposal': 35,
            'negotiation': 45,
            'won': 60,
            'lost': 0
        };

        const benchmark = benchmarks[currentStage] || 30;

        if (totalDays <= benchmark * 0.5) return 100; // Very fast
        if (totalDays <= benchmark) return 80;         // Fast
        if (totalDays <= benchmark * 1.5) return 60;   // Normal
        if (totalDays <= benchmark * 2) return 40;     // Slow
        return 20; // Very slow
    }

    /**
     * Identify bottlenecks
     */
    static identifyBottlenecks(stages) {
        if (stages.length === 0) return [];

        const avgTime = stages.reduce((sum, s) => sum + s.daysInStage, 0) / stages.length;

        return stages
            .filter(stage => stage.daysInStage > avgTime * 1.5)
            .map(stage => ({
                stage: stage.stage,
                daysInStage: stage.daysInStage,
                avgTime: Math.round(avgTime),
                severity: stage.daysInStage > avgTime * 2 ? 'high' : 'medium',
                message: `قضى ${stage.daysInStage} يوم في ${this.getStageLabel(stage.stage)} (المتوسط: ${Math.round(avgTime)} يوم)`
            }));
    }

    /**
     * Predict closing time
     */
    static predictClosingTime(opportunity, stages) {
        if (opportunity.stage === 'won' || opportunity.stage === 'lost') {
            return {
                predictedDays: 0,
                predictedDate: new Date(),
                confidence: 100
            };
        }

        const avgTimePerStage = stages.length > 0
            ? stages.reduce((sum, s) => sum + s.daysInStage, 0) / stages.length
            : 14;

        const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'won'];
        const currentIndex = stageOrder.indexOf(opportunity.stage);
        const remainingStages = stageOrder.length - currentIndex - 1;

        const predictedDays = Math.round(remainingStages * avgTimePerStage);
        const predictedDate = new Date();
        predictedDate.setDate(predictedDate.getDate() + predictedDays);

        const confidence = stages.length >= 2 ? 70 : 50;

        return {
            predictedDays,
            predictedDate,
            confidence,
            remainingStages
        };
    }

    /**
     * Batch analyze velocity for multiple deals
     */
    static batchAnalyzeVelocity(opportunities, stageHistoryMap = {}) {
        return opportunities.map(opp => ({
            opportunityId: opp.id,
            title: opp.title,
            value: opp.value,
            velocity: this.calculateDealVelocity(opp, stageHistoryMap[opp.id] || [])
        })).sort((a, b) => b.velocity.velocity - a.velocity.velocity); // Fastest first
    }

    /**
     * Calculate aggregate velocity metrics
     */
    static calculateAggregateMetrics(velocityResults) {
        if (velocityResults.length === 0) {
            return {
                avgVelocityScore: 0,
                avgTimePerStage: 0,
                avgTotalTime: 0,
                fastestDeal: null,
                slowestDeal: null,
                commonBottlenecks: []
            };
        }

        const avgVelocityScore = Math.round(
            velocityResults.reduce((sum, r) => sum + r.velocity.velocity, 0) / velocityResults.length
        );

        const avgTimePerStage = Math.round(
            velocityResults.reduce((sum, r) => sum + r.velocity.avgTimePerStage, 0) / velocityResults.length
        );

        const avgTotalTime = Math.round(
            velocityResults.reduce((sum, r) => sum + r.velocity.totalTime, 0) / velocityResults.length
        );

        const sorted = [...velocityResults].sort((a, b) => a.velocity.totalTime - b.velocity.totalTime);
        const fastestDeal = sorted[0];
        const slowestDeal = sorted[sorted.length - 1];

        // Find common bottlenecks
        const bottleneckCounts = {};
        velocityResults.forEach(result => {
            result.velocity.bottlenecks.forEach(bottleneck => {
                const key = bottleneck.stage;
                bottleneckCounts[key] = (bottleneckCounts[key] || 0) + 1;
            });
        });

        const commonBottlenecks = Object.entries(bottleneckCounts)
            .map(([stage, count]) => ({
                stage,
                count,
                percentage: Math.round((count / velocityResults.length) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        return {
            avgVelocityScore,
            avgTimePerStage,
            avgTotalTime,
            fastestDeal,
            slowestDeal,
            commonBottlenecks
        };
    }

    /**
     * Get stage label in Arabic
     */
    static getStageLabel(stage) {
        const labels = {
            'lead': 'عميل محتمل',
            'qualified': 'مؤهل',
            'proposal': 'عرض',
            'negotiation': 'تفاوض',
            'won': 'فوز',
            'lost': 'خسارة'
        };
        return labels[stage] || stage;
    }
}
