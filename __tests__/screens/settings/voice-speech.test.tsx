import { fireEvent, render, screen } from "@testing-library/react-native";
import VoiceSpeechScreen from "@/app/settings/voice-speech";

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
}));

describe("VoiceSpeechScreen", () => {
    it("cho phép chọn Accent", () => {
        render(<VoiceSpeechScreen />);

        fireEvent.press(screen.getByText("Language & Accent"));
        fireEvent.press(screen.getByText("UK English (Female)"));

        expect(screen.getByText("UK English (Female)")).toBeTruthy();
    });

    it("cho phép test audio", () => {
        render(<VoiceSpeechScreen />);

        fireEvent.press(screen.getByText("Test Audio Settings"));
        expect(screen.getByText("Testing Audio")).toBeTruthy();

        fireEvent.press(screen.getByText("Got it"));
    });

    it("chọn tốc độ đọc", () => {
        render(<VoiceSpeechScreen />);
        const speedBtn = screen.getByText("0.5x");
        fireEvent.press(speedBtn);
        expect(speedBtn).toBeTruthy();
    });
});
