// src/api.ts
const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL || '';

export interface OrderData {
  "Order ID / Order Number": string;
  "Order Date": string;
  "Customer Name": string;
  "Phone Number": string;
  "Alternate Phone": string;
  "Address Line 1": string;
  "Address Line 2": string;
  "City": string;
  "State": string;
  "Pincode": string;
  "Landmark": string;
  "Product Name / SKU": string;
  "Quantity": number;
  "Weight (kg)": number;
  "Length (cm)": number;
  "Width (cm)": number;
  "Height (cm)": number;
  "Package Value / Declared Value": number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  orders?: T[];
  token?: string;
  error?: string;
}

export async function login(username: string, password: string): Promise<ApiResponse> {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "login", username, password }),
  });
  const data = await res.json();
  if (data.success) {
    sessionStorage.setItem("authToken", data.token);
  }
  return data;
}

export async function fetchOrders(): Promise<ApiResponse<OrderData>> {
  const res = await fetch(SCRIPT_URL);
  return res.json();
}

export async function addOrder(orderData: OrderData): Promise<ApiResponse> {
  const token = sessionStorage.getItem("authToken");
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "addOrder", token, data: orderData }),
  });
  return res.json();
}

export function logout(): void {
  sessionStorage.removeItem("authToken");
}

export function isLoggedIn(): boolean {
  return !!sessionStorage.getItem("authToken");
}
