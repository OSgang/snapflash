import { useState, useCallback } from "react";
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors, SIZES } from "@/constants/theme";
import DeckCard from "@/components/DeckCard";
import StatBox from "@/components/StatBox";
import MainLayout from "@/components/MainLayout";
import { useRouter, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { DeckService } from "@/services/DeckService";
import { CardService } from "@/services/CardService";
import { StatsCacheService } from "@/services/StatsCacheService";
import { formatTimeAgo } from "@/services/date";

export default function HomeScreen() {
    const systemScheme = useColorScheme() ?? "light";
    const router = useRouter();

    const [activeMode, setActiveMode] = useState<"light" | "dark">("light");
    const [decks, setDecks] = useState<any[]>([]);
    const [journeyStats, setJourneyStats] = useState({ learning: 0, mastered: 0 });
    const [dailyGoal, setDailyGoal] = useState(20);
    const [wordsStudiedToday, setWordsStudiedToday] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchHomeData = async () => {
                try {
                    setIsLoading(true);

                    const [decksData, journeyData, storedGoal, cachedStats, storedTheme] = await Promise.all([
                        DeckService.getAllDecks(),
                        CardService.getLearningJourney(),
                        SecureStore.getItemAsync("dailyGoal"),
                        StatsCacheService.getStats(),
                        SecureStore.getItemAsync("themePreference"),
                    ]);

                    setDecks(decksData || []);
                    setJourneyStats({
                        learning: journeyData?.learning?.length || 0,
                        mastered: journeyData?.mastered?.length || 0,
                    });

                    if (storedGoal) setDailyGoal(parseInt(storedGoal));
                    if (cachedStats) setWordsStudiedToday(cachedStats.wordsStudiedToday);

                    if (storedTheme === "light" || storedTheme === "dark") {
                        setActiveMode(storedTheme);
                    } else {
                        setActiveMode(systemScheme);
                    }
                } catch (error) {
                    console.log("Lỗi tải dữ liệu màn hình chính:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchHomeData();
        }, [systemScheme]),
    );

    const currentTheme = Colors[activeMode];
    const progressPercent = Math.min((wordsStudiedToday / dailyGoal) * 100, 100);
    const wordsLeft = Math.max(dailyGoal - wordsStudiedToday, 0);

    return (
        <MainLayout>
            <Text style={[styles.headerTitle, { color: currentTheme.mainText }]}>SnapFlash</Text>

            <Text style={[styles.sectionTitle, { color: currentTheme.mainText }]}>Overview</Text>
            <View style={styles.overviewRow}>
                <StatBox
                    label="Mastered"
                    number={journeyStats.mastered.toString()}
                    desc="cards total"
                    backgroundColor={currentTheme.statBlue as string}
                />
                <StatBox
                    label="Learning"
                    number={journeyStats.learning.toString()}
                    desc="cards in progress"
                    backgroundColor={currentTheme.statOrange as string}
                />
            </View>

            <View style={[styles.dailyGoalCard, { backgroundColor: currentTheme.white }]}>
                <View style={styles.dailyGoalHeader}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.mainText, marginBottom: 0 }]}>
                        Daily Goal
                    </Text>
                    <Text style={{ color: currentTheme.primary, fontWeight: "bold" }}>
                        {wordsStudiedToday} / {dailyGoal} words
                    </Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { backgroundColor: currentTheme.primary, width: `${progressPercent}%` },
                        ]}
                    />
                </View>
                <Text style={{ fontSize: 12, color: currentTheme.subText }}>
                    {wordsLeft > 0
                        ? `Just ${wordsLeft} more words to reach your goal! 🔥`
                        : "You've reached your daily goal! 🎉"}
                </Text>
            </View>

            <TouchableOpacity style={[styles.reviewCard, { backgroundColor: currentTheme.primary }]}>
                <View style={styles.reviewCardContent}>
                    <View>
                        <Text style={styles.reviewTitle}>Ready to Review</Text>
                        <Text style={styles.reviewSubtitle}>{journeyStats.learning} cards need your attention</Text>
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
                <TouchableOpacity onPress={() => router.navigate("/collections")}>
                    <Text style={{ color: currentTheme.primary, fontSize: SIZES.body2 }}>See all</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginTop: 20 }} />
            ) : decks.length === 0 ? (
                <Text style={{ textAlign: "center", color: currentTheme.subText, marginTop: 20 }}>
                    Bạn chưa có bộ bài nào. Hãy tạo mới nhé!
                </Text>
            ) : (
                decks.slice(0, 3).map((deck) => (
                    <DeckCard
                        key={deck.deckId}
                        title={deck.deckName}
                        totalWords={deck.flashcards?.length || 0}
                        learnedWords={0}
                        timeAgo={formatTimeAgo(deck.lastUpdate)}
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

const styles = StyleSheet.create({
    headerTitle: { fontSize: 36, fontWeight: "900", marginBottom: 15 },
    sectionTitle: { fontSize: SIZES.body1, fontWeight: "bold", marginBottom: 12 },
    overviewRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
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
    dailyGoalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    progressBarBg: { height: 8, backgroundColor: "#F0F0F0", borderRadius: 4, overflow: "hidden", marginBottom: 8 },
    progressBarFill: { height: "100%", borderRadius: 4 },
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
    reviewCardContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
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
    lastAccessHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
});
