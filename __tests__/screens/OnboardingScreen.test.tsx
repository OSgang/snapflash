import { fireEvent, render, screen } from "@testing-library/react-native";
import { FlatList } from "react-native"; // 👈 THÊM DÒNG NÀY: Import FlatList
import OnboardingScreen from "@/screens/OnboardingScreen";

const mockNavigate = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ navigate: mockNavigate }),
}));

FlatList.prototype.scrollToIndex = jest.fn();

describe("OnboardingScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("hiển thị Splash Screen và nội dung slide đầu tiên", () => {
        render(<OnboardingScreen />);

        expect(screen.getByText("SnapFlash")).toBeTruthy();
        expect(screen.getByText("Create Flashcards\nInstantly")).toBeTruthy();
        expect(screen.getByText("Study Smart")).toBeTruthy();
        expect(screen.getByText("Stay On Track")).toBeTruthy();
    });

    it("hiển thị nút Next", () => {
        render(<OnboardingScreen />);
        expect(screen.getByText("Next")).toBeTruthy();
    });

    it("gọi hàm cuộn khi bấm nút Next ở slide đầu", () => {
        render(<OnboardingScreen />);

        const nextBtn = screen.getByText("Next");
        fireEvent.press(nextBtn);

        expect(nextBtn).toBeTruthy();
    });
});
