import axiosInstance, { baseURL } from "@/api/axiosConfig";

// ------------------------------
// Types alignés avec ton backend
// ------------------------------

export interface UserDTO {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  contacts?: string[] | null;
  created_at?: string | null;
  role?: string | null;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

// ------------------------------
//     API CALLS AUTHENTICATION
// ------------------------------

/** 🔐 POST /auth/login */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await axiosInstance.post("/auth/login", payload);
  return res.data;
}

/** 🆕 POST /auth/register */
export async function register(payload: RegisterPayload): Promise<UserDTO> {
  const res = await axiosInstance.post("/auth/register", payload);
  return res.data;
}

/** 👤 GET /auth/me */
export async function fetchMe(token: string): Promise<UserDTO> {
  const res = await axiosInstance.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/** 🔁 PUT /auth/password */
export async function changePassword(
  token: string,
  payload: ChangePasswordPayload
): Promise<void> {
  await axiosInstance.put("/auth/password", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
