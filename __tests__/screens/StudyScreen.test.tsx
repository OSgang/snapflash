import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import StudyScreen from "@/screens/StudyScreen";
import { DeckService } from "@/services/DeckService";
import { CardService } from "@/services/CardService";
import { StatsCacheService } from "@/services/StatsCacheService";
import * as SecureStore from "expo-secure-store";

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
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
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

    it("handles tap and short drag gestures on the flashcard", async () => {
        const view = render(<StudyScreen />);

        expect(await screen.findByText("Capitalism")).toBeTruthy();

        const swipeTarget = view.UNSAFE_root.findAll(
            (node) =>
                typeof node.props.onResponderMove === "function" &&
                typeof node.props.onResponderRelease === "function" &&
                Array.isArray(node.props.style) &&
                node.props.style.some((style: any) => style?.zIndex === 10),
        )[0];
        const touchEvent = (currentX: number, previousX: number, timestamp: number) => ({
            touchHistory: {
                numberActiveTouches: 1,
                indexOfSingleActiveTouch: 0,
                mostRecentTimeStamp: timestamp,
                touchBank: [
                    {
                        touchActive: true,
                        currentPageX: currentX,
                        currentPageY: 0,
                        previousPageX: previousX,
                        previousPageY: 0,
                        currentTimeStamp: timestamp,
                    },
                ],
            },
        });

        act(() => {
            swipeTarget.props.onResponderGrant(touchEvent(0, 0, 1));
            swipeTarget.props.onResponderRelease(touchEvent(2, 0, 2));
        });
        expect(screen.getByText("chu nghia tu ban")).toBeTruthy();

        act(() => {
            swipeTarget.props.onResponderGrant(touchEvent(0, 0, 3));
            swipeTarget.props.onResponderMove(touchEvent(40, 0, 4));
            swipeTarget.props.onResponderRelease(touchEvent(40, 0, 5));
        });
        expect(screen.getByText("Capitalism")).toBeTruthy();

        fireEvent.press(screen.getByText("check"));
        act(() => {
            jest.advanceTimersByTime(300);
        });
        expect(await screen.findByText("Market")).toBeTruthy();
    });

    it("shows bracketless definitions with the default Word type", async () => {
        (DeckService.getDeckById as jest.Mock).mockResolvedValueOnce([
            { ...flashcards[0], definition: "Plain definition" },
        ]);

        render(<StudyScreen />);

        expect(await screen.findByText("Capitalism")).toBeTruthy();
        fireEvent.press(screen.getAllByText("Tap to flip")[0]);

        expect(screen.getByText("Word")).toBeTruthy();
        expect(screen.getByText("Plain definition")).toBeTruthy();
    });

    it("shows malformed bracket definitions as plain text", async () => {
        (DeckService.getDeckById as jest.Mock).mockResolvedValueOnce([
            { ...flashcards[0], definition: "[Broken definition" },
        ]);

        render(<StudyScreen />);

        expect(await screen.findByText("Capitalism")).toBeTruthy();
        fireEvent.press(screen.getAllByText("Tap to flip")[0]);

        expect(screen.getByText("Word")).toBeTruthy();
        expect(screen.getByText("[Broken definition")).toBeTruthy();
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

    it("uses a stored dark theme preference while loading cards", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("dark");

        render(<StudyScreen />);

        expect(await screen.findByText("Capitalism")).toBeTruthy();
    });
});
