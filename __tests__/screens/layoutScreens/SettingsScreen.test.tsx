import { fireEvent, render, screen } from "@testing-library/react-native";
import { Linking } from "react-native";
import SettingsScreen from "@/screens/layoutScreens/SettingsScreen";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.spyOn(Linking, "openURL").mockImplementation(jest.fn());

describe("SettingsScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("render đầy đủ giao diện và thông tin user", () => {
        render(<SettingsScreen />);
        expect(screen.getByText("Đậu Minh Khôi")).toBeTruthy();
    });

    it("điều hướng đúng khi bấm vào các mục cài đặt", () => {
        render(<SettingsScreen />);

        fireEvent.press(screen.getByText("Đậu Minh Khôi"));
        expect(mockPush).toHaveBeenCalledWith("/settings/edit-profile");

        fireEvent.press(screen.getByText("Voice & Speech"));
        expect(mockPush).toHaveBeenCalledWith("/settings/voice-speech");

        fireEvent.press(screen.getByText("Notification Settings"));
        expect(mockPush).toHaveBeenCalledWith("/settings/notifications");

        fireEvent.press(screen.getByText("Change Password"));
        expect(mockPush).toHaveBeenCalledWith("/settings/change-password");
    });

    it("mở link trình duyệt khi bấm vào Support / Privacy", () => {
        render(<SettingsScreen />);
        fireEvent.press(screen.getByText("Help Center"));
        expect(Linking.openURL).toHaveBeenCalled();
    });

    it("xử lý luồng đặt mục tiêu Daily Goal", () => {
        render(<SettingsScreen />);

        fireEvent.press(screen.getByText("Daily Goal"));
        expect(screen.getByText("Set Daily Goal")).toBeTruthy();

        const input = screen.getByDisplayValue("20");
        fireEvent.changeText(input, "35");
        fireEvent.press(screen.getByText("Save"));

        expect(screen.getByText("35 words")).toBeTruthy();
    });

    it("đăng xuất thành công", () => {
        render(<SettingsScreen />);
        fireEvent.press(screen.getByText("Log Out"));
        expect(mockReplace).toHaveBeenCalledWith("/login");
    });
});
