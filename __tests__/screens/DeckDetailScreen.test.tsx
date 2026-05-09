import { fireEvent, render, screen } from "@testing-library/react-native";
import DeckDetailScreen from "@/screens/DeckDetailScreen";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn(), push: mockPush }),
    useLocalSearchParams: () => ({ title: "My Economics Deck" }),
}));

describe("DeckDetailScreen", () => {
    it("renders vocabulary list", () => {
        render(<DeckDetailScreen />);
        expect(screen.getByText("My Economics Deck")).toBeTruthy();
        expect(screen.getByText("Capitalism")).toBeTruthy();
    });

    it("navigates to edit screen on Edit press", () => {
        render(<DeckDetailScreen />);
        fireEvent.press(screen.getByText("Edit"));
        expect(mockPush).toHaveBeenCalledWith({
            pathname: "/edit-card",
            params: { cardId: "1", word: "Capitalism" },
        });
    });

    it("đóng thẻ từ vựng khi bấm thêm lần nữa", () => {
        render(<DeckDetailScreen />);
        expect(screen.getByText("Type")).toBeTruthy();
        fireEvent.press(screen.getByText("Capitalism"));
        expect(screen.queryByText("Type")).toBeNull();
    });
});
