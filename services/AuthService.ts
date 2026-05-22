import apiClient from "./apiConfig";
import * as SecureStore from "expo-secure-store";

const BASE_URL: string = "/user"

export const AuthService = {
    register: async (email: string, username: string, password: string) => {
        try {
            const response = await apiClient.post(`${BASE_URL}/register`, { email, username, password });
            return response.data.result;
        } catch (error: any) {
            console.log("Error in REGISTER: ", error)
            throw error.response?.data || "Lỗi kết nối khi đăng ký";
        }
    },

    login: async (username: string, password: string) => {
        try {
            const response = await apiClient.post(`${BASE_URL}/login`, { username, password });
            const { jwtToken, isAuthenticated } = response.data.result;

            if (isAuthenticated && jwtToken) {
                await SecureStore.setItemAsync("jwtToken", jwtToken);
            }

            return response.data.result;
        } catch (error: any) {
            console.log("Error in LOGIN: ", error.message, error.response?.data)
            throw error.response?.data || "Sai tài khoản hoặc mật khẩu";
        }
    },

    logout: async () => {
        try {
            await apiClient.post(`${BASE_URL}/logout`);
        } catch (error) {
            console.log("Error in LOGOUT: ", error)
        } finally {
            await SecureStore.deleteItemAsync("jwtToken");
        }
    },

    greet: async () => {
        try {
            const response = await apiClient.get(`${BASE_URL}/greet`);
            return response.data;
        } catch (error: any) {
            console.log("Error in GREET: ", error)
            throw error.response?.data || "Không thể lấy câu chào.";
        }
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        try {
            // Theo document API, dùng method PATCH cho /user/change-password
            const response = await apiClient.patch(`${BASE_URL}/change-password`, { 
                currentPassword, 
                newPassword 
            });
            return response.data.result;
        } catch (error: any) {
            console.log("Error in CHANGE PASSWORD: ", error);
            // Ném lỗi từ Backend ra (Ví dụ: "Wrong password")
            throw error.response?.data || "Lỗi kết nối khi đổi mật khẩu";
        }
    },
};
