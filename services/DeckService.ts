import apiClient from "./apiConfig";

const BASE_URL = "/deck";

export const DeckService = {
    // Gọi API GET /deck/all
    getAllDecks: async () => {
        try {
            const response = await apiClient.get(`${BASE_URL}/all`);
            return response.data.result; // Trả về mảng các deck
        } catch (error: any) {
            console.error("Error in GET ALL DECKS: ", error);
            throw error.response?.data || "Không thể tải danh sách bộ bài";
        }
    },

    // Gọi API GET /deck/{deckId}
    getDeckById: async (deckId: string) => {
        try {
            const response = await apiClient.get(`${BASE_URL}/${deckId}`);
            return response.data.result; // Trả về mảng các flashcards trong deck
        } catch (error: any) {
            console.error("Error in GET DECK BY ID: ", error);
            throw error.response?.data || "Không thể tải chi tiết bộ bài";
        }
    },

    // Gọi API POST /deck/new (Để dành mốt làm tính năng tạo Deck)
    createDeck: async (deckName: string, description: string = "") => {
        try {
            const response = await apiClient.post(`${BASE_URL}/new`, { deckName, description });
            return response.data.result;
        } catch (error: any) {
            console.error("Error in CREATE DECK: ", error);
            throw error.response?.data || "Không thể tạo bộ bài mới";
        }
    }
};