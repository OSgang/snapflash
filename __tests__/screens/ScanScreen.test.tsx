import { Alert } from "react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import ScanScreen from "@/screens/ScanScreen";
import { ScanService } from "@/services/ScanService";
import { DeckService } from "@/services/DeckService";
import { CardService } from "@/services/CardService";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn(), push: mockPush }),
    Stack: { Screen: () => null },
}));

jest.mock("@/services/ScanService", () => ({
    ScanService: {
        scanImage: jest.fn(),
    },
}));

jest.mock("@/services/DeckService", () => ({
    DeckService: {
        createDeck: jest.fn(),
    },
}));

jest.mock("@/services/CardService", () => ({
    CardService: {
        createCard: jest.fn(),
    },
}));

describe("ScanScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, "alert").mockImplementation(jest.fn((_, __, buttons) => buttons?.[0]?.onPress?.()));
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: [] });
        (ScanService.scanImage as jest.Mock).mockResolvedValue([]);
        (DeckService.createDeck as jest.Mock).mockResolvedValue({ deckId: "deck-1", deckName: "Scanned Words" });
        (CardService.createCard as jest.Mock).mockResolvedValue({});
    });

    it("renders scanner and toggles flash", () => {
        render(<ScanScreen />);

        expect(screen.getByText("Scan your documents")).toBeTruthy();
        expect(screen.getByText("Ready to scan")).toBeTruthy();

        fireEvent.press(screen.getByText("flashlight-off"));
        expect(screen.getByText("flashlight")).toBeTruthy();
    });

    it("opens and closes the scanned words sheet", () => {
        render(<ScanScreen />);

        fireEvent.press(screen.getByText("sort-variant"));
        expect(screen.getByText("No words scanned yet.")).toBeTruthy();
        fireEvent.press(screen.getByText("Done"));
    });

    it("adds words from a picked image and removes one", async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ uri: "library-photo.jpg" }],
        });
        (ScanService.scanImage as jest.Mock).mockResolvedValueOnce([
            { word: "apple", translation: ["táo"] },
            { word: "book", translation: ["sách"] },
        ]);

        render(<ScanScreen />);

        fireEvent.press(screen.getByText("image"));

        expect(await screen.findByText("apple")).toBeTruthy();
        expect(screen.getByText("book")).toBeTruthy();
        expect(screen.getByText("2 words detected")).toBeTruthy();

        fireEvent.press(screen.getAllByText("trash-2")[0]);
        expect(screen.queryByText("apple")).toBeNull();
    });

    it("shows no-results feedback for an image with no candidates", async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ uri: "empty-photo.jpg" }],
        });
        (ScanService.scanImage as jest.Mock).mockResolvedValueOnce([]);

        render(<ScanScreen />);

        fireEvent.press(screen.getByText("image"));

        expect(await screen.findByText("No words detected")).toBeTruthy();
        expect(screen.getByText("Ready to scan")).toBeTruthy();
    });

    it("adds words from manual camera capture", async () => {
        (ScanService.scanImage as jest.Mock).mockResolvedValueOnce([{ word: "camera", translation: ["máy ảnh"] }]);

        render(<ScanScreen />);

        fireEvent.press(screen.getByText("camera-iris"));

        expect(await screen.findByText("camera")).toBeTruthy();
        expect(screen.getByText("máy ảnh")).toBeTruthy();
        expect(screen.getByText("1 words detected")).toBeTruthy();
    });

    it("shows manual capture errors without leaving the scanner stuck", async () => {
        (ScanService.scanImage as jest.Mock).mockRejectedValueOnce("scan failed");

        render(<ScanScreen />);

        fireEvent.press(screen.getByText("camera-iris"));

        expect(await screen.findByText("Lỗi khi quét ảnh")).toBeTruthy();
        expect(screen.getByText("Ready to scan")).toBeTruthy();
    });

    it("shows feedback when manual capture returns no candidates", async () => {
        (ScanService.scanImage as jest.Mock).mockResolvedValueOnce([]);

        render(<ScanScreen />);

        fireEvent.press(screen.getByText("camera-iris"));

        expect(await screen.findByText("Không nhận diện được từ nào")).toBeTruthy();
    });

    it("ignores duplicate words from manual capture", async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ uri: "library-photo.jpg" }],
        });
        (ScanService.scanImage as jest.Mock)
            .mockResolvedValueOnce([{ word: "apple", translation: ["táo"] }])
            .mockResolvedValueOnce([{ word: "APPLE", translation: ["táo"] }]);

        render(<ScanScreen />);

        fireEvent.press(screen.getByText("image"));
        expect(await screen.findByText("apple")).toBeTruthy();

        fireEvent.press(screen.getByText("camera-iris"));
        expect(await screen.findByText("Không tìm thấy từ mới")).toBeTruthy();
    });

    it("recovers when image picking or scanning throws", async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValueOnce("picker failed");

        render(<ScanScreen />);

        fireEvent.press(screen.getByText("image"));

        expect(await screen.findByText("Ready to scan")).toBeTruthy();
    });

    it("creates a deck from scanned words", async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ uri: "library-photo.jpg" }],
        });
        (ScanService.scanImage as jest.Mock).mockResolvedValueOnce([{ word: "apple", translation: ["táo"] }]);

        render(<ScanScreen />);

        fireEvent.press(screen.getByText("image"));
        expect(await screen.findByText("apple")).toBeTruthy();

        fireEvent.press(screen.getByText("Create"));
        fireEvent.changeText(screen.getByPlaceholderText("Deck name"), "Scanned Words");
        fireEvent.changeText(screen.getByPlaceholderText("Deck description (Optional)"), "Created from OCR");
        fireEvent.press(screen.getAllByText("Create").at(-1)!);

        await waitFor(() => {
            expect(DeckService.createDeck).toHaveBeenCalledWith("Scanned Words", "Created from OCR");
            expect(CardService.createCard).toHaveBeenCalledWith("deck-1", "apple", "táo", "[Vocabulary] táo");
            expect(mockPush).toHaveBeenCalledWith({
                pathname: "/deck",
                params: { id: "deck-1", title: "Scanned Words" },
            });
        });
    });

    it("validates deck creation when no name is provided", async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ uri: "library-photo.jpg" }],
        });
        (ScanService.scanImage as jest.Mock).mockResolvedValueOnce([{ word: "apple", translation: ["táo"] }]);

        render(<ScanScreen />);

        fireEvent.press(screen.getByText("image"));
        expect(await screen.findByText("apple")).toBeTruthy();

        fireEvent.press(screen.getByText("Create"));
        fireEvent.press(screen.getAllByText("Create").at(-1)!);

        expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng nhập tên bộ bài");
    });

    it("alerts when batch deck creation fails", async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ uri: "library-photo.jpg" }],
        });
        (ScanService.scanImage as jest.Mock).mockResolvedValueOnce([{ word: "apple", translation: ["táo"] }]);
        (DeckService.createDeck as jest.Mock).mockRejectedValueOnce("database unavailable");

        render(<ScanScreen />);

        fireEvent.press(screen.getByText("image"));
        expect(await screen.findByText("apple")).toBeTruthy();
        fireEvent.press(screen.getByText("Create"));
        fireEvent.changeText(screen.getByPlaceholderText("Deck name"), "Scanned Words");
        fireEvent.press(screen.getAllByText("Create").at(-1)!);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith("Lỗi tạo bộ bài", "database unavailable");
        });
    });
});
