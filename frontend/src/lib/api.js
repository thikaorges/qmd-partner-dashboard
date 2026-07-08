import http, { API_BASE } from "@/lib/http";

export const API = API_BASE;

export const partnersApi = {
  list: async (params = {}) => {
    const { data } = await http.get("/partners", { params });
    return data;
  },
  get: async (id) => {
    const { data } = await http.get(`/partners/${id}`);
    return data;
  },
  stats: async () => {
    const { data } = await http.get("/partners/stats");
    return data;
  },
  create: async (payload) => {
    const { data } = await http.post("/partners", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await http.put(`/partners/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await http.delete(`/partners/${id}`);
    return data;
  },
  seed: async (force = false) => {
    const { data } = await http.post(`/partners/seed`, null, { params: { force } });
    return data;
  },
  listLogs: async (id) => {
    const { data } = await http.get(`/partners/${id}/logs`);
    return data;
  },
  addLog: async (id, text) => {
    const { data } = await http.post(`/partners/${id}/logs`, { text });
    return data;
  },
};

export default http;
