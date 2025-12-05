// Unit Tests for LeadScoreCard Component
import LeadScoreCard from '@/components/dashboard/LeadScoreCard';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

// Mock fetch
global.fetch = jest.fn();

describe('LeadScoreCard', () => {
  const mockLeadData = {
    jobTitle: 'CEO',
    companySize: 250,
    industry: 'technology',
    emailOpens: 5,
    websiteVisits: 8,
    meetingsAttended: 2,
  };

  const mockScoreResponse = {
    success: true,
    data: {
      totalScore: 85,
      grade: 'A',
      conversionProbability: 75,
      breakdown: {
        demographic: 80,
        behavioral: 90,
        engagement: 85,
        firmographic: 75,
      },
      recommendations: [
        {
          priority: 'high',
          action: 'Schedule demo immediately',
          reason: 'High-quality lead',
        },
      ],
    },
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    render(<LeadScoreCard leadId="123" leadData={mockLeadData} />);
    expect(screen.getByText(/جاري حساب النقاط/i)).toBeInTheDocument();
  });

  test('displays score after successful fetch', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScoreResponse,
    });

    render(<LeadScoreCard leadId="123" leadData={mockLeadData} />);

    await waitFor(() => {
      expect(screen.getAllByText('85')[0]).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText(/75%/)).toBeInTheDocument();
    });
  });

  test('displays error state on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));

    render(<LeadScoreCard leadId="123" leadData={mockLeadData} />);

    await waitFor(() => {
      expect(screen.getByText(/خطأ في حساب النقاط/i)).toBeInTheDocument();
    });
  });

  test('renders compact view correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScoreResponse,
    });

    render(<LeadScoreCard leadId="123" leadData={mockLeadData} compact={true} />);

    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  test('displays recommendations', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScoreResponse,
    });

    render(<LeadScoreCard leadId="123" leadData={mockLeadData} />);

    await waitFor(() => {
      expect(screen.getByText('Schedule demo immediately')).toBeInTheDocument();
      expect(screen.getByText('High-quality lead')).toBeInTheDocument();
    });
  });
});
