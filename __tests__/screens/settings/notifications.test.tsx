import { fireEvent, render, screen } from "@testing-library/react-native";
import NotificationsScreen from "@/app/settings/notifications";

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
}));

describe("NotificationsScreen", () => {
    it("tắt mở nhắc nhở hàng ngày", () => {
        render(<NotificationsScreen />);

        const dailyRow = screen.getByText("Daily Practice Reminder");
        fireEvent.press(dailyRow);

        expect(screen.queryByText("Reminder Time")).toBeNull();
    });

    it("mở và lưu popup chọn giờ", () => {
        render(<NotificationsScreen />);

        fireEvent.press(screen.getByText("Reminder Time"));
        expect(screen.getByText("Set Reminder Time")).toBeTruthy();

        fireEvent.press(screen.getByText("Save Time"));
        expect(screen.queryByText("Set Reminder Time")).toBeNull();
    });
});
