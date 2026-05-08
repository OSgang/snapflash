import { fireEvent, render, screen } from "@testing-library/react-native";
import ScanScreen from "@/screens/ScanScreen";

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
    Stack: { Screen: () => null },
}));

describe("ScanScreen", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it("renders scanner and toggles language sheet", () => {
        render(<ScanScreen />);

        expect(screen.getByText("Scan your documents")).toBeTruthy();

        // Tìm và bấm nút chọn ngôn ngữ
        const englishTexts = screen.getAllByText("English");
        fireEvent.press(englishTexts[0]);

        expect(screen.getByText("Select Language")).toBeTruthy();
        expect(screen.getByText("Vietnamese")).toBeTruthy();
    });
});
