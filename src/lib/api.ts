export const API = {
  auth: 'https://functions.poehali.dev/2002bfd6-35be-4788-b1e7-966cf13161b9',
  orders: 'https://functions.poehali.dev/18e69093-9f15-4d45-b156-277dab432522',
  admin: 'https://functions.poehali.dev/82206cc2-ae00-4da9-acc8-456b476ffaf3',
};

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface Order {
  id: number;
  title: string;
  description: string;
  ai_analysis: string | null;
  estimated_price: number | null;
  status: string;
  payment_confirmed: boolean;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface ChatMessage {
  role: string;
  content: string;
  created_at?: string;
}

export const getToken = () => localStorage.getItem('svarog_token') || '';
export const getUser = (): User | null => {
  const raw = localStorage.getItem('svarog_user');
  return raw ? JSON.parse(raw) : null;
};
export const saveSession = (token: string, user: User) => {
  localStorage.setItem('svarog_token', token);
  localStorage.setItem('svarog_user', JSON.stringify(user));
};
export const clearSession = () => {
  localStorage.removeItem('svarog_token');
  localStorage.removeItem('svarog_user');
};

export async function authRequest(action: string, payload: Record<string, unknown>) {
  const res = await fetch(API.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function ordersRequest(method: string, body?: Record<string, unknown>) {
  const res = await fetch(API.orders, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { ok: res.ok, data: await res.json() };
}

export async function adminRequest(method: string, body?: Record<string, unknown>) {
  const res = await fetch(API.admin, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { ok: res.ok, data: await res.json() };
}
