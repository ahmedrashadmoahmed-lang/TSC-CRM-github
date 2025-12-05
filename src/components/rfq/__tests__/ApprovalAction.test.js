import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ApprovalAction from '../ApprovalAction';

// Mock fetch
global.fetch = jest.fn();

// Mock window.alert
window.alert = jest.fn();

describe('ApprovalAction Component', () => {
  const mockProps = {
    rfqId: 'rfq-123',
    onActionComplete: jest.fn(),
  };

  beforeEach(() => {
    fetch.mockClear();
    window.alert.mockClear();
    mockProps.onActionComplete.mockClear();
  });

  test('renders correctly', () => {
    render(<ApprovalAction {...mockProps} />);

    expect(screen.getByText('Approval Required')).toBeInTheDocument();
    expect(screen.getByText(/requires internal approval/i)).toBeInTheDocument();
    expect(screen.getByText('Approve RFQ')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  test('handles approve action success', async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    render(<ApprovalAction {...mockProps} />);

    const approveBtn = screen.getByText('Approve RFQ').closest('button');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/rfq/rfq-123/approve',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ action: 'approve', comments: '' }),
        })
      );
      expect(mockProps.onActionComplete).toHaveBeenCalled();
    });
  });

  test('requires comment for rejection', async () => {
    render(<ApprovalAction {...mockProps} />);

    // First click shows input
    const rejectBtn = screen.getByText('Reject').closest('button');
    fireEvent.click(rejectBtn);

    expect(screen.getByPlaceholderText('Reason for rejection...')).toBeInTheDocument();

    // Second click without comment should alert
    const confirmRejectBtn = screen.getByText('Confirm Rejection').closest('button');
    fireEvent.click(confirmRejectBtn);

    expect(window.alert).toHaveBeenCalledWith('Please provide a reason for rejection');
    expect(fetch).not.toHaveBeenCalled();
  });

  test('handles reject action success', async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    render(<ApprovalAction {...mockProps} />);

    // Show input
    const rejectBtn = screen.getByText('Reject').closest('button');
    fireEvent.click(rejectBtn);

    // Add comment
    const input = screen.getByPlaceholderText('Reason for rejection...');
    fireEvent.change(input, { target: { value: 'Too expensive' } });

    // Confirm
    const confirmRejectBtn = screen.getByText('Confirm Rejection').closest('button');
    fireEvent.click(confirmRejectBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/rfq/rfq-123/approve',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ action: 'reject', comments: 'Too expensive' }),
        })
      );
      expect(mockProps.onActionComplete).toHaveBeenCalled();
    });
  });

  test('shows loading state during API call', async () => {
    // Delay response to check loading state
    fetch.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
    );

    render(<ApprovalAction {...mockProps} />);

    const approveBtn = screen.getByText('Approve RFQ').closest('button');
    fireEvent.click(approveBtn);

    expect(approveBtn).toBeDisabled();
    // Check for spinner or just disabled state is enough given the implementation
  });

  test('displays error on API failure', async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    render(<ApprovalAction {...mockProps} />);

    const approveBtn = screen.getByText('Approve RFQ').closest('button');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to process approval action');
    });
  });
});
