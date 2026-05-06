import { fireEvent, render, screen } from "@testing-library/react-native";
import SettingsScreen from "@/screens/layoutScreens/SettingsScreen";

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ replace: mockReplace }),
}));

describe("SettingsScreen", () => {
    it("renders profile and settings groups", () => {
        render(<SettingsScreen />);
        expect(screen.getByText("Đậu Minh Khôi")).toBeTruthy();
        expect(screen.getByText("STUDY PREFERENCES")).toBeTruthy();
        expect(screen.getByText("Dark Mode")).toBeTruthy();
    });

    it("logs out on button press", () => {
        render(<SettingsScreen />);
        fireEvent.press(screen.getByText("Log Out"));
        expect(mockReplace).toHaveBeenCalledWith("/login");
    });
});
