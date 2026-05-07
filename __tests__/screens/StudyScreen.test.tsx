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
        jest.useRealTimers();
    });

    it("moves through flashcards and shows end screen", () => {
        render(<StudyScreen />);
        expect(screen.getByText("Capitalism")).toBeTruthy();

        const correctBtn = screen.getByText("check");

        fireEvent.press(correctBtn);
        act(() => {
            jest.advanceTimersByTime(300);
        });

        fireEvent.press(correctBtn);
        act(() => {
            jest.advanceTimersByTime(300);
        });

        fireEvent.press(correctBtn);
        act(() => {
            jest.advanceTimersByTime(300);
        });

        fireEvent.press(correctBtn);
        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(screen.getByText("Awesome!")).toBeTruthy();
    });
});
