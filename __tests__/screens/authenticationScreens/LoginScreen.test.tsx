import { fireEvent, render, screen } from "@testing-library/react-native";
import LoginScreen from "@/screens/authenticationScreens/LoginScreen";

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

describe("LoginScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders all inputs and buttons", () => {
        render(<LoginScreen />);
        expect(screen.getByPlaceholderText("Enter your email...")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter your password...")).toBeTruthy();
        expect(screen.getByText("Sign in")).toBeTruthy();
    });

    it("allows typing into inputs", () => {
        render(<LoginScreen />);
        const emailInput = screen.getByPlaceholderText("Enter your email...");
        fireEvent.changeText(emailInput, "example@example.com");
        expect(emailInput.props.value).toBe("example@example.com");
    });

    it("navigates on button presses", () => {
        render(<LoginScreen />);
        fireEvent.press(screen.getByText("Sign in"));
        expect(mockReplace).toHaveBeenCalledWith("/(tabs)");

        fireEvent.press(screen.getByText("Sign up"));
        expect(mockPush).toHaveBeenCalledWith("/signup");
    });
});
