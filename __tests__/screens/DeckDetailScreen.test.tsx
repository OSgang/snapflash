import { fireEvent, render, screen } from "@testing-library/react-native";
import DeckDetailScreen from "@/screens/DeckDetailScreen";
import { DeckService } from "@/services/DeckService";
import * as SecureStore from "expo-secure-store";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: mockBack, push: mockPush }),
    useLocalSearchParams: () => ({ id: "deck-1", title: "My Economics Deck" }),
    useFocusEffect: (callback: any) => {
        const React = require("react");
        React.useEffect(() => callback(), [callback]);
    },
    Stack: { Screen: () => null },
}));

jest.mock("@/services/DeckService", () => ({
    DeckService: {
        getDeckById: jest.fn(),
    },
}));

const cards = [
    {
        flashcardId: "1",
        word: "Capitalism",
        translation: "chu nghia tu ban",
        definition: "[Noun] Economic system",
    },
];

describe("DeckDetailScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
        (DeckService.getDeckById as jest.Mock).mockResolvedValue(cards);
    });

    it("renders vocabulary list from the selected deck", async () => {
        render(<DeckDetailScreen />);

        expect(await screen.findByText("Capitalism")).toBeTruthy();
        expect(screen.getByText("My Economics Deck")).toBeTruthy();
    });

    it("navigates to edit screen from an expanded card", async () => {
        render(<DeckDetailScreen />);

        fireEvent.press(await screen.findByText("Capitalism"));
        fireEvent.press(screen.getByText("Sửa Thẻ"));

        expect(mockPush).toHaveBeenCalledWith({
            pathname: "/edit-card",
            params: {
                mode: "edit",
                deckId: "deck-1",
                deckTitle: "My Economics Deck",
                cardId: "1",
                word: "Capitalism",
                translation: "chu nghia tu ban",
                definition: "[Noun] Economic system",
            },
        });
    });

    it("navigates to add a new card", async () => {
        render(<DeckDetailScreen />);

        await screen.findByText("My Economics Deck");
        fireEvent.press(screen.getByText("Thêm Thẻ Mới"));

        expect(mockPush).toHaveBeenCalledWith({
            pathname: "/edit-card",
            params: { mode: "add", deckId: "deck-1", deckTitle: "My Economics Deck" },
        });
    });

    it("collapses an expanded card and supports closing the deck", async () => {
        render(<DeckDetailScreen />);

        fireEvent.press(await screen.findByText("Capitalism"));
        expect(screen.getByText("Definition")).toBeTruthy();
        fireEvent.press(screen.getByText("Capitalism"));
        expect(screen.queryByText("Definition")).toBeNull();

        fireEvent.press(screen.getByText("check"));
        expect(mockBack).toHaveBeenCalled();
    });

    it("renders an empty state when the deck has no cards", async () => {
        (DeckService.getDeckById as jest.Mock).mockResolvedValueOnce([]);

        render(<DeckDetailScreen />);

        expect(await screen.findByText("Bộ bài này hiện chưa có thẻ nào.")).toBeTruthy();
    });

    it("loads stored theme and supports the top back button", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("dark");

        render(<DeckDetailScreen />);

        await screen.findByText("Capitalism");
        fireEvent.press(screen.getByText("left"));
        expect(mockBack).toHaveBeenCalled();
    });

    it("renders empty state when deck loading fails", async () => {
        jest.spyOn(console, "log").mockImplementationOnce(jest.fn());
        (DeckService.getDeckById as jest.Mock).mockRejectedValueOnce("network");

        render(<DeckDetailScreen />);

        expect(await screen.findByText("Bộ bài này hiện chưa có thẻ nào.")).toBeTruthy();
    });
});
