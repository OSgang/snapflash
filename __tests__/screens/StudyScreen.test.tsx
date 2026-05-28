import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import StudyScreen from "@/screens/StudyScreen";
import { DeckService } from "@/services/DeckService";
import { CardService } from "@/services/CardService";
import { StatsCacheService } from "@/services/StatsCacheService";

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
    useLocalSearchParams: () => ({ id: "deck-1" }),
    Stack: { Screen: () => null },
}));

jest.mock("@/services/DeckService", () => ({
    DeckService: {
        getDeckById: jest.fn(),
    },
}));

jest.mock("@/services/CardService", () => ({
    CardService: {
        updateFlipCount: jest.fn(),
    },
}));

jest.mock("@/services/StatsCacheService", () => ({
    StatsCacheService: {
        addStudyTime: jest.fn(),
    },
}));

const flashcards = [
    { flashcardId: "1", word: "Capitalism", translation: "chu nghia tu ban", definition: "[Noun] Economic system", flipCount: 2 },
    { flashcardId: "2", word: "Market", translation: "thi truong", definition: "[Noun] Trading place", flipCount: 0 },
    { flashcardId: "3", word: "Supply", translation: "cung", definition: "[Noun] Available goods", flipCount: 1 },
    { flashcardId: "4", word: "Demand", translation: "cau", definition: "[Noun] Buyer need", flipCount: 3 },
];

describe("StudyScreen", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        (DeckService.getDeckById as jest.Mock).mockResolvedValue(flashcards);
        (CardService.updateFlipCount as jest.Mock).mockResolvedValue({});
        (StatsCacheService.addStudyTime as jest.Mock).mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it("loads deck cards and moves through the deck", async () => {
        render(<StudyScreen />);

        expect(await screen.findByText("Capitalism")).toBeTruthy();

        for (let i = 0; i < flashcards.length; i++) {
            fireEvent.press(screen.getByText("check"));
            act(() => {
                jest.advanceTimersByTime(300);
            });
        }

        await waitFor(() => expect(screen.getByText("Awesome!")).toBeTruthy());
        expect(StatsCacheService.addStudyTime).toHaveBeenCalledWith(expect.any(Number), 4, 4);
    });

    it("tracks incorrect cards and updates flip counts at the end", async () => {
        render(<StudyScreen />);

        expect(await screen.findByText("Capitalism")).toBeTruthy();
        fireEvent.press(screen.getByText("close"));
        act(() => {
            jest.advanceTimersByTime(300);
        });

        for (let i = 1; i < flashcards.length; i++) {
            fireEvent.press(screen.getByText("check"));
            act(() => {
                jest.advanceTimersByTime(300);
            });
        }

        await waitFor(() => {
            expect(CardService.updateFlipCount).toHaveBeenCalledWith([{ cardId: "1", flipCount: 3 }]);
        });
    });

    it("can reset the deck after completion", async () => {
        render(<StudyScreen />);

        expect(await screen.findByText("Capitalism")).toBeTruthy();
        for (let i = 0; i < flashcards.length; i++) {
            fireEvent.press(screen.getByText("check"));
            act(() => {
                jest.advanceTimersByTime(300);
            });
        }

        fireEvent.press(await screen.findByText("Học lại từ đầu"));
        expect(screen.getByText("Capitalism")).toBeTruthy();
    });

    it("handles flip-count update failures without leaving the end screen", async () => {
        (CardService.updateFlipCount as jest.Mock).mockRejectedValueOnce("offline");

        render(<StudyScreen />);

        expect(await screen.findByText("Capitalism")).toBeTruthy();
        fireEvent.press(screen.getByText("close"));
        act(() => {
            jest.advanceTimersByTime(300);
        });
        for (let i = 1; i < flashcards.length; i++) {
            fireEvent.press(screen.getByText("check"));
            act(() => {
                jest.advanceTimersByTime(300);
            });
        }

        expect(await screen.findByText("Awesome!")).toBeTruthy();
    });

    it("handles deck load errors", async () => {
        (DeckService.getDeckById as jest.Mock).mockRejectedValueOnce("network");

        render(<StudyScreen />);

        expect(await screen.findByText("Bộ bài này chưa có thẻ nào. Hãy thêm thẻ trước nhé!")).toBeTruthy();
    });

    it("shows an empty deck message when the deck has no cards", async () => {
        (DeckService.getDeckById as jest.Mock).mockResolvedValueOnce([]);

        render(<StudyScreen />);

        expect(await screen.findByText("Bộ bài này chưa có thẻ nào. Hãy thêm thẻ trước nhé!")).toBeTruthy();
    });
});
