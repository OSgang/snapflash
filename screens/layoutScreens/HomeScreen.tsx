import { useState, useEffect } from "react"; // ĐÃ THÊM: hooks của React
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors, SIZES } from "@/constants/theme";
import DeckCard from "@/components/DeckCard";
import StatBox from "@/components/StatBox";
import MainLayout from "@/components/MainLayout";
import { useRouter } from "expo-router";

// ĐÃ THÊM: Import DeckService
import { DeckService } from "@/services/DeckService";

export default function HomeScreen() {
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const router = useRouter();

    // ĐÃ THÊM: States để lưu dữ liệu Deck từ API và trạng thái Loading
    const [decks, setDecks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ĐÃ THÊM: Gọi API lấy dữ liệu khi vừa vào màn hình
    useEffect(() => {
        const fetchDecks = async () => {
            try {
                setIsLoading(true);
                const data = await DeckService.getAllDecks();
                setDecks(data || []);
            } catch (error) {
                console.log("Lỗi tải Decks:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDecks();
    }, []);

    return (
        <MainLayout>
            <Text style={[styles.headerTitle, { color: currentTheme.mainText }]}>SnapFlash</Text>

            <Text style={[styles.sectionTitle, { color: currentTheme.mainText }]}>Overview</Text>
            <View style={styles.overviewRow}>
                <StatBox
                    label="Studied"
                    number="25"
                    desc="cards in today"
                    backgroundColor={currentTheme.statBlue as string}
                />
                <StatBox
                    label="Reviewed"
                    number="1"
                    desc="cards in today"
                    backgroundColor={currentTheme.statOrange as string}
                />
            </View>

            <View style={[styles.dailyGoalCard, { backgroundColor: currentTheme.white }]}>
                <View style={styles.dailyGoalHeader}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.mainText, marginBottom: 0 }]}>
                        Daily Goal
                    </Text>
                    <Text style={{ color: currentTheme.primary, fontWeight: "bold" }}>15 / 20 words</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { backgroundColor: currentTheme.primary, width: "75%" }]} />
                </View>
                <Text style={{ fontSize: 12, color: currentTheme.subText }}>
                    Just 5 more words to reach your goal! 🔥
                </Text>
            </View>

            <TouchableOpacity style={[styles.reviewCard, { backgroundColor: currentTheme.primary }]}>
                <View style={styles.reviewCardContent}>
                    <View>
                        <Text style={styles.reviewTitle}>Ready to Review</Text>
                        <Text style={styles.reviewSubtitle}>30 cards need your attention</Text>
                    </View>
                    <View style={styles.playIconWrapper}>
                        <FontAwesome5 name="play" size={14} color={currentTheme.primary} />
                    </View>
                </View>
            </TouchableOpacity>

            <View style={styles.lastAccessHeader}>
                <Text style={[styles.sectionTitle, { color: currentTheme.mainText, marginBottom: 0 }]}>
                    Last Accessed
                </Text>
                <TouchableOpacity>
                    <Text style={{ color: currentTheme.primary, fontSize: SIZES.body2 }}>See all</Text>
                </TouchableOpacity>
            </View>

            {/* ĐÃ SỬA: Render danh sách từ API hoặc hiện Loading */}
            {isLoading ? (
                <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginTop: 20 }} />
            ) : decks.length === 0 ? (
                <Text style={{ textAlign: "center", color: currentTheme.subText, marginTop: 20 }}>
                    Bạn chưa có bộ bài nào. Hãy tạo mới nhé!
                </Text>
            ) : (
                decks.map((deck) => (
                    <DeckCard
                        key={deck.deckId} 
                        title={deck.deckName} // Gắn đúng trường trả về từ Backend
                        totalWords={deck.flashcards?.length || 0} // Đếm số lượng flashcard thật
                        learnedWords={0} // Có thể tự tính logic từ flipCount sau
                        timeAgo="Vừa xong" // Tạm thời hardcode, hoặc format từ createdAt
                        variant="home"
                        onPress={() => {
                            router.push({
                                pathname: "/card",
                                params: { id: deck.deckId, title: deck.deckName },
                            });
                        }}
                    />
                ))
            )}
        </MainLayout>
    );
}

// ... styles giữ nguyên

const styles = StyleSheet.create({
    headerTitle: {
        fontSize: 36,
        fontWeight: "900",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: SIZES.body1,
        fontWeight: "bold",
        marginBottom: 12,
    },
    overviewRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    dailyGoalCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    dailyGoalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: "#F0F0F0",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 4,
    },
    reviewCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 25,
        elevation: 4,
        shadowColor: "#2B78FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    reviewCardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    reviewTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
    reviewSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
    playIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 3,
    },
    lastAccessHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
});
