import { fireEvent, render, screen, act } from "@testing-library/react-native";
import StudyScreen from "@/screens/StudyScreen";

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
    Stack: { Screen: () => null },
}));

describe("StudyScreen", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it("moves through flashcards and shows end screen", () => {
        render(<StudyScreen />);
        expect(screen.getByText("Capitalism")).toBeTruthy();

        const correctBtn = screen.getByText("check");

        for (let i = 0; i < 4; i++) {
            fireEvent.press(correctBtn);
            act(() => {
                jest.advanceTimersByTime(300);
            });
        }

        expect(screen.getByText("Awesome!")).toBeTruthy();
    });

    it("cho phép học lại từ đầu khi hoàn thành", () => {
        render(<StudyScreen />);
        const correctBtn = screen.getByText("check");

        for (let i = 0; i < 4; i++) {
            fireEvent.press(correctBtn);
            act(() => { jest.advanceTimersByTime(300); });
        }
        
        const resetBtn = screen.getByText("Học lại từ đầu");
        fireEvent.press(resetBtn);
        expect(screen.getByText("Capitalism")).toBeTruthy();
    });
});