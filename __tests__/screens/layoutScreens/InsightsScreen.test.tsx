import { fireEvent, render, screen } from "@testing-library/react-native";
import InsightsScreen from "@/screens/layoutScreens/InsightsScreen";
import { CardService } from "@/services/CardService";
import { StatsCacheService } from "@/services/StatsCacheService";

jest.mock("@/services/CardService", () => ({
    CardService: {
        getToughestWords: jest.fn(),
        getLearningJourney: jest.fn(),
    },
}));

jest.mock("@/services/StatsCacheService", () => ({
    StatsCacheService: {
        getStats: jest.fn(),
    },
}));

describe("InsightsScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (CardService.getToughestWords as jest.Mock).mockResolvedValue([
            { flashcardId: "1", word: "Capitalism", flipCount: 4 },
            { flashcardId: "2", word: "Market", flipCount: 3 },
        ]);
        (CardService.getLearningJourney as jest.Mock).mockResolvedValue({
            mastered: [{}, {}],
            learning: [{}, {}, {}],
        });
        (StatsCacheService.getStats as jest.Mock).mockResolvedValue({
            streak: 12,
            accuracy: 92,
            timeSpentMins: 25,
            snapCreated: 5,
            wordsStudiedToday: 10,
            lastStudyDate: "2026-05-28",
        });
    });

    it("renders loaded metrics and toughest words", async () => {
        render(<InsightsScreen />);

        expect(screen.getByText("Activity Metrics")).toBeTruthy();
        expect(await screen.findByText("Capitalism")).toBeTruthy();
        expect(screen.getByText("25m")).toBeTruthy();
        expect(screen.getByText("4 flips")).toBeTruthy();
    });

    it("switches filters and hides chart-only content for Today", async () => {
        render(<InsightsScreen />);

        expect(await screen.findByText("Capitalism")).toBeTruthy();
        fireEvent.press(screen.getByText("Today"));

        expect(screen.queryByText("Weekly Progress & Forecast")).toBeNull();
        expect(screen.getByText("Review Now")).toBeTruthy();
    });

    it("renders empty toughest-word state", async () => {
        (CardService.getToughestWords as jest.Mock).mockResolvedValueOnce([]);

        render(<InsightsScreen />);

        expect(await screen.findByText("Bạn đang học rất tốt, chưa có từ nào làm khó được bạn!")).toBeTruthy();
    });
});
