import { fireEvent, render, screen } from "@testing-library/react-native";
import ChangePasswordScreen from "@/app/settings/change-password";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ back: mockBack }),
}));

describe("ChangePasswordScreen", () => {
    it("báo lỗi nếu nhập mật khẩu không khớp", () => {
        render(<ChangePasswordScreen />);

        fireEvent.changeText(screen.getByPlaceholderText("Enter current password"), "old123");
        fireEvent.changeText(screen.getByPlaceholderText("Enter new password"), "new123");
        fireEvent.changeText(screen.getByPlaceholderText("Confirm new password"), "wrong123");

        fireEvent.press(screen.getByText("Update Password"));
        
        expect(screen.getByText("Password Mismatch")).toBeTruthy();
    });

    it("lưu thành công khi nhập đúng", () => {
        render(<ChangePasswordScreen />);

        fireEvent.changeText(screen.getByPlaceholderText("Enter current password"), "old123");
        fireEvent.changeText(screen.getByPlaceholderText("Enter new password"), "new123");
        fireEvent.changeText(screen.getByPlaceholderText("Confirm new password"), "new123");

        fireEvent.press(screen.getByText("Update Password"));
        expect(mockBack).toHaveBeenCalled();
    });
});
