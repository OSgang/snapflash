import { Alert } from "react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import SignUpScreen from "@/screens/authenticationScreens/SignUpScreen";
import { AuthService } from "@/services/AuthService";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ replace: jest.fn(), back: mockBack }),
    Stack: { Screen: () => null },
}));

jest.mock("@/services/AuthService", () => ({
    AuthService: {
        register: jest.fn(),
    },
}));

describe("SignUpScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, "alert").mockImplementation(jest.fn((_, __, buttons) => buttons?.[0]?.onPress?.()));
        (AuthService.register as jest.Mock).mockResolvedValue({});
    });

    it("renders signup form", () => {
        render(<SignUpScreen />);
        expect(screen.getByPlaceholderText("Enter your email...")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter your username...")).toBeTruthy();
        expect(screen.getByPlaceholderText("Re-enter your password...")).toBeTruthy();
    });

    it("validates required fields and password mismatch", () => {
        render(<SignUpScreen />);
        fireEvent.press(screen.getByText("Sign up"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Please fill in all required fields.");

        fireEvent.changeText(screen.getByPlaceholderText("Enter your email..."), "email@example.com");
        fireEvent.changeText(screen.getByPlaceholderText("Enter your username..."), "username");
        fireEvent.changeText(screen.getByPlaceholderText("Enter your password..."), "one");
        fireEvent.changeText(screen.getByPlaceholderText("Re-enter your password..."), "two");
        fireEvent.press(screen.getByText("Sign up"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Passwords do not match.");
    });

    it("registers and returns to login", async () => {
        render(<SignUpScreen />);
        fireEvent.changeText(screen.getByPlaceholderText("Enter your email..."), "email@example.com");
        fireEvent.changeText(screen.getByPlaceholderText("Enter your username..."), "username");
        fireEvent.changeText(screen.getByPlaceholderText("Enter your password..."), "secret");
        fireEvent.changeText(screen.getByPlaceholderText("Re-enter your password..."), "secret");
        fireEvent.press(screen.getByText("Sign up"));

        await waitFor(() => {
            expect(AuthService.register).toHaveBeenCalledWith("email@example.com", "username", "secret");
            expect(mockBack).toHaveBeenCalled();
        });
    });
});
