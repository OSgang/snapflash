import apiClient from "./apiConfig";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

export const ScanService = {
    scanImage: async (imageUri: string) => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                imageUri,
                [],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );

            const token = await SecureStore.getItemAsync("jwtToken");
            const baseURL = apiClient.defaults.baseURL;

            const response = await FileSystem.uploadAsync(`${baseURL}/scan`, manipResult.uri, {
                fieldName: "multipartFile",
                httpMethod: "POST",
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                mimeType: "image/jpeg",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const responseData = JSON.parse(response.body);

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