import { fireEvent, render, screen } from "@testing-library/react-native";
import SignUpScreen from "@/screens/authenticationScreens/SignUpScreen";

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ replace: mockReplace, back: mockBack }),
}));

describe("SignUpScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders signup form", () => {
        render(<SignUpScreen />);
        expect(screen.getByPlaceholderText("Enter your email...")).toBeTruthy();
        expect(screen.getByPlaceholderText("Re-enter your password...")).toBeTruthy();
    });

    it("navigates to tabs on signup", () => {
        render(<SignUpScreen />);
        const buttons = screen.getAllByText("Sign up");
        fireEvent.press(buttons[buttons.length - 1]);
        expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    });

    it("goes back when arrow is pressed", () => {
        render(<SignUpScreen />);
        fireEvent.press(screen.getByText("arrow-back"));
        expect(mockBack).toHaveBeenCalled();
    });
});
