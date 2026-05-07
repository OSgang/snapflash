import { fireEvent, render, screen } from "@testing-library/react-native";
import ForgotPasswordScreen from "@/screens/authenticationScreens/ForgotPasswordScreen";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ back: mockBack }),
}));

describe("ForgotPasswordScreen", () => {
    it("renders reset form", () => {
        render(<ForgotPasswordScreen />);
        expect(screen.getByPlaceholderText("Enter your email...")).toBeTruthy();
        expect(screen.getByPlaceholderText("Confirm new password...")).toBeTruthy();
    });

    it("navigates back on reset", () => {
        render(<ForgotPasswordScreen />);
        fireEvent.press(screen.getByText("Reset password"));
        expect(mockBack).toHaveBeenCalled();
    });
});
