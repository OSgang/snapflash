import { fireEvent, render, screen } from "@testing-library/react-native";
import HomeScreen from "@/screens/layoutScreens/HomeScreen";
import { DeckService } from "@/services/DeckService";
import { CardService } from "@/services/CardService";
import { StatsCacheService } from "@/services/StatsCacheService";
import * as SecureStore from "expo-secure-store";

const mockPush = jest.fn();
const mockNavigate = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ push: mockPush, navigate: mockNavigate }),
    useFocusEffect: (callback: any) => {
        const React = require("react");
        React.useEffect(() => callback(), [callback]);
    },
    Stack: { Screen: () => null },
}));

jest.mock("@/services/DeckService", () => ({
    DeckService: {
        getAllDecks: jest.fn(),
    },
}));

jest.mock("@/services/CardService", () => ({
    CardService: {
        getLearningJourney: jest.fn(),
    },
}));

jest.mock("@/services/StatsCacheService", () => ({
    StatsCacheService: {
        getStats: jest.fn(),
    },
}));

describe("HomeScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
        (DeckService.getAllDecks as jest.Mock).mockResolvedValue([
            { deckId: "1", deckName: "Houses", flashcards: [{}, {}], lastUpdate: new Date().toISOString() },
        ]);
        (CardService.getLearningJourney as jest.Mock).mockResolvedValue({
            learning: [{}, {}, {}],
            mastered: [{}],
        });
        (StatsCacheService.getStats as jest.Mock).mockResolvedValue({
            wordsStudiedToday: 8,
            streak: 1,
            accuracy: 80,
            timeSpentMins: 10,
            snapCreated: 2,
            lastStudyDate: "2026-05-28",
        });
    });

    it("renders overview, daily goals, and loaded decks", async () => {
        render(<HomeScreen />);

        expect(screen.getByText("SnapFlash")).toBeTruthy();
        expect(screen.getByText("Daily Goal")).toBeTruthy();
        expect(await screen.findByText("Houses")).toBeTruthy();
        expect(screen.getByText("3 cards need your attention")).toBeTruthy();
        expect(screen.getByText("8 / 20 words")).toBeTruthy();
    });

    it("navigates to card and collections routes", async () => {
        render(<HomeScreen />);

        fireEvent.press(await screen.findByText("Houses"));
        expect(mockPush).toHaveBeenCalledWith({
            pathname: "/card",
            params: { id: "1", title: "Houses" },
        });

        fireEvent.press(screen.getByText("See all"));
        expect(mockNavigate).toHaveBeenCalledWith("/collections");
    });

    it("renders the empty deck state", async () => {
        (DeckService.getAllDecks as jest.Mock).mockResolvedValueOnce([]);

        render(<HomeScreen />);

        expect(await screen.findByText("Bạn chưa có bộ bài nào. Hãy tạo mới nhé!")).toBeTruthy();
    });

    it("uses stored goal and theme values", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
            if (key === "dailyGoal") return Promise.resolve("10");
            if (key === "themePreference") return Promise.resolve("dark");
            return Promise.resolve(null);
        });

        render(<HomeScreen />);

        expect(await screen.findByText("8 / 10 words")).toBeTruthy();
        expect(screen.getByText("Just 2 more words to reach your goal! 🔥")).toBeTruthy();
    });

    it("falls back to the empty state when loading home data fails", async () => {
        jest.spyOn(console, "log").mockImplementationOnce(jest.fn());
        (DeckService.getAllDecks as jest.Mock).mockRejectedValueOnce("network");

        render(<HomeScreen />);

        expect(await screen.findByText("Bạn chưa có bộ bài nào. Hãy tạo mới nhé!")).toBeTruthy();
    });
});
