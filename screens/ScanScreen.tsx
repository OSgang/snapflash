import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    Dimensions,
    ScrollView,
    Animated,
    Easing,
    TextInput,
    Modal,
    ActivityIndicator,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons, AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { ScanService } from "@/services/ScanService";
import { DeckService } from "@/services/DeckService";
import { CardService } from "@/services/CardService";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");
const CAMERA_HEIGHT = height * 0.45;

const LANGUAGES = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "jp", name: "Japanese", flag: "🇯🇵" },
    { code: "kr", name: "Korean", flag: "🇰🇷" },
    { code: "cn", name: "Chinese", flag: "🇨🇳" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
];

interface ScannedWord {
    id: string;
    word: string;
    translation: string;
}

export default function ScanScreen() {
    const systemScheme = useColorScheme() ?? "light";
    const [activeMode, setActiveMode] = useState<"light" | "dark">("light");
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();

    const cameraRef = useRef<CameraView>(null);
    const isProcessingFrame = useRef(false);

    const [isFlashOn, setIsFlashOn] = useState(false);
    const [showScannedList, setShowScannedList] = useState(false);
    const [showLangSheet, setShowLangSheet] = useState(false);
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const [searchLang, setSearchLang] = useState("");

    const [scannedWords, setScannedWords] = useState<ScannedWord[]>([]);
    const [isScanning, setIsScanning] = useState(true);

    const [toastMessage, setToastMessage] = useState("");
    const toastAnim = useRef(new Animated.Value(-100)).current;
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const bottomSheetAnim = useRef(new Animated.Value(height)).current;
    const langSheetAnim = useRef(new Animated.Value(height)).current;

    const frameFlashAnim = useRef(new Animated.Value(0)).current;

    const [isCreateDeckModal, setIsCreateDeckModal] = useState(false);
    const [newDeckName, setNewDeckName] = useState("");
    const [newDeckDesc, setNewDeckDesc] = useState("");
    const [isCreatingBatch, setIsCreatingBatch] = useState(false);

    useEffect(() => {
        const syncTheme = async () => {
            const storedTheme = await SecureStore.getItemAsync("themePreference");
            if (storedTheme === "light" || storedTheme === "dark") {
                setActiveMode(storedTheme);
            } else {
                setActiveMode(systemScheme);
            }
        };
        syncTheme();
    }, [systemScheme]);

    const currentTheme = Colors[activeMode];

    const showToast = (word: string) => {
        setToastMessage(word);
        toastAnim.setValue(-100);
        Animated.sequence([
            Animated.timing(toastAnim, { toValue: 50, duration: 300, useNativeDriver: true }),
            Animated.delay(1500),
            Animated.timing(toastAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
        ]).start();
    };

    const triggerFrameFlash = () => {
        frameFlashAnim.setValue(1);
        Animated.timing(frameFlashAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                setIsScanning(false);
                triggerFrameFlash();

                const candidates = await ScanService.scanImage(result.assets[0].uri);

                if (candidates && candidates.length > 0) {
                    const newWords = candidates.map((item: any, index: number) => ({
                        id: Date.now().toString() + index,
                        word: item.word,
                        translation: item.translation?.[0] || "No translation",
                    }));

                    setScannedWords((prev) => [...newWords, ...prev]);
                    showToast(`${newWords.length} words found`);
                    setShowScannedList(true);
                } else {
                    showToast("No words detected");
                }
            }
        } catch (error) {
            console.log("Error picking/scanning image: ", error);
        } finally {
            setIsScanning(true);
        }
    };

    const handleCapture = async () => {
        if (!cameraRef.current || !isScanning || isProcessingFrame.current) return;

        isProcessingFrame.current = true;

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                skipProcessing: false,
            });

            if (photo?.uri) {
                triggerFrameFlash();
                showToast("Đang phân tích...");

                const candidates = await ScanService.scanImage(photo.uri);

                if (candidates && candidates.length > 0) {
                    const newWords = candidates.map((item: any, index: number) => ({
                        id: Date.now().toString() + index,
                        word: item.word,
                        translation: item.translation?.[0] || "No translation",
                    }));

                    setScannedWords((prev) => {
                        const uniqueNewWords = newWords.filter(
                            (nw: any) => !prev.some((pw) => pw.word.toLowerCase() === nw.word.toLowerCase()),
                        );
                        if (uniqueNewWords.length > 0) {
                            showToast(`Đã thêm ${uniqueNewWords.length} từ`);
                            return [...uniqueNewWords, ...prev];
                        } else {
                            showToast("Không tìm thấy từ mới");
                            return prev;
                        }
                    });
                } else {
                    showToast("Không nhận diện được từ nào");
                }
            }
        } catch (e) {
            console.log("Manual scan error: ", e);
            showToast("Lỗi khi quét ảnh");
        } finally {
            isProcessingFrame.current = false;
        }
    };

    const handleRemoveWord = (id: string) => {
        setScannedWords((prev) => prev.filter((item) => item.id !== id));
    };

    const handleBatchCreate = async () => {
        if (!newDeckName.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tên bộ bài");
            return;
        }
        if (scannedWords.length === 0) {
            Alert.alert("Lỗi", "Không có từ vựng nào để tạo!");
            return;
        }

        try {
            setIsCreatingBatch(true);
            const newDeck = await DeckService.createDeck(newDeckName.trim(), newDeckDesc.trim());
            const promises = scannedWords.map((w) =>
                CardService.createCard(newDeck.deckId, w.word, w.translation, `[Vocabulary] ${w.translation}`),
            );
            await Promise.all(promises);

            Alert.alert("Hoàn tất", `Đã tạo bộ bài "${newDeckName}" với ${scannedWords.length} thẻ!`, [
                {
                    text: "Xem ngay",
                    onPress: () => {
                        setIsCreateDeckModal(false);
                        setShowScannedList(false);
                        setScannedWords([]);
                        setNewDeckName("");
                        setNewDeckDesc("");
                        router.push({ pathname: "/deck", params: { id: newDeck.deckId, title: newDeck.deckName } });
                    },
                },
            ]);
        } catch (e: any) {
            Alert.alert("Lỗi tạo bộ bài", String(e));
        } finally {
            setIsCreatingBatch(false);
        }
    };

    useEffect(() => {
        if (isScanning && permission?.granted) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scanLineAnim, {
                        toValue: CAMERA_HEIGHT - 4,
                        duration: 2500,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scanLineAnim, {
                        toValue: 0,
                        duration: 2500,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        } else {
            scanLineAnim.stopAnimation();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScanning, permission]);

    useEffect(() => {
        Animated.spring(bottomSheetAnim, {
            toValue: showScannedList ? 0 : height,
            useNativeDriver: true,
            bounciness: 4,
        }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showScannedList]);

    useEffect(() => {
        Animated.spring(langSheetAnim, {
            toValue: showLangSheet ? 0 : height,
            useNativeDriver: true,
            bounciness: 4,
        }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showLangSheet]);

    const filteredLanguages = LANGUAGES.filter((l) => l.name.toLowerCase().includes(searchLang.toLowerCase()));

    if (!permission) return <View />;

    return (
        <LinearGradient
            colors={[currentTheme.customBackground as string, activeMode === "dark" ? "#151718" : "#92CEFF"]}
            style={styles.container}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
                <View style={styles.toastContent}>
                    <AntDesign name="check-circle" size={18} color="#4CAF50" />
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </View>
            </Animated.View>

            <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerIconWrapper}>
                        <AntDesign name="arrow-left" size={28} color={currentTheme.mainText} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: currentTheme.mainText }]}>SnapFlash</Text>

                    <TouchableOpacity onPress={() => setIsFlashOn(!isFlashOn)} style={styles.headerIconWrapper}>
                        <MaterialCommunityIcons
                            name={isFlashOn ? "flashlight" : "flashlight-off"}
                            size={28}
                            color={currentTheme.mainText}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.mainContent}>
                    <View style={[styles.cameraWrapper, { borderColor: currentTheme.primary }]}>
                        {!permission.granted ? (
                            <TouchableOpacity
                                style={styles.noCameraContainer}
                                onPress={requestPermission}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons
                                    name="camera-off-outline"
                                    size={60}
                                    color={currentTheme.mainText}
                                />
                                <Text style={[styles.noCameraTitle, { color: currentTheme.mainText }]}>
                                    Camera unavailable
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <CameraView ref={cameraRef} style={styles.camera} facing="back" enableTorch={isFlashOn}>
                                <Animated.View
                                    style={[
                                        StyleSheet.absoluteFillObject,
                                        { backgroundColor: "white", opacity: frameFlashAnim, zIndex: 1 },
                                    ]}
                                    pointerEvents="none"
                                />
                                {isScanning && (
                                    <Animated.View
                                        style={[
                                            styles.scanLineWrapper,
                                            { transform: [{ translateY: scanLineAnim }], zIndex: 2 },
                                        ]}
                                    >
                                        <View style={styles.scanLine} />
                                        <View style={styles.scanGlow} />
                                    </Animated.View>
                                )}
                            </CameraView>
                        )}
                    </View>

                    <View style={styles.middleSection}>
                        <Text style={[styles.statusText, { color: currentTheme.primary }]}>Scan your documents</Text>
                        <View style={[styles.detectingWrapper, !isScanning && { opacity: 0.5 }]}>
                            <View style={[styles.a0Badge, { backgroundColor: currentTheme.lightButton }]}>
                                <Text
                                    style={[
                                        styles.a0Text,
                                        { color: activeMode === "dark" ? "#FFF" : currentTheme.primary },
                                    ]}
                                >
                                    A0
                                </Text>
                            </View>
                            <Text style={[styles.detectingText, { color: currentTheme.mainText }]}>
                                {isScanning ? "Ready to scan" : "Paused"}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.langBtn, { backgroundColor: currentTheme.border + "50" }]}
                            onPress={() => setShowLangSheet(true)}
                        >
                            <MaterialCommunityIcons name="translate" size={20} color={currentTheme.primary} />
                            <Text style={[styles.langText, { color: currentTheme.primary }]}>{selectedLang.name}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={currentTheme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bottomControls}>
                    <TouchableOpacity onPress={pickImage} activeOpacity={0.7} style={styles.sideBtn}>
                        <Feather name="image" size={28} color={currentTheme.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.captureBtn, { backgroundColor: currentTheme.primary }]}
                        onPress={handleCapture}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="camera-iris" size={40} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setShowScannedList(true)}
                        style={[styles.listIconBtn, styles.sideBtn]}
                    >
                        <MaterialCommunityIcons name="sort-variant" size={32} color={currentTheme.primary} />
                        {scannedWords.length > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{scannedWords.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {(showScannedList || showLangSheet || isCreateDeckModal) && (
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                            if (!isCreatingBatch) {
                                setShowScannedList(false);
                                setShowLangSheet(false);
                            }
                        }}
                        activeOpacity={1}
                    />
                </BlurView>
            )}

            <Animated.View
                style={[
                    styles.bottomSheet,
                    { transform: [{ translateY: bottomSheetAnim }], backgroundColor: currentTheme.white },
                ]}
            >
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                    <View>
                        <Text style={[styles.sheetTitle, { color: currentTheme.mainText }]}>List of scanned</Text>
                        <Text style={styles.sheetSubtitle}>{scannedWords.length} words detected</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        {scannedWords.length > 0 && (
                            <TouchableOpacity
                                style={[styles.doneBtn, { backgroundColor: currentTheme.primary }]}
                                onPress={() => setIsCreateDeckModal(true)}
                            >
                                <Text style={styles.doneBtnText}>Create</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.doneBtn, { backgroundColor: currentTheme.border }]}
                            onPress={() => setShowScannedList(false)}
                        >
                            <Text style={[styles.doneBtnText, { color: currentTheme.mainText }]}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {scannedWords.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons
                                name="text-box-search-outline"
                                size={48}
                                color={currentTheme.border}
                            />
                            <Text style={{ color: currentTheme.subText, marginTop: 10 }}>No words scanned yet.</Text>
                        </View>
                    ) : (
                        scannedWords.map((word) => (
                            <View
                                key={word.id}
                                style={[
                                    styles.itemCard,
                                    {
                                        borderColor: currentTheme.primary,
                                        backgroundColor: activeMode === "dark" ? "#222" : "rgba(255,255,255,0.5)",
                                    },
                                ]}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.itemText, { color: currentTheme.mainText }]}>{word.word}</Text>
                                    <Text style={{ fontSize: 13, color: currentTheme.subText, marginTop: 4 }}>
                                        {word.translation}
                                    </Text>
                                </View>
                                <View style={styles.itemActions}>
                                    <TouchableOpacity onPress={() => handleRemoveWord(word.id)}>
                                        <Feather name="trash-2" size={24} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </Animated.View>

            <Modal
                visible={isCreateDeckModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    if (!isCreatingBatch) setIsCreateDeckModal(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: currentTheme.white }]}>
                        <Text style={[styles.modalTitle, { color: currentTheme.mainText }]}>
                            Create Deck for {scannedWords.length} words
                        </Text>
                        <TextInput
                            style={[
                                styles.modalInput,
                                { color: currentTheme.mainText, borderColor: currentTheme.border },
                            ]}
                            placeholder="Deck name"
                            placeholderTextColor={currentTheme.subText}
                            value={newDeckName}
                            onChangeText={setNewDeckName}
                        />
                        <TextInput
                            style={[
                                styles.modalInput,
                                { color: currentTheme.mainText, borderColor: currentTheme.border, height: 80 },
                            ]}
                            placeholder="Deck description (Optional)"
                            placeholderTextColor={currentTheme.subText}
                            value={newDeckDesc}
                            onChangeText={setNewDeckDesc}
                            multiline
                            textAlignVertical="top"
                        />
                        <View style={styles.modalActionRow}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: "transparent" }]}
                                onPress={() => setIsCreateDeckModal(false)}
                                disabled={isCreatingBatch}
                            >
                                <Text style={[styles.modalBtnText, { color: currentTheme.subText }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalBtn,
                                    { backgroundColor: currentTheme.primary, opacity: isCreatingBatch ? 0.7 : 1 },
                                ]}
                                onPress={handleBatchCreate}
                                disabled={isCreatingBatch}
                            >
                                {isCreatingBatch ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={[styles.modalBtnText, { color: "#FFF" }]}>Create</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    toastContainer: { position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", zIndex: 999 },
    toastContent: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        gap: 8,
    },
    toastText: { fontSize: 14, fontWeight: "700", color: "#333" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 10,
        marginTop: 10,
    },
    headerIconWrapper: { width: 40, alignItems: "center" },
    headerTitle: { fontSize: 24, fontWeight: "bold", textAlign: "center", flex: 1 },
    mainContent: { flex: 1, justifyContent: "center", paddingBottom: 90 },
    cameraWrapper: {
        height: CAMERA_HEIGHT,
        marginHorizontal: 20,
        borderWidth: 2,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.5)",
    },
    camera: { flex: 1 },
    noCameraContainer: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%" },
    noCameraTitle: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
    scanLineWrapper: { width: "100%", position: "absolute" },
    scanLine: {
        height: 3,
        backgroundColor: "#00FF00",
        width: "100%",
        elevation: 5,
        shadowColor: "#00FF00",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
    },
    scanGlow: { height: 15, width: "100%", backgroundColor: "rgba(0,255,0,0.2)" },
    middleSection: { alignItems: "center", marginTop: 25, minHeight: 100 },
    statusText: { fontSize: 14, fontWeight: "500", marginBottom: 15 },
    detectingWrapper: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    a0Badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
    a0Text: { fontSize: 12, fontWeight: "bold" },
    detectingText: { fontSize: 16, fontWeight: "600", minWidth: 100 },
    langBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    langText: { fontSize: 15, fontWeight: "600" },
    bottomControls: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
        bottom: 30,
        left: 30,
        right: 30,
    },
    sideBtn: { width: 50, alignItems: "center", justifyContent: "center" },
    captureBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        borderWidth: 4,
        borderColor: "rgba(255,255,255,0.5)",
    },
    listIconBtn: { position: "relative" },
    badge: {
        position: "absolute",
        top: -5,
        right: 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FF3B30",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    badgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
    bottomSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.55,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: "#E0E0E0",
        borderRadius: 3,
        alignSelf: "center",
        marginTop: 15,
        marginBottom: 20,
    },
    sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    sheetTitle: { fontSize: 20, fontWeight: "800" },
    sheetSubtitle: { color: "#666", fontSize: 13, marginTop: 4 },
    doneBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    doneBtnText: { color: "#FFF", fontWeight: "bold" },
    emptyState: { alignItems: "center", marginTop: 40 },
    itemCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 10,
    },
    itemText: { fontSize: 16, fontWeight: "600" },
    itemActions: { flexDirection: "row", gap: 15 },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        borderRadius: 16,
        padding: 24,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    modalInput: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 15 },
    modalActionRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 10 },
    modalBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        minWidth: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    modalBtnText: { fontSize: 16, fontWeight: "bold" },
});
