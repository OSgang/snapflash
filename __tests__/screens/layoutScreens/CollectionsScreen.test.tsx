import { fireEvent, render, screen } from "@testing-library/react-native";
import CollectionsScreen from "@/screens/layoutScreens/CollectionsScreen";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ push: mockPush }),
}));

describe("CollectionsScreen", () => {
    it("renders search and categories", () => {
        render(<CollectionsScreen />);
        expect(screen.getByPlaceholderText("Search your collections...")).toBeTruthy();
        expect(screen.getByText("Starred")).toBeTruthy();
    });

    it("opens quick menu and navigates to edit", () => {
        render(<CollectionsScreen />);
        fireEvent.press(screen.getByText("Economics")); // Mở menu
        expect(screen.getByText("Edit")).toBeTruthy();

        fireEvent.press(screen.getByText("Edit"));
        expect(mockPush).toHaveBeenCalledWith({
            pathname: "/deck",
            params: { id: "2", title: "Economics" },
        });
    });
});
