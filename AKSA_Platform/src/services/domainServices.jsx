import axios from "axios";

const BASE_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const domainServices = {
  fetchDomains: async () => {
    const response = await api.get('/domains');
    return response.data;
  },

  addDomain: async (domainData) => {
    const response = await api.post('/domains', domainData);
    return response.data;
  },

  deleteDomain: async (domainId) => {
    const response = await api.delete(`/domains/${domainId}`);
    return response.data; // returns { message: "Domain deleted successfully" }
  },
};
