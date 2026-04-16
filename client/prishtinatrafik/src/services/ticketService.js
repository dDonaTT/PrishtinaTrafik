import API from './api';

const ticketService = {
  buyTicket: async (ticketData) => {
    const response = await API.post('/tickets', ticketData);
    return response.data;
  },

  getMyTickets: async (type = null) => {
    let url = '/tickets';
    if (type) {
      url += `?type=${type}`;
    }
    const response = await API.get(url);
    return response.data;
  },

  getTicketStats: async () => {
    const response = await API.get('/tickets/stats');
    return response.data;
  },

  validateTicket: async (ticketId) => {
    const response = await API.post('/tickets/validate', { ticket_id: ticketId });
    return response.data;
  },

  cancelTicket: async (ticketId) => {
    const response = await API.put(`/tickets/${ticketId}/cancel`);
    return response.data;
  }
};

export default ticketService;