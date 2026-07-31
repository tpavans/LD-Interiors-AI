import api from './api';

/**
 * Log a real analytics event to the backend database
 * @param {'page_view' | 'search_query' | 'design_click' | 'design_like' | 'whatsapp_share' | 'order_placed'} eventType 
 * @param {Object} payload 
 */
export const trackEvent = async (eventType, payload = {}) => {
  try {
    if (typeof window === 'undefined') return;

    await api.post('/analytics/log', {
      eventType,
      path: payload.path || window.location.pathname,
      productId: payload.productId || null,
      searchKeyword: payload.searchKeyword || ''
    });
  } catch (err) {
    // Non-blocking telemetry log
    console.debug('Telemetry log debug:', err?.message);
  }
};
