/**
 * RFQ Service
 * Centralized RFQ API calls
 */

import { apiClient } from '../api/client';

export const rfqService = {
    /**
     * Get all RFQs
     */
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/rfq${query ? `?${query}` : ''}`);
    },

    /**
     * Get RFQ by ID
     */
    getById: (id) => {
        return apiClient.get(`/rfq/${id}`);
    },

    /**
     * Create new RFQ
     */
    create: (data) => {
        return apiClient.post('/rfq', data);
    },

    /**
     * Update RFQ
     */
    update: (id, data) => {
        return apiClient.put(`/rfq/${id}`, data);
    },

    /**
     * Delete RFQ
     */
    delete: (id) => {
        return apiClient.delete(`/rfq/${id}`);
    },

    /**
     * Approve RFQ
     */
    approve: (id, comment = '') => {
        return apiClient.post(`/rfq/${id}/approve`, { comment });
    },

    /**
     * Reject RFQ
     */
    reject: (id, comment = '') => {
        return apiClient.post(`/rfq/${id}/reject`, { comment });
    },

    /**
     * Send RFQ to suppliers
     */
    send: (id, supplierIds) => {
        return apiClient.post(`/rfq/${id}/send`, { supplierIds });
    },

    /**
     * Convert RFQ to Purchase Order
     */
    convertToPO: (id, data) => {
        return apiClient.post(`/rfq/${id}/convert-to-po`, data);
    },

    /**
     * Get RFQ quotes
     */
    getQuotes: (id) => {
        return apiClient.get(`/rfq/${id}/quotes`);
    },

    /**
     * Get RFQ timeline
     */
    getTimeline: (id) => {
        return apiClient.get(`/rfq/${id}/timeline`);
    },
};

export default rfqService;
