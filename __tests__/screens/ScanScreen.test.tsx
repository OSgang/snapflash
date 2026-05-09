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

        const englishTexts = screen.getAllByText("English");
        fireEvent.press(englishTexts[0]);

        expect(screen.getByText("Select Language")).toBeTruthy();
        expect(screen.getByText("Vietnamese")).toBeTruthy();
    });

    it("tương tác với đèn flash và tìm kiếm ngôn ngữ", () => {
        render(<ScanScreen />);

        const flashBtn = screen.getByText("flashlight-off");
        fireEvent.press(flashBtn);
        expect(screen.getByText("flashlight")).toBeTruthy();

        const englishTexts = screen.getAllByText("English");
        fireEvent.press(englishTexts[0]);

        const searchInput = screen.getByPlaceholderText("Search language...");
        fireEvent.changeText(searchInput, "Viet");

        expect(screen.getByText("Vietnamese")).toBeTruthy();
    });

    it("đóng bottom sheet quét từ vựng khi bấm Done", () => {
        render(<ScanScreen />);
        const listBtn = screen.getByText("sort-variant");
        fireEvent.press(listBtn);
        const doneBtn = screen.getByText("Done");
        fireEvent.press(doneBtn);
    });
});