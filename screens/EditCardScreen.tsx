import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, SIZES } from "@/constants/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardService } from "@/services/CardService";
import * as SecureStore from "expo-secure-store";

export default function EditCardScreen() {
    const systemScheme = useColorScheme() ?? "light";
    const [activeMode, setActiveMode] = useState<"light" | "dark">("light");
    const router = useRouter();

    const {
        mode,
        deckId,
        deckTitle,
        cardId,
        word: editWord,
        translation: editTranslation,
        definition: editDefinition,
    } = useLocalSearchParams();

    const parsedDef = (editDefinition as string) || "";
    let initialType = "Verb";
    let initialDefText = parsedDef;

    const match = parsedDef.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
        initialType = match[1];
        initialDefText = match[2];
    }

    const [selectedType, setSelectedType] = useState("Verb");
    const [word, setWord] = useState("");
    const [translation, setTranslation] = useState("");
    const [definition, setDefinition] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const syncThemeAndData = async () => {
            const storedTheme = await SecureStore.getItemAsync("themePreference");
            if (storedTheme === "light" || storedTheme === "dark") {
                setActiveMode(storedTheme);
            } else {
                setActiveMode(systemScheme);
            }

            if (mode === "edit") {
                setSelectedType(initialType);
                setWord(editWord as string);
                setTranslation(editTranslation as string);
                setDefinition(initialDefText);
            }
        };
        syncThemeAndData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [systemScheme, mode]);

    const currentTheme = Colors[activeMode];

    const handleSave = async () => {
        if (!word.trim() || !translation.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập Front (Từ vựng) và Back (Nghĩa)");
            return;
        }

        try {
            setIsSaving(true);
            const finalDefinition = `[${selectedType}] ${definition.trim()}`;

            if (mode === "edit") {
                setTimeout(() => {
                    Alert.alert("Thông báo", "Tính năng cập nhật thẻ đang được phát triển!", [
                        { text: "OK", onPress: () => router.back() },
                    ]);
                }, 1000);
            } else {
                await CardService.createCard(deckId as string, word.trim(), translation.trim(), finalDefinition);
                Alert.alert("Thành công", "Đã thêm thẻ mới vào bộ bài!", [
                    { text: "OK", onPress: () => router.back() },
                ]);
            }
        } catch (error: any) {
            Alert.alert("Lỗi", String(error));
        } finally {
            if (mode !== "edit") setIsSaving(false);
        }
    };

    return (
        <LinearGradient colors={[currentTheme.customBackground as string, currentTheme.white]} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
                <View style={styles.topArrowContainer}>
                    <TouchableOpacity onPress={() => router.back()} disabled={isSaving}>
                        <AntDesign name="left" size={28} color={currentTheme.mainText} />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.headerTitleRow}>
                            <Text style={[styles.title, { color: currentTheme.mainText }]}>
                                {mode === "edit" ? "Sửa Thẻ" : "Thêm Thẻ Mới"}
                            </Text>
                            <TouchableOpacity
                                style={[styles.checkBtn, { borderColor: currentTheme.mainText }]}
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color={currentTheme.primary} />
                                ) : (
                                    <AntDesign name="check" size={20} color={currentTheme.mainText} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.sectionHeading, { color: currentTheme.mainText }]}>Deck</Text>
                        <View
                            style={[
                                styles.dropdown,
                                { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                            ]}
                        >
                            <Text style={{ fontSize: SIZES.body1, color: currentTheme.mainText, fontWeight: "500" }}>
                                {deckTitle || "Unknown Deck"}
                            </Text>
                        </View>

                        <Text style={[styles.sectionHeading, { color: currentTheme.mainText }]}>Front (Từ vựng)</Text>
                        <TextInput
                            style={[
                                styles.inputBox,
                                {
                                    backgroundColor: currentTheme.white,
                                    borderColor: currentTheme.border,
                                    color: currentTheme.mainText,
                                },
                            ]}
                            value={word}
                            onChangeText={setWord}
                            placeholder="Ví dụ: Hello"
                            placeholderTextColor={currentTheme.subText}
                        />

                        <Text style={[styles.sectionHeading, { color: currentTheme.mainText }]}>Back (Nghĩa)</Text>
                        <TextInput
                            style={[
                                styles.inputBox,
                                {
                                    backgroundColor: currentTheme.white,
                                    borderColor: currentTheme.border,
                                    color: currentTheme.mainText,
                                    marginBottom: 5,
                                },
                            ]}
                            value={translation}
                            onChangeText={setTranslation}
                            placeholder="Ví dụ: Xin chào"
                            placeholderTextColor={currentTheme.subText}
                        />

                        <Text style={[styles.subLabel, { color: currentTheme.mainText }]}>Type</Text>
                        <View
                            style={[
                                styles.typeSelectorContainer,
                                {
                                    backgroundColor: activeMode === "dark" ? "#222" : "#E4EBF7",
                                    borderColor: currentTheme.border,
                                },
                            ]}
                        >
                            {["Verb", "Noun", "Adjective", "Adverb"].map((type) => {
                                const isSelected = selectedType === type;
                                return (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.typePill, isSelected && { backgroundColor: "#92CEFF" }]}
                                        onPress={() => setSelectedType(type)}
                                    >
                                        <Text
                                            style={{
                                                color: isSelected ? "#FFFFFF" : currentTheme.mainText,
                                                fontWeight: isSelected ? "bold" : "500",
                                                fontSize: 13,
                                            }}
                                        >
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={[styles.subLabel, { color: currentTheme.mainText }]}>Definition (Định nghĩa)</Text>
                        <TextInput
                            style={[
                                styles.textArea,
                                {
                                    backgroundColor: currentTheme.white,
                                    borderColor: currentTheme.border,
                                    color: currentTheme.mainText,
                                },
                            ]}
                            multiline
                            textAlignVertical="top"
                            value={definition}
                            onChangeText={setDefinition}
                            placeholder="Nhập định nghĩa hoặc ví dụ..."
                            placeholderTextColor={currentTheme.subText}
                        />

                        <View
                            style={[
                                styles.toolbar,
                                { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                            ]}
                        >
                            <MaterialCommunityIcons name="format-italic" size={22} color={currentTheme.mainText} />
                            <MaterialCommunityIcons name="format-bold" size={22} color={currentTheme.mainText} />
                            <MaterialCommunityIcons name="format-underline" size={22} color={currentTheme.mainText} />
                            <MaterialCommunityIcons
                                name="format-strikethrough-variant"
                                size={22}
                                color={currentTheme.mainText}
                            />
                            <MaterialCommunityIcons name="square" size={16} color={currentTheme.mainText} />
                            <MaterialCommunityIcons name="format-align-left" size={22} color={currentTheme.mainText} />
                            <MaterialCommunityIcons
                                name="format-align-center"
                                size={22}
                                color={currentTheme.mainText}
                            />
                            <MaterialCommunityIcons name="format-align-right" size={22} color={currentTheme.mainText} />
                            <MaterialCommunityIcons
                                name="format-list-bulleted"
                                size={22}
                                color={currentTheme.mainText}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    topArrowContainer: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    headerTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
    title: { fontSize: 38, fontWeight: "bold" },
    checkBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionHeading: { fontSize: 24, fontWeight: "bold", marginTop: 10, marginBottom: 12 },
    subLabel: { fontSize: 15, fontWeight: "600", marginTop: 5, marginBottom: 8 },
    dropdown: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    inputBox: { padding: 16, borderRadius: 12, borderWidth: 1, fontSize: 16, marginBottom: 20 },
    typeSelectorContainer: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 4, marginBottom: 20 },
    typePill: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
    textArea: { height: 120, padding: 16, borderRadius: 12, borderWidth: 1, fontSize: 16, marginBottom: 20 },
    toolbar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderRadius: 12,
        borderWidth: 1,
    },
});
