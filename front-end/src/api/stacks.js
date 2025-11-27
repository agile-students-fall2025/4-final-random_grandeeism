import axios from 'axios';

const API_BASE = '/api/stacks';

export const getStacks = async () => {
  const res = await axios.get(API_BASE);
  return res.data;
};

export const createStack = async (stack) => {
  const res = await axios.post(API_BASE, stack);
  return res.data;
};

export const deleteStack = async (id) => {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data;
};
