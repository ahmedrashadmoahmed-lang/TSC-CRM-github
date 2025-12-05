// Unit Tests for Lead Scoring Engine
import { leadScoringEngine } from '@/lib/leadScoringEngine';

describe('LeadScoringEngine', () => {
    describe('calculateScore', () => {
        test('calculates score for high-quality lead', () => {
            const leadData = {
                jobTitle: 'CEO',
                companySize: 500,
                industry: 'technology',
                location: 'cairo',
                emailOpens: 10,
                linkClicks: 8,
                websiteVisits: 15,
                formSubmissions: 3,
                downloadedContent: 5,
                avgResponseTime: 1800000, // 30 minutes
                meetingsAttended: 3,
                questionsAsked: 5,
                socialEngagement: 4,
                revenue: 15000000,
                employees: 600,
                growthRate: 25,
            };

            const result = leadScoringEngine.calculateScore(leadData);

            expect(result.totalScore).toBeGreaterThan(80);
            expect(result.grade).toMatch(/A/);
            expect(result.conversionProbability).toBeGreaterThan(60);
            expect(result.breakdown).toHaveProperty('demographic');
            expect(result.breakdown).toHaveProperty('behavioral');
            expect(result.breakdown).toHaveProperty('engagement');
            expect(result.breakdown).toHaveProperty('firmographic');
            expect(result.recommendations).toBeInstanceOf(Array);
            expect(result.recommendations.length).toBeGreaterThan(0);
        });

        test('calculates score for low-quality lead', () => {
            const leadData = {
                jobTitle: 'employee',
                companySize: 10,
                industry: 'other',
                location: 'other',
                emailOpens: 0,
                linkClicks: 0,
                websiteVisits: 1,
                formSubmissions: 0,
                downloadedContent: 0,
                avgResponseTime: 172800000, // 2 days
                meetingsAttended: 0,
                questionsAsked: 0,
                socialEngagement: 0,
                revenue: 100000,
                employees: 5,
                growthRate: 2,
            };

            const result = leadScoringEngine.calculateScore(leadData);

            expect(result.totalScore).toBeLessThan(50);
            expect(result.grade).toMatch(/C|D/);
            expect(result.conversionProbability).toBeLessThan(40);
        });

        test('returns correct grade for different score ranges', () => {
            const testCases = [
                { score: 95, expectedGrade: 'A+' },
                { score: 85, expectedGrade: 'A' },
                { score: 75, expectedGrade: 'B+' },
                { score: 65, expectedGrade: 'B' },
                { score: 55, expectedGrade: 'C+' },
                { score: 45, expectedGrade: 'C' },
                { score: 35, expectedGrade: 'D' },
            ];

            testCases.forEach(({ score, expectedGrade }) => {
                const grade = leadScoringEngine.getGrade(score);
                expect(grade).toBe(expectedGrade);
            });
        });
    });

    describe('scoreLeads', () => {
        test('scores multiple leads and sorts by score', () => {
            const leads = [
                { id: '1', name: 'Lead 1', emailOpens: 2, websiteVisits: 3 },
                { id: '2', name: 'Lead 2', emailOpens: 10, websiteVisits: 15 },
                { id: '3', name: 'Lead 3', emailOpens: 5, websiteVisits: 8 },
            ];

            const results = leadScoringEngine.scoreLeads(leads);

            expect(results).toHaveLength(3);
            expect(results[0].totalScore).toBeGreaterThanOrEqual(results[1].totalScore);
            expect(results[1].totalScore).toBeGreaterThanOrEqual(results[2].totalScore);
            expect(results[0]).toHaveProperty('id');
            expect(results[0]).toHaveProperty('name');
            expect(results[0]).toHaveProperty('totalScore');
            expect(results[0]).toHaveProperty('grade');
        });
    });
});
