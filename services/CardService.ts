import apiClient from "./apiConfig";

const BASE_URL = "/card";

export const CardService = {
    createCard: async (deckId: string, word: string, translation: string, definition: string) => {
        try {
            const response = await apiClient.post(`${BASE_URL}/new`, {
                deckId,
                word,
                translation,
                definition,
            });
            return response.data.result;
        } catch (error: any) {
            console.log("Error in CREATE CARD: ", error);
            throw error.response?.data || "Không thể tạo thẻ mới";
        }
    },

    updateFlipCount: async (updates: { cardId: string; flipCount: number }[]) => {
        try {
            const response = await apiClient.patch(`${BASE_URL}/update-flip-count`, updates);
            return response.data.result;
        } catch (error: any) {
            console.log("Error in UPDATE FLIP COUNT: ", error);
            throw error.response?.data || "Không thể cập nhật tiến độ lật thẻ";
        }
    },

    getLearningJourney: async () => {
        try {
            const response = await apiClient.get(`${BASE_URL}/learning-journey`);
            return response.data.result;
        } catch (error: any) {
            console.log("Error in GET LEARNING JOURNEY: ", error);
            throw error.response?.data || "Không thể tải lộ trình học tập";
        }
    },

    getToughestWords: async (limit: number = 10) => {
        try {
            const response = await apiClient.get(`${BASE_URL}/toughest-words`, {
                params: { limit },
            });
            return response.data.result;
        } catch (error: any) {
            console.log("Error in GET TOUGHEST WORDS: ", error);
            throw error.response?.data || "Không thể tải danh sách từ khó";
        }
    },
};
