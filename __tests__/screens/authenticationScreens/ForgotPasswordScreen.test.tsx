import { Alert } from "react-native";
import { render, screen, waitFor } from "@testing-library/react-native";
import ForgotPasswordScreen from "@/screens/authenticationScreens/ForgotPasswordScreen";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: mockBack }),
    Stack: { Screen: () => null },
}));

describe("ForgotPasswordScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, "alert").mockImplementation(jest.fn((_, __, buttons) => buttons?.[0]?.onPress?.()));
    });

    it("renders reset form", () => {
        render(<ForgotPasswordScreen />);
        expect(screen.getByPlaceholderText("Enter your email")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter new password")).toBeTruthy();
        expect(screen.getByPlaceholderText("Confirm new password")).toBeTruthy();
    });

    it("shows the under-development notice and navigates back", async () => {
        render(<ForgotPasswordScreen />);
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "Notice",
                "The Forgot Password feature is currently under development!",
                expect.any(Array),
            );
            expect(mockBack).toHaveBeenCalled();
        });
    });
});
