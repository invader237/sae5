import axios from 'axios';
import Constants from 'expo-constants';

const envBackend =
  typeof globalThis !== 'undefined' && 'process' in globalThis
    ? (globalThis as any).process?.env?.EXPO_PUBLIC_BACKEND_API_ADDRESS
    : undefined;

export const baseURL =
  Constants.expoConfig?.extra?.backendApiAddress || envBackend;

const axiosInstance = axios.create({
  baseURL
});

export default axiosInstance;

