import { client } from './client';

export const fetchDashboard = async () => {
  const { data } = await client.get('/reconciliation/dashboard');
  return data.data;
};

export const fetchReconciliations = async (params) => {
  const { data } = await client.get('/reconciliation/results', { params });
  return data.data;
};

export const runReconciliation = async () => {
  const { data } = await client.post('/reconciliation/run');
  return data.data;
};

export const uploadSettlements = async ({ file, rows }) => {
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await client.post('/settlements/upload', formData);
    return data.data;
  }

  const { data } = await client.post('/settlements/upload', { rows });
  return data.data;
};

