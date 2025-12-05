// AI-Powered Lead Scoring Algorithm
// Uses multiple factors to predict lead quality and conversion probability

export class LeadScoringEngine {
    constructor() {
        // Scoring weights (can be adjusted based on historical data)
        this.weights = {
            demographic: 0.25,
            behavioral: 0.35,
            engagement: 0.25,
            firmographic: 0.15
        };

        // Individual factor weights
        this.factorWeights = {
            // Demographic factors
            jobTitle: 15,
            companySize: 10,
            industry: 8,
            location: 7,

            // Behavioral factors
            emailOpens: 12,
            linkClicks: 15,
            websiteVisits: 18,
            formSubmissions: 20,
            downloadedContent: 15,

            // Engagement factors
            responseTime: 12,
            meetingsAttended: 18,
            questionsAsked: 10,
            socialEngagement: 8,

            // Firmographic factors
            revenue: 10,
            employees: 8,
            growthRate: 12
        };
    }

    /**
     * Calculate lead score (0-100)
     */
    calculateScore(leadData) {
        const demographicScore = this.calculateDemographicScore(leadData);
        const behavioralScore = this.calculateBehavioralScore(leadData);
        const engagementScore = this.calculateEngagementScore(leadData);
        const firmographicScore = this.calculateFirmographicScore(leadData);

        const totalScore =
            (demographicScore * this.weights.demographic) +
            (behavioralScore * this.weights.behavioral) +
            (engagementScore * this.weights.engagement) +
            (firmographicScore * this.weights.firmographic);

        return {
            totalScore: Math.round(totalScore),
            breakdown: {
                demographic: Math.round(demographicScore),
                behavioral: Math.round(behavioralScore),
                engagement: Math.round(engagementScore),
                firmographic: Math.round(firmographicScore)
            },
            grade: this.getGrade(totalScore),
            conversionProbability: this.getConversionProbability(totalScore),
            recommendations: this.getRecommendations(totalScore, leadData)
        };
    }

    /**
     * Demographic scoring
     */
    calculateDemographicScore(data) {
        let score = 0;
        const maxScore = 40;

        // Job title scoring
        if (data.jobTitle) {
            const seniorTitles = ['ceo', 'cto', 'cfo', 'director', 'vp', 'head'];
            const isSenior = seniorTitles.some(title =>
                data.jobTitle.toLowerCase().includes(title)
            );
            score += isSenior ? this.factorWeights.jobTitle : this.factorWeights.jobTitle * 0.5;
        }

        // Company size scoring
        if (data.companySize) {
            if (data.companySize >= 100) score += this.factorWeights.companySize;
            else if (data.companySize >= 50) score += this.factorWeights.companySize * 0.7;
            else score += this.factorWeights.companySize * 0.4;
        }

        // Industry scoring
        if (data.industry) {
            const highValueIndustries = ['technology', 'finance', 'healthcare', 'manufacturing'];
            const isHighValue = highValueIndustries.includes(data.industry.toLowerCase());
            score += isHighValue ? this.factorWeights.industry : this.factorWeights.industry * 0.6;
        }

        // Location scoring
        if (data.location) {
            const majorCities = ['cairo', 'alexandria', 'giza'];
            const isMajorCity = majorCities.some(city =>
                data.location.toLowerCase().includes(city)
            );
            score += isMajorCity ? this.factorWeights.location : this.factorWeights.location * 0.7;
        }

        return (score / maxScore) * 100;
    }

    /**
     * Behavioral scoring
     */
    calculateBehavioralScore(data) {
        let score = 0;
        const maxScore = 80;

        // Email engagement
        score += Math.min((data.emailOpens || 0) * 2, this.factorWeights.emailOpens);
        score += Math.min((data.linkClicks || 0) * 3, this.factorWeights.linkClicks);

        // Website activity
        score += Math.min((data.websiteVisits || 0) * 2, this.factorWeights.websiteVisits);
        score += Math.min((data.formSubmissions || 0) * 10, this.factorWeights.formSubmissions);
        score += Math.min((data.downloadedContent || 0) * 5, this.factorWeights.downloadedContent);

        return (score / maxScore) * 100;
    }

    /**
     * Engagement scoring
     */
    calculateEngagementScore(data) {
        let score = 0;
        const maxScore = 48;

        // Response time (faster = better)
        if (data.avgResponseTime) {
            const hours = data.avgResponseTime / 3600000; // Convert to hours
            if (hours < 1) score += this.factorWeights.responseTime;
            else if (hours < 24) score += this.factorWeights.responseTime * 0.7;
            else score += this.factorWeights.responseTime * 0.3;
        }

        // Meetings
        score += Math.min((data.meetingsAttended || 0) * 6, this.factorWeights.meetingsAttended);

        // Questions and interest
        score += Math.min((data.questionsAsked || 0) * 2, this.factorWeights.questionsAsked);

        // Social engagement
        score += Math.min((data.socialEngagement || 0) * 2, this.factorWeights.socialEngagement);

        return (score / maxScore) * 100;
    }

    /**
     * Firmographic scoring
     */
    calculateFirmographicScore(data) {
        let score = 0;
        const maxScore = 30;

        // Company revenue
        if (data.revenue) {
            if (data.revenue >= 10000000) score += this.factorWeights.revenue;
            else if (data.revenue >= 1000000) score += this.factorWeights.revenue * 0.7;
            else score += this.factorWeights.revenue * 0.4;
        }

        // Number of employees
        if (data.employees) {
            if (data.employees >= 500) score += this.factorWeights.employees;
            else if (data.employees >= 100) score += this.factorWeights.employees * 0.7;
            else score += this.factorWeights.employees * 0.4;
        }

        // Growth rate
        if (data.growthRate) {
            if (data.growthRate >= 20) score += this.factorWeights.growthRate;
            else if (data.growthRate >= 10) score += this.factorWeights.growthRate * 0.7;
            else score += this.factorWeights.growthRate * 0.4;
        }

        return (score / maxScore) * 100;
    }

    /**
     * Get letter grade
     */
    getGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B+';
        if (score >= 60) return 'B';
        if (score >= 50) return 'C+';
        if (score >= 40) return 'C';
        return 'D';
    }

    /**
     * Get conversion probability
     */
    getConversionProbability(score) {
        // Based on historical data (can be adjusted)
        if (score >= 80) return 75;
        if (score >= 70) return 60;
        if (score >= 60) return 45;
        if (score >= 50) return 30;
        if (score >= 40) return 20;
        return 10;
    }

    /**
     * Get recommendations
     */
    getRecommendations(score, data) {
        const recommendations = [];

        if (score >= 80) {
            recommendations.push({
                priority: 'high',
                action: 'Schedule demo immediately',
                reason: 'High-quality lead with strong conversion potential'
            });
        } else if (score >= 60) {
            recommendations.push({
                priority: 'medium',
                action: 'Send personalized proposal',
                reason: 'Good lead quality, needs nurturing'
            });
        } else {
            recommendations.push({
                priority: 'low',
                action: 'Add to nurture campaign',
                reason: 'Requires more engagement before sales contact'
            });
        }

        // Specific recommendations based on weak areas
        if (data.emailOpens < 3) {
            recommendations.push({
                priority: 'medium',
                action: 'Improve email subject lines',
                reason: 'Low email engagement'
            });
        }

        if (data.websiteVisits < 2) {
            recommendations.push({
                priority: 'medium',
                action: 'Share relevant content',
                reason: 'Limited website interaction'
            });
        }

        if (!data.meetingsAttended) {
            recommendations.push({
                priority: 'high',
                action: 'Offer consultation call',
                reason: 'No direct interaction yet'
            });
        }

        return recommendations;
    }

    /**
     * Batch score multiple leads
     */
    scoreLeads(leads) {
        return leads.map(lead => ({
            id: lead.id,
            name: lead.name,
            ...this.calculateScore(lead)
        })).sort((a, b) => b.totalScore - a.totalScore);
    }
}

// Export singleton instance
export const leadScoringEngine = new LeadScoringEngine();
