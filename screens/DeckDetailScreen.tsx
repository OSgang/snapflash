import { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    ActivityIndicator,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { DeckService } from "@/services/DeckService";
import * as SecureStore from "expo-secure-store";

export default function DeckDetailScreen() {
    const systemScheme = useColorScheme() ?? "light";
    const [activeMode, setActiveMode] = useState<"light" | "dark">("light");
    const router = useRouter();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { id, title } = useLocalSearchParams();
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchCards = async () => {
                if (!id) return;
                try {
                    setIsLoading(true);
                    const [cards, storedTheme] = await Promise.all([
                        DeckService.getDeckById(id as string),
                        SecureStore.getItemAsync("themePreference"),
                    ]);
                    setFlashcards(cards || []);

                    if (storedTheme === "light" || storedTheme === "dark") {
                        setActiveMode(storedTheme);
                    } else {
                        setActiveMode(systemScheme);
                    }
                } catch (error) {
                    console.log("Error while loading deck details: ", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCards();
        }, [id, systemScheme]),
    );

    const currentTheme = Colors[activeMode];

    const toggleExpand = (cardId: string) => {
        setExpandedId((prev) => (prev === cardId ? null : cardId));
    };

    return (
        <LinearGradient colors={[currentTheme.customBackground as string, currentTheme.white]} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
                <View style={styles.topArrowContainer}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign name="arrow-left" size={28} color={currentTheme.mainText} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.headerTitleRow}>
                        <Text style={[styles.title, { color: currentTheme.mainText }]}>{title || "Deck Details"}</Text>
                        <TouchableOpacity
                            style={[styles.checkBtn, { borderColor: currentTheme.mainText }]}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <AntDesign name="check" size={20} color={currentTheme.mainText} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.addCardBtn,
                            { borderColor: currentTheme.border, backgroundColor: currentTheme.white },
                        ]}
                        onPress={() =>
                            router.push({
                                pathname: "/edit-card",
                                params: { mode: "add", deckId: id, deckTitle: title },
                            })
                        }
                        activeOpacity={0.7}
                    >
                        <View style={[styles.addCardIcon, { backgroundColor: currentTheme.primary + "20" }]}>
                            <Feather name="plus" size={24} color={currentTheme.primary} />
                        </View>
                        <Text style={[styles.addCardText, { color: currentTheme.mainText }]}>Thêm Thẻ Mới</Text>
                    </TouchableOpacity>

                    {isLoading ? (
                        <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginTop: 20 }} />
                    ) : flashcards.length === 0 ? (
                        <Text style={{ textAlign: "center", color: currentTheme.subText, marginTop: 40 }}>
                            Bộ bài này hiện chưa có thẻ nào.
                        </Text>
                    ) : (
                        flashcards.map((item) => {
                            const isExpanded = expandedId === item.flashcardId;
                            return (
                                <View
                                    key={item.flashcardId}
                                    style={[
                                        styles.accordionCard,
                                        { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={styles.accordionHeader}
                                        onPress={() => toggleExpand(item.flashcardId)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.wordTitle, { color: currentTheme.mainText }]}>
                                            {item.word}
                                        </Text>
                                        <AntDesign
                                            name={isExpanded ? "up" : "down"}
                                            size={16}
                                            color={currentTheme.mainText}
                                        />
                                    </TouchableOpacity>

                                    {isExpanded && (
                                        <View style={styles.accordionBody}>
                                            <Text style={[styles.label, { color: currentTheme.mainText }]}>
                                                Translation
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.value,
                                                    { color: currentTheme.mainText, marginBottom: 12 },
                                                ]}
                                            >
                                                {item.translation}
                                            </Text>

                                            <Text style={[styles.label, { color: currentTheme.mainText }]}>
                                                Definition
                                            </Text>
                                            <Text
                                                style={[styles.value, { color: currentTheme.mainText, lineHeight: 22 }]}
                                            >
                                                {item.definition}
                                            </Text>

                                            <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />

                                            <View style={styles.actionRow}>
                                                <TouchableOpacity
                                                    style={styles.actionBtn}
                                                    onPress={() =>
                                                        router.push({
                                                            pathname: "/edit-card",
                                                            params: {
                                                                mode: "edit",
                                                                deckId: id,
                                                                deckTitle: title,
                                                                cardId: item.flashcardId,
                                                                word: item.word,
                                                                translation: item.translation,
                                                                definition: item.definition,
                                                            },
                                                        })
                                                    }
                                                >
                                                    <Feather name="edit" size={18} color={currentTheme.mainText} />
                                                    <Text style={[styles.actionText, { color: currentTheme.mainText }]}>
                                                        Sửa Thẻ
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={styles.actionBtn}
                                                    onPress={() =>
                                                        Alert.alert(
                                                            "Thông báo",
                                                            "Tính năng xóa thẻ đang được phát triển!",
                                                        )
                                                    }
                                                >
                                                    <Feather name="trash-2" size={18} color="#FF3B30" />
                                                    <Text style={[styles.actionText, { color: "#FF3B30" }]}>Xóa</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                </ScrollView>
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
    addCardBtn: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
        gap: 15,
    },
    addCardIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
    addCardText: { fontSize: 16, fontWeight: "bold" },
    accordionCard: { borderWidth: 1, borderRadius: 12, marginBottom: 12, overflow: "hidden" },
    accordionHeader: { flexDirection: "row", justifyContent: "space-between", padding: 16, alignItems: "center" },
    wordTitle: { fontSize: 18, fontWeight: "bold" },
    accordionBody: { paddingHorizontal: 16, paddingBottom: 16 },
    label: { fontSize: 13, fontWeight: "bold", marginTop: 5, marginBottom: 4 },
    value: { fontSize: 15 },
    divider: { height: 1, width: "100%", marginTop: 20, marginBottom: 15 },
    actionRow: { flexDirection: "row", justifyContent: "space-evenly" },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 5, paddingHorizontal: 15 },
    actionText: { fontSize: 15, fontWeight: "500" },
});
