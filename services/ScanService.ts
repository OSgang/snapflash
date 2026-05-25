import apiClient from "./apiConfig";

export const ScanService = {
    scanImage: async (imageUri: string) => {
        try {
            const formData = new FormData();
            const filename = imageUri.split("/").pop() || "scan_image.jpg";
            const match = /\.([^.]+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append("multipartFile", {
                uri: imageUri,
                name: filename,
                type,
            } as any);

            const response = await apiClient.post("/scan", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data.result;
        } catch (error: any) {
            console.log("Error in SCAN IMAGE: ", error);
            throw error.response?.data || "Lỗi hệ thống khi phân tích hình ảnh";
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
