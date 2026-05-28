import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import ChangePasswordScreen from "@/app/settings/change-password";
import { AuthService } from "@/services/AuthService";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: mockBack }),
    Stack: { Screen: () => null },
}));

jest.mock("@/services/AuthService", () => ({
    AuthService: {
        changePassword: jest.fn(),
    },
}));

describe("ChangePasswordScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (AuthService.changePassword as jest.Mock).mockResolvedValue({});
    });

    it("báo lỗi nếu nhập mật khẩu không khớp", () => {
        render(<ChangePasswordScreen />);

        fireEvent.changeText(screen.getByPlaceholderText("Enter current password"), "old123");
        fireEvent.changeText(screen.getByPlaceholderText("Enter new password"), "new123");
        fireEvent.changeText(screen.getByPlaceholderText("Confirm new password"), "wrong123");
        fireEvent.press(screen.getByText("Update Password"));

        expect(screen.getByText("Mật khẩu không khớp")).toBeTruthy();
        expect(screen.getByText("Mật khẩu xác nhận không trùng với mật khẩu mới. Vui lòng thử lại.")).toBeTruthy();
    });

    it("lưu thành công khi nhập đúng", async () => {
        render(<ChangePasswordScreen />);

        fireEvent.changeText(screen.getByPlaceholderText("Enter current password"), "old123456");
        fireEvent.changeText(screen.getByPlaceholderText("Enter new password"), "new123456");
        fireEvent.changeText(screen.getByPlaceholderText("Confirm new password"), "new123456");
        fireEvent.press(screen.getByText("Update Password"));

        await waitFor(() => expect(AuthService.changePassword).toHaveBeenCalledWith("old123456", "new123456"));
        fireEvent.press(screen.getByText("Got it"));
        expect(mockBack).toHaveBeenCalled();
    });
});
