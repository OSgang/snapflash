import { Alert } from "react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import LoginScreen from "@/screens/authenticationScreens/LoginScreen";
import { AuthService } from "@/services/AuthService";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockPrefetch = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ replace: mockReplace, push: mockPush, prefetch: mockPrefetch }),
    Stack: { Screen: () => null },
}));

jest.mock("@/services/AuthService", () => ({
    AuthService: {
        login: jest.fn(),
    },
}));

describe("LoginScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
        (AuthService.login as jest.Mock).mockResolvedValue({ jwtToken: "token" });
    });

    it("renders all inputs and buttons", () => {
        render(<LoginScreen />);
        expect(screen.getByPlaceholderText("Enter your username...")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter your password...")).toBeTruthy();
        expect(screen.getByText("Sign in")).toBeTruthy();
    });

    it("validates empty login form", () => {
        render(<LoginScreen />);
        fireEvent.press(screen.getByText("Sign in"));
        expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng nhập đầy đủ Username và Password");
    });

    it("logs in and navigates to tabs", async () => {
        render(<LoginScreen />);
        fireEvent.changeText(screen.getByPlaceholderText("Enter your username..."), "example");
        fireEvent.changeText(screen.getByPlaceholderText("Enter your password..."), "secret");
        fireEvent.press(screen.getByText("Sign in"));

        await waitFor(() => {
            expect(AuthService.login).toHaveBeenCalledWith("example", "secret");
            expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
        });
    });

    it("navigates on secondary actions", () => {
        render(<LoginScreen />);
        fireEvent.press(screen.getByText("Sign up"));
        expect(mockPush).toHaveBeenCalledWith("/signup");
        fireEvent.press(screen.getByText("Forgot password?"));
        expect(mockPush).toHaveBeenCalledWith("/forgot-password");
    });
});
