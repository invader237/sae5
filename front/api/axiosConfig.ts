import axios from 'axios';
import Constants from 'expo-constants';

const baseURL = Constants.expoConfig?.extra?.backendApiAddress || process.env.EXPO_PUBLIC_BACKEND_API_ADDRESS;

const axiosInstance = axios.create({
  baseURL
});

export default axiosInstance;

