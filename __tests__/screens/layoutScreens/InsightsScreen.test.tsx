import { fireEvent, render, screen } from "@testing-library/react-native";
import InsightsScreen from "@/screens/layoutScreens/InsightsScreen";

describe("InsightsScreen", () => {
    it("renders default weekly stats", () => {
        render(<InsightsScreen />);
        expect(screen.getByText("Activity Metrics")).toBeTruthy();
        expect(screen.getByText("Toughest Words")).toBeTruthy();
        expect(screen.getByText("2h 15m")).toBeTruthy();
    });

    it("switches to Today filter correctly", () => {
        render(<InsightsScreen />);
        fireEvent.press(screen.getByText("Today"));
        expect(screen.getByText("25m")).toBeTruthy();
    });
});
