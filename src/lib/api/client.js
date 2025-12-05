/**
 * Centralized API Client
 * Handles all API requests with consistent error handling and auth
 */

class APIError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

class APIClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }

    /**
     * Make an API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<any>} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);

            // Handle rate limiting
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                throw new APIError(
                    `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
                    429,
                    { retryAfter }
                );
            }

            // Handle authentication errors
            if (response.status === 401) {
                throw new APIError('Unauthorized - Please login', 401);
            }

            // Handle authorization errors
            if (response.status === 403) {
                throw new APIError('Forbidden - Insufficient permissions', 403);
            }

            const data = await response.json();

            if (!response.ok) {
                throw new APIError(
                    data.error || data.message || 'Request failed',
                    response.status,
                    data
                );
            }

            return data;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }

            // Network or other errors
            throw new APIError(
                error.message || 'Network error',
                0,
                { originalError: error }
            );
        }
    }

    /**
     * GET request
     */
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    /**
     * PUT request
     */
    put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    /**
     * PATCH request
     */
    patch(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    }

    /**
     * DELETE request
     */
    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

// Export singleton instance
export const apiClient = new APIClient();
export { APIError };
