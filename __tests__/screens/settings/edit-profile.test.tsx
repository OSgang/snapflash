import { fireEvent, render, screen } from "@testing-library/react-native";
import EditProfileScreen from "@/app/settings/edit-profile";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ back: mockBack }),
}));

describe("EditProfileScreen", () => {
    it("cho phép đổi tên và lưu", () => {
        render(<EditProfileScreen />);

        const nameInput = screen.getByDisplayValue("Đậu Minh Khôi");
        fireEvent.changeText(nameInput, "Khoa");

        fireEvent.press(screen.getByText("Save Changes"));
        expect(mockBack).toHaveBeenCalled();
    });

    it("hiển thị và chọn trình độ", () => {
        render(<EditProfileScreen />);

        fireEvent.press(screen.getByText("Not Assessed"));

        fireEvent.press(screen.getByText("C1 (Advanced)"));
        expect(screen.queryByText("Select Proficiency Level")).toBeNull();
    });
});
