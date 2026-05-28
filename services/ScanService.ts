import apiClient from "./apiConfig";
import * as SecureStore from "expo-secure-store";
import * as ImageManipulator from "expo-image-manipulator";

export const ScanService = {
    scanImage: async (imageUri: string) => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(imageUri, [{ resize: { width: 1024 } }], {
                compress: 0.6,
                format: ImageManipulator.SaveFormat.JPEG,
            });

            const token = await SecureStore.getItemAsync("jwtToken");
            const baseURL = apiClient.defaults.baseURL;

            const formData = new FormData();

            formData.append("multipartFile", {
                uri: manipResult.uri,
                name: "scan.jpg",
                type: "image/jpeg",
            } as any);

            const response = await fetch(`${baseURL}/scan`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                body: formData,
            });

            const responseData = await response.json();

            if (response.status !== 200) {
                throw responseData.message || "Lỗi server khi phân tích ảnh";
            }

            return responseData.result;
        } catch (error: any) {
            console.log("Error in SCAN IMAGE: ", error);
            throw error;
        }
    },

    lookupWord: async (word: string) => {
        try {
            const response = await apiClient.get("/lookup", {
                params: { word },
            });
            return response.data.result;
        } catch (error: any) {
            console.log("Error in LOOKUP WORD: ", error);
            throw error.response?.data || "Không thể tra cứu từ vựng này";
        }
    },
};
