import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://10.216.164.10:8080';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            await SecureStore.deleteItemAsync('jwtToken');
            router.replace("/login"); 
        }
        return Promise.reject(error);
    }
);

export const registerUser = async (email: string, username: string, password: string) => {
    try {
        const response = await apiClient.post('/user/register', { email, username, password });
        return response.data.result; 
    } catch (error: any) {
        throw error.response?.data || "Lỗi kết nối khi đăng ký";
    }
};

export const loginUser = async (username: string, password: string) => {
    try {
        const response = await apiClient.post('/user/login', { username, password });
        
        const { jwtToken, isAuthenticated } = response.data.result;

        if (isAuthenticated && jwtToken) {
            await SecureStore.setItemAsync('jwtToken', jwtToken);
        }

        return response.data.result;
    } catch (error: any) {
        throw error.response?.data || "Sai tài khoản hoặc mật khẩu";
    }
};

export const logoutUser = async () => {
    try {
        await apiClient.post('/user/logout');
        await SecureStore.deleteItemAsync('jwtToken');
        router.replace("/login");
    } catch (error) {
        console.error("Lỗi khi đăng xuất:", error);
    }
};

export const greetUser = async () => {
    try {
        const response = await apiClient.get('/user/greet');
        return response.data;
    } catch (error: any) {
        throw error.response?.data || "Không thể lấy câu chào.";
    }
};

export default apiClient;