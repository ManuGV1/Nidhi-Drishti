import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname || 'localhost';
    if (host.includes('vercel.app')) {
      return '/api';
    }
    return `http://${host}:8000/api`;
  }
  return 'http://localhost:8000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response Interceptor for Error Diagnostics
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error Response:', error.response || error.message);
    return Promise.reject(error.response?.data || { detail: error.message || 'Network connection failure.' });
  }
);

export const apiService = {
  // 1. Overview KPIs
  getOverview: () => api.get('/overview'),

  // 2. Geography
  getStates: () => api.get('/states'),
  getStateDetail: (stateCode) => api.get(`/states/${stateCode}`),
  getConstituencies: (stateName, limit = 100) => 
    api.get('/constituencies', { params: { state_name: stateName, limit } }),

  // 3. Works Explorer
  getWorks: (params = {}) => api.get('/works', { params }),
  getWorkById: (id, workType = 'RECOMMENDED') => 
    api.get(`/works/${id}`, { params: { work_type: workType } }),

  // 4. Risk Intelligence
  getRisks: (params = {}) => api.get('/risks', { params }),
  getRiskById: (id) => api.get(`/risks/${id}`),

  // 5. Live Risk Assessment & Sandbox
  analyzeRealWork: (id, workType = 'RECOMMENDED') => 
    api.post(`/risk/analyze-work/${id}?work_type=${workType}`),
  evaluateSandbox: (payload) => api.post('/risk/sandbox', payload),

  // 6. Investigation Workspace
  getInvestigations: (status) => api.get('/investigations', { params: { status } }),
  createInvestigationCase: (payload) => api.post('/investigations', payload),
  updateInvestigationCase: (caseId, payload) => api.patch(`/investigations/${caseId}`, payload),

  // 7. Analytics Lab
  getFinancialDistribution: () => api.get('/analytics/financial-distribution'),
  getCategoryBreakdown: () => api.get('/analytics/category-breakdown'),
};

export default apiService;
