import { Alert } from "react-native";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import EditCardScreen from "@/screens/EditCardScreen";
import { CardService } from "@/services/CardService";

let mockParams: Record<string, string> = {};
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: mockBack }),
    useLocalSearchParams: () => mockParams,
    Stack: { Screen: () => null },
}));

jest.mock("@/services/CardService", () => ({
    CardService: {
        createCard: jest.fn(),
    },
}));

describe("EditCardScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.spyOn(Alert, "alert").mockImplementation(jest.fn((_, __, buttons) => buttons?.[0]?.onPress?.()));
        (CardService.createCard as jest.Mock).mockResolvedValue({});
        mockParams = {
            mode: "edit",
            deckId: "deck-1",
            deckTitle: "Economics",
            cardId: "card-1",
            word: "Capitalism",
            translation: "Capitalism meaning",
            definition: "[Noun] Economic system",
        };
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it("renders edit data and type selectors", async () => {
        render(<EditCardScreen />);

        expect(await screen.findByDisplayValue("Capitalism")).toBeTruthy();
        expect(screen.getByDisplayValue("Capitalism meaning")).toBeTruthy();
        expect(screen.getByDisplayValue("Economic system")).toBeTruthy();
        expect(screen.getByText("Noun")).toBeTruthy();
    });

    it("selects word type without crashing", () => {
        render(<EditCardScreen />);
        fireEvent.press(screen.getByText("Adjective"));
        expect(screen.getByText("Adjective")).toBeTruthy();
    });

    it("validates required fields before adding a card", () => {
        mockParams = { mode: "add", deckId: "deck-1", deckTitle: "Economics" };

        render(<EditCardScreen />);
        fireEvent.press(screen.getByText("check"));

        expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng nhập Front (Từ vựng) và Back (Nghĩa)");
    });

    it("creates a new card and navigates back", async () => {
        mockParams = { mode: "add", deckId: "deck-1", deckTitle: "Economics" };

        render(<EditCardScreen />);
        fireEvent.changeText(screen.getByPlaceholderText("Ví dụ: Hello"), "apple");
        fireEvent.changeText(screen.getByPlaceholderText("Ví dụ: Xin chào"), "táo");
        fireEvent.press(screen.getByText("Noun"));
        fireEvent.changeText(screen.getByPlaceholderText("Nhập định nghĩa hoặc ví dụ..."), "A fruit");
        fireEvent.press(screen.getByText("check"));

        await waitFor(() => {
            expect(CardService.createCard).toHaveBeenCalledWith("deck-1", "apple", "táo", "[Noun] A fruit");
            expect(mockBack).toHaveBeenCalled();
        });
    });

    it("shows the edit-mode placeholder alert", async () => {
        render(<EditCardScreen />);

        expect(await screen.findByDisplayValue("Capitalism")).toBeTruthy();
        fireEvent.press(screen.getByText("check"));
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(Alert.alert).toHaveBeenCalledWith("Thông báo", "Tính năng cập nhật thẻ đang được phát triển!", expect.any(Array));
        expect(mockBack).toHaveBeenCalled();
    });
});
