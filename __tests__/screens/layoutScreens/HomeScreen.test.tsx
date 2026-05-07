import { fireEvent, render, screen } from "@testing-library/react-native";
import HomeScreen from "@/screens/layoutScreens/HomeScreen";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ push: mockPush }),
}));

describe("HomeScreen", () => {
    it("renders overview and daily goals", () => {
        render(<HomeScreen />);
        expect(screen.getByText("SnapFlash")).toBeTruthy();
        expect(screen.getByText("Daily Goal")).toBeTruthy();
        expect(screen.getByText("Ready to Review")).toBeTruthy();
    });

    it("navigates to card when deck is pressed", () => {
        render(<HomeScreen />);
        fireEvent.press(screen.getByText("Houses"));
        expect(mockPush).toHaveBeenCalledWith({
            pathname: "/card",
            params: { id: "1", title: "Houses" },
        });
    });
});
