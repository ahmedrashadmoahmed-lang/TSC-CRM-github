// Unit Tests for Lost Reasons Tracking
import LostReasonsAnalytics from '@/components/analytics/LostReasonsAnalytics';
import LostReasonModal from '@/components/opportunities/LostReasonModal';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock fetch
global.fetch = jest.fn();

describe('Lost Reasons Tracking', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('LostReasonModal', () => {
    const mockProps = {
      opportunityId: 'opp_123',
      opportunityTitle: 'Test Deal',
      onClose: jest.fn(),
      onSubmit: jest.fn(),
    };

    test('renders modal with all categories', () => {
      render(<LostReasonModal {...mockProps} />);

      expect(screen.getByText('لماذا خسرنا هذه الصفقة؟')).toBeInTheDocument();
      expect(screen.getByText('Test Deal')).toBeInTheDocument();
      expect(screen.getByText('خسرنا لمنافس')).toBeInTheDocument();
      expect(screen.getByText('السعر مرتفع')).toBeInTheDocument();
      expect(screen.getByText('التوقيت غير مناسب')).toBeInTheDocument();
    });

    test('shows competitor fields when Competitor is selected', () => {
      render(<LostReasonModal {...mockProps} />);

      const competitorBtn = screen.getByText('خسرنا لمنافس').closest('button');
      fireEvent.click(competitorBtn);

      expect(screen.getByPlaceholderText('مثال: شركة المنافس')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    });

    test('submits form successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 'reason_123' } }),
      });

      render(<LostReasonModal {...mockProps} />);

      // Select category
      const priceBtn = screen.getByText('السعر مرتفع').closest('button');
      fireEvent.click(priceBtn);

      // Fill description
      const descriptionField = screen.getByPlaceholderText('أضف أي ملاحظات إضافية...');
      fireEvent.change(descriptionField, { target: { value: 'السعر أعلى بـ 20%' } });

      // Submit
      const submitBtn = screen.getByText('حفظ');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/opportunities/opp_123/lost-reason',
          expect.objectContaining({
            method: 'POST',
          })
        );
        expect(mockProps.onClose).toHaveBeenCalled();
      });
    });

    test('shows error when category not selected', () => {
      render(<LostReasonModal {...mockProps} />);

      const submitBtn = screen.getByText('حفظ');
      fireEvent.click(submitBtn);

      // Button should be disabled when no category is selected
      expect(submitBtn).toBeDisabled();
    });
  });

  describe('LostReasonsAnalytics', () => {
    const mockAnalyticsData = {
      success: true,
      data: {
        summary: {
          totalLost: 15,
          totalValue: 450000,
          avgDealValue: 30000,
        },
        byCategory: [
          { category: 'Price', count: 8, percentage: 53, totalValue: 240000 },
          { category: 'Competitor', count: 5, percentage: 33, totalValue: 150000 },
          { category: 'Timing', count: 2, percentage: 13, totalValue: 60000 },
        ],
        byCompetitor: [
          { name: 'Competitor A', count: 3, totalValue: 90000, avgPrice: 25000 },
          { name: 'Competitor B', count: 2, totalValue: 60000, avgPrice: 28000 },
        ],
        recommendations: [
          {
            priority: 'high',
            icon: '💰',
            title: 'مراجعة استراتيجية التسعير',
            description: '53% من الصفقات المفقودة بسبب السعر',
          },
        ],
      },
    };

    test('displays analytics data correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalyticsData,
        json: async () => mockAnalyticsData,
      });

      render(<LostReasonsAnalytics tenantId="tenant_123" />);

      await waitFor(() => {
        expect(screen.getByText('53%')).toBeInTheDocument();
        expect(screen.getByText('33%')).toBeInTheDocument();
        expect(screen.getByText('13%')).toBeInTheDocument();
      });
    });

    test('displays competitors', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalyticsData,
      });

      render(<LostReasonsAnalytics tenantId="tenant_123" />);

      await waitFor(() => {
        expect(screen.getByText('Competitor A')).toBeInTheDocument();
        expect(screen.getByText('Competitor B')).toBeInTheDocument();
      });
    });

    test('displays recommendations', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalyticsData,
      });

      render(<LostReasonsAnalytics tenantId="tenant_123" />);

      await waitFor(() => {
        expect(screen.getByText('مراجعة استراتيجية التسعير')).toBeInTheDocument();
        expect(screen.getByText(/53% من الصفقات المفقودة بسبب السعر/)).toBeInTheDocument();
      });
    });

    test('handles empty data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            summary: { totalLost: 0, totalValue: 0, avgDealValue: 0 },
            byCategory: [],
            byCompetitor: [],
            recommendations: [],
          },
        }),
      });

      render(<LostReasonsAnalytics tenantId="tenant_123" />);

      await waitFor(() => {
        // Use regex to match text that might have emojis
        expect(screen.getByText(/لا توجد صفقات مفقودة في هذه الفترة/)).toBeInTheDocument();
      });
    });

    test('handles error state', async () => {
      fetch.mockRejectedValueOnce(new Error('API Error'));

      render(<LostReasonsAnalytics tenantId="tenant_123" />);

      await waitFor(() => {
        expect(screen.getByText(/حدث خطأ في تحميل البيانات/)).toBeInTheDocument();
      });
    });
  });
});
