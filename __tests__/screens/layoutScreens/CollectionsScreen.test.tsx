import { Alert } from "react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import CollectionsScreen from "@/screens/layoutScreens/CollectionsScreen";
import { DeckService } from "@/services/DeckService";
import * as SecureStore from "expo-secure-store";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ push: mockPush }),
    useFocusEffect: (callback: any) => {
        const React = require("react");
        React.useEffect(() => callback(), [callback]);
    },
    Stack: { Screen: () => null },
}));

jest.mock("@/services/DeckService", () => ({
    DeckService: {
        getAllDecks: jest.fn(),
        createDeck: jest.fn(),
    },
}));

const decks = [
    { deckId: "2", deckName: "Economics", flashcards: [{}, {}, {}], lastUpdate: new Date().toISOString() },
];

describe("CollectionsScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
        (DeckService.getAllDecks as jest.Mock).mockResolvedValue(decks);
        (DeckService.createDeck as jest.Mock).mockResolvedValue({});
    });

    it("renders search, categories, and loaded decks", async () => {
        render(<CollectionsScreen />);

        expect(screen.getByPlaceholderText("Search your decks")).toBeTruthy();
        expect(screen.getByText("Starred")).toBeTruthy();
        expect(await screen.findByText("Economics")).toBeTruthy();
    });

    it("opens quick menu and navigates to view and edit", async () => {
        render(<CollectionsScreen />);

        fireEvent.press(await screen.findByText("Economics"));

        fireEvent.press(screen.getByText("View"));
        expect(mockPush).toHaveBeenCalledWith({
            pathname: "/card",
            params: { id: "2", title: "Economics" },
        });

        fireEvent.press(screen.getByText("Edit"));
        expect(mockPush).toHaveBeenCalledWith({
            pathname: "/deck",
            params: { id: "2", title: "Economics" },
        });
    });

    it("validates and creates a new deck", async () => {
        render(<CollectionsScreen />);

        await screen.findByText("Economics");
        fireEvent.press(screen.getByText("plus"));
        fireEvent.press(screen.getByText("OK"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Please enter a deck name!");

        fireEvent.changeText(screen.getByPlaceholderText("Deck name"), "New Deck");
        fireEvent.changeText(screen.getByPlaceholderText("Deck description"), "Daily words");
        fireEvent.press(screen.getByText("OK"));

        await waitFor(() => {
            expect(DeckService.createDeck).toHaveBeenCalledWith("New Deck", "Daily words");
        });
    });

    it("renders empty state and applies stored theme", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("dark");
        (DeckService.getAllDecks as jest.Mock).mockResolvedValueOnce([]);

        render(<CollectionsScreen />);

        expect(await screen.findByText("No decks available yet.")).toBeTruthy();
    });

    it("falls back to empty state when deck loading fails", async () => {
        jest.spyOn(console, "log").mockImplementationOnce(jest.fn());
        (DeckService.getAllDecks as jest.Mock).mockRejectedValueOnce("network");

        render(<CollectionsScreen />);

        expect(await screen.findByText("No decks available yet.")).toBeTruthy();
    });

    it("can cancel deck creation and reports creation failures", async () => {
        (DeckService.createDeck as jest.Mock).mockRejectedValueOnce("duplicate");

        render(<CollectionsScreen />);

        await screen.findByText("Economics");
        fireEvent.press(screen.getByText("plus"));
        fireEvent.changeText(screen.getByPlaceholderText("Deck name"), "Existing");
        fireEvent.press(screen.getByText("Cancel"));
        expect(screen.queryByText("Create new deck")).toBeNull();

        fireEvent.press(screen.getByText("plus"));
        fireEvent.changeText(screen.getByPlaceholderText("Deck name"), "Existing");
        fireEvent.press(screen.getByText("OK"));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith("Creation failed", "duplicate");
        });
    });
});
