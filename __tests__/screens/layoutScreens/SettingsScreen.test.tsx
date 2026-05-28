import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { DeviceEventEmitter, Linking } from "react-native";
import SettingsScreen from "@/screens/layoutScreens/SettingsScreen";
import { AuthService } from "@/services/AuthService";
import * as SecureStore from "expo-secure-store";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ push: mockPush, replace: mockReplace }),
    useFocusEffect: (callback: any) => {
        const React = require("react");
        React.useEffect(() => callback(), [callback]);
    },
    Stack: { Screen: () => null },
}));

jest.spyOn(Linking, "openURL").mockImplementation(jest.fn());

jest.mock("@/services/AuthService", () => ({
    AuthService: {
        logout: jest.fn(),
    },
}));

describe("SettingsScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
        (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
        (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
        (AuthService.logout as jest.Mock).mockResolvedValue(undefined);
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
        fireEvent.press(screen.getByText("Privacy Policy"));
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

    it("đăng xuất thành công", async () => {
        render(<SettingsScreen />);
        fireEvent.press(screen.getByText("Log Out"));
        expect(AuthService.logout).toHaveBeenCalled();
        expect(await screen.findByText("Log Out")).toBeTruthy();
        expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    it("loads stored settings and saves theme preferences", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
            if (key === "dailyGoal") return Promise.resolve("42");
            if (key === "themePreference") return Promise.resolve("dark");
            if (key === "username") return Promise.resolve("Alice");
            return Promise.resolve(null);
        });
        const emitSpy = jest.spyOn(DeviceEventEmitter, "emit");

        render(<SettingsScreen />);

        expect(await screen.findByText("Alice")).toBeTruthy();
        expect(screen.getByText("42 words")).toBeTruthy();

        fireEvent.press(screen.getByText("Light"));
        await waitFor(() => {
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("themePreference", "light");
            expect(emitSpy).toHaveBeenCalledWith("themeChanged", "light");
        });
    });

    it("keeps the existing goal when saving a blank value and supports cancel", () => {
        render(<SettingsScreen />);

        fireEvent.press(screen.getByText("Daily Goal"));
        fireEvent.changeText(screen.getByDisplayValue("20"), "   ");
        fireEvent.press(screen.getByText("Save"));

        expect(screen.getByText("20 words")).toBeTruthy();

        fireEvent.press(screen.getByText("Daily Goal"));
        fireEvent.press(screen.getByText("Cancel"));
        expect(screen.queryByText("Set Daily Goal")).toBeNull();
    });

    it("still routes to login when logout fails", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(jest.fn());
        (AuthService.logout as jest.Mock).mockRejectedValueOnce("offline");

        render(<SettingsScreen />);
        fireEvent.press(screen.getByText("Log Out"));

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith("/login");
        });
    });

    it("logs but continues when theme saving fails", async () => {
        jest.spyOn(console, "log").mockImplementationOnce(jest.fn());
        (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce("storage-full");

        render(<SettingsScreen />);
        fireEvent.press(screen.getByText("Dark"));

        await waitFor(() => {
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("themePreference", "dark");
        });
    });
});
