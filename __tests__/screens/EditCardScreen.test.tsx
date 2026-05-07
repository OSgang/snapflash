import { fireEvent, render, screen } from "@testing-library/react-native";
import EditCardScreen from "@/screens/EditCardScreen";

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
    useLocalSearchParams: () => ({ word: "Capitalism" }),
}));

describe("EditCardScreen", () => {
    it("renders word data and type selectors", () => {
        render(<EditCardScreen />);
        expect(screen.getByText("Capitalism")).toBeTruthy();
        expect(screen.getByText("Noun")).toBeTruthy();
    });

    it("selects word type without crashing", () => {
        render(<EditCardScreen />);
        fireEvent.press(screen.getByText("Adjective"));
        expect(screen.getByText("Adjective")).toBeTruthy();
    });
});
