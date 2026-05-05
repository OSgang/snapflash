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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons, AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

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
    text: string;
    level: string;
}

export default function ScanScreen() {
    const currentTheme = Colors[useColorScheme() ?? "light"];
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

    const showToast = (word: string) => {
        setToastMessage(`Detected: ${word}`);
        toastAnim.setValue(-100);
        Animated.sequence([
            Animated.timing(toastAnim, { toValue: 50, duration: 300, useNativeDriver: true }),
            Animated.delay(1500),
            Animated.timing(toastAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
        ]).start();
    };

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                const newWord = { id: Date.now().toString(), text: "Imported_Doc", level: "B2" };
                setScannedWords((prev) => [newWord, ...prev]);
                showToast("Imported_Doc");
                setShowScannedList(true);
            }
        } catch (error) {
            console.log("Error picking image: ", error);
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

    useEffect(() => {
        let interval: number;
        const captureAndProcessFrame = async () => {
            if (!cameraRef.current || !isScanning || isProcessingFrame.current) return;
            isProcessingFrame.current = true;
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.3,
                    base64: true,
                    skipProcessing: true,
                });
                if (photo?.base64) {
                    await new Promise((resolve) => setTimeout(resolve, 600));
                    const fakeResult = ["Logic", "Component", "State", "Effect"][Math.floor(Math.random() * 4)];
                    setScannedWords((prev) => [{ id: Date.now().toString(), text: fakeResult, level: "B1" }, ...prev]);
                    showToast(fakeResult);
                }
            } catch (e) {
                console.log(e);
            } finally {
                isProcessingFrame.current = false;
            }
        };
        if (isScanning && permission?.granted) interval = setInterval(captureAndProcessFrame, 3000);
        return () => {
            if (interval) clearInterval(interval);
            isProcessingFrame.current = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScanning, permission]);

    const filteredLanguages = LANGUAGES.filter((l) => l.name.toLowerCase().includes(searchLang.toLowerCase()));

    if (!permission) return <View />;

    return (
        <LinearGradient colors={[currentTheme.customBackground as string, "#92CEFF"]} style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
                <View style={styles.toastContent}>
                    <AntDesign name="check-circle" size={18} color="#4CAF50" />
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </View>
            </Animated.View>

            <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: currentTheme.mainText }]}>SnapFlash</Text>
                    <TouchableOpacity onPress={() => setIsFlashOn(!isFlashOn)}>
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
                                <Text style={{ color: currentTheme.primary, marginTop: 10 }}>
                                    Please allow to grant permission
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <CameraView ref={cameraRef} style={styles.camera} facing="back" enableTorch={isFlashOn}>
                                {isScanning && (
                                    <Animated.View
                                        style={[styles.scanLineWrapper, { transform: [{ translateY: scanLineAnim }] }]}
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
                                <Text style={[styles.a0Text, { color: currentTheme.primary }]}>A0</Text>
                            </View>
                            <Text style={[styles.detectingText, { color: currentTheme.mainText }]}>
                                {isScanning ? "Detecting..." : "Paused"}
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
                    <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
                        <Feather name="image" size={28} color={currentTheme.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.closeBtn, { backgroundColor: currentTheme.lightButton }]}
                        onPress={() => router.back()}
                    >
                        <AntDesign name="close" size={28} color={currentTheme.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShowScannedList(true)} style={styles.listIconBtn}>
                        <MaterialCommunityIcons name="sort-variant" size={32} color={currentTheme.primary} />
                        {scannedWords.length > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{scannedWords.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {(showScannedList || showLangSheet) && (
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                            setShowScannedList(false);
                            setShowLangSheet(false);
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
                        <Text style={styles.sheetTitle}>List of scanned</Text>
                        <Text style={styles.sheetSubtitle}>{scannedWords.length} words detected</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.doneBtn, { backgroundColor: currentTheme.primary }]}
                        onPress={() => setShowScannedList(false)}
                    >
                        <Text style={styles.doneBtnText}>Done</Text>
                    </TouchableOpacity>
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
                            <View key={word.id} style={[styles.itemCard, { borderColor: currentTheme.primary }]}>
                                <Text style={styles.itemText}>{word.text}</Text>
                                <View style={styles.itemActions}>
                                    <TouchableOpacity>
                                        <Feather name="edit-2" size={16} color={currentTheme.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <AntDesign name="check-circle" size={18} color={currentTheme.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </Animated.View>

            <Animated.View
                style={[
                    styles.bottomSheet,
                    { transform: [{ translateY: langSheetAnim }], backgroundColor: currentTheme.white },
                ]}
            >
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Select Language</Text>
                    <TouchableOpacity onPress={() => setShowLangSheet(false)}>
                        <AntDesign name="close" size={22} color={currentTheme.mainText} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchBar, { backgroundColor: currentTheme.customBackground }]}>
                    <Ionicons name="search" size={18} color={currentTheme.subText} />
                    <TextInput
                        placeholder="Search language..."
                        style={styles.searchInput}
                        value={searchLang}
                        onChangeText={setSearchLang}
                    />
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {filteredLanguages.map((lang) => {
                        const isSelected = selectedLang.code === lang.code;
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.langItem,
                                    isSelected && { backgroundColor: currentTheme.primary + "15" },
                                ]}
                                onPress={() => {
                                    setSelectedLang(lang);
                                    setShowLangSheet(false);
                                }}
                            >
                                <View style={styles.langItemLeft}>
                                    <Text style={{ fontSize: 24, marginRight: 8 }}>{lang.flag}</Text>
                                    <Text
                                        style={[
                                            styles.langItemText,
                                            isSelected && { color: currentTheme.primary, fontWeight: "bold" },
                                        ]}
                                    >
                                        {lang.name}
                                    </Text>
                                </View>
                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={22} color={currentTheme.primary} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </Animated.View>
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
    headerTitle: { fontSize: 24, fontWeight: "bold" },
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
        justifyContent: "space-around",
        alignItems: "center",
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
    },
    closeBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    listIconBtn: { position: "relative", padding: 5 },
    badge: {
        position: "absolute",
        top: 0,
        right: -2,
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
        backgroundColor: "rgba(255,255,255,0.5)",
    },
    itemText: { fontSize: 16, fontWeight: "600" },
    itemActions: { flexDirection: "row", gap: 15 },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        height: 45,
        borderRadius: 12,
        marginBottom: 15,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
    langItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    langItemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    langItemText: { fontSize: 16, color: "#333" },
});
