import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Prefer explicit runtime env (process.env) when available (web/dev bundlers),
// then fall back to Expo `extra` (app.config.js). Final fallback uses the
// project .env default.
const procEnvBackend =
  typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_BACKEND_API_ADDRESS
    ? process.env.EXPO_PUBLIC_BACKEND_API_ADDRESS
    : undefined;

const globalEnvBackend =
  typeof globalThis !== 'undefined' && (globalThis as any).process
    ? (globalThis as any).process?.env?.EXPO_PUBLIC_BACKEND_API_ADDRESS
    : undefined;

export const baseURL =
  procEnvBackend || globalEnvBackend || Constants.expoConfig?.extra?.backendApiAddress || 'http://localhost:8002';

// Helpful debug when developing locally to see which baseURL is used.
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[axiosConfig] resolved baseURL ->', baseURL);
}

const axiosInstance = axios.create({ baseURL });

try {
  if (axiosInstance.defaults && axiosInstance.defaults.headers) {
    if (axiosInstance.defaults.headers.post) {
      delete axiosInstance.defaults.headers.post['Content-Type'];
      delete axiosInstance.defaults.headers.post['content-type'];
    }
    if (axiosInstance.defaults.headers.common) {
      delete axiosInstance.defaults.headers.common['Content-Type'];
      delete axiosInstance.defaults.headers.common['content-type'];
    }
  }
} catch (e) {}

// Intercepteur pour ajouter automatiquement le token JWT à chaque requête
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Si AsyncStorage échoue, on continue sans token
      if (__DEV__) {
        console.warn("[axiosConfig] Failed to retrieve token:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
