import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '@/utils/test-utils';
import DataTable from '../DataTable';

describe('DataTable Component', () => {
    const mockColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
    ];

    const mockData = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ];

    it('should render table with data', () => {
        renderWithProviders(
            <DataTable columns={mockColumns} data={mockData} />
        );

        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should show empty state when no data', () => {
        renderWithProviders(
            <DataTable columns={mockColumns} data={[]} />
        );

        expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('should call onRowClick when row is clicked', async () => {
        const handleRowClick = jest.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <DataTable
                columns={mockColumns}
                data={mockData}
                onRowClick={handleRowClick}
            />
        );

        const firstRow = screen.getByText('John Doe').closest('tr');
        await user.click(firstRow);

        expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it('should show loading state', () => {
        renderWithProviders(
            <DataTable columns={mockColumns} data={mockData} loading={true} />
        );

        expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
        const mockActions = [
            { label: 'Edit', onClick: jest.fn() },
            { label: 'Delete', onClick: jest.fn() },
        ];

        renderWithProviders(
            <DataTable
                columns={mockColumns}
                data={mockData}
                actions={mockActions}
            />
        );

        expect(screen.getAllByText('Edit')).toHaveLength(mockData.length);
        expect(screen.getAllByText('Delete')).toHaveLength(mockData.length);
    });

    it('should handle sorting', async () => {
        const handleSort = jest.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <DataTable
                columns={mockColumns}
                data={mockData}
                sortable={true}
                onSort={handleSort}
            />
        );

        const nameHeader = screen.getByText('Name');
        await user.click(nameHeader);

        expect(handleSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('should handle pagination', () => {
        const mockPagination = {
            currentPage: 1,
            totalPages: 5,
            pageSize: 10,
            total: 50,
        };

        renderWithProviders(
            <DataTable
                columns={mockColumns}
                data={mockData}
                pagination={mockPagination}
            />
        );

        expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
    });
});
