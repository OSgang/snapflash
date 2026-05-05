import { useState } from "react";
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, FontAwesome5, Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import MainLayout from "@/components/MainLayout";
import BarChart from "@/components/BarChart";
import LearningPipeline from "@/components/LearningPipeline";

type FilterType = "Today" | "Week" | "Month" | "Year";

const EXPECTED_LABELS = {
    Week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    Month: ["W1", "W2", "W3", "W4"],
    Year: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

const CHART_DATA_MOCK = {
    Week: [
        { day: "Mon", words: 20 },
        { day: "Tue", words: 15 },
        { day: "Wed", words: 35 },
        { day: "Thu", words: 25 },
        { day: "Fri", words: 85, active: true },
    ],
    Month: [
        { day: "W1", words: 120 },
        { day: "W2", words: 250 },
        { day: "W3", words: 180, active: true },
    ],
    Year: [
        { day: "Jan", words: 450 },
        { day: "Feb", words: 380 },
        { day: "Mar", words: 520 },
        { day: "Apr", words: 410 },
        { day: "May", words: 600, active: true },
    ],
};

const TOUGHEST_WORDS = [
    { word: "Meticulous", collection: "IELTS Vocabulary", accuracy: "20%" },
    { word: "Ephemeral", collection: "Daily Phrases", accuracy: "35%" },
    { word: "Ubiquitous", collection: "Economics 101", accuracy: "45%" },
];

export default function InsightsScreen() {
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const [filter, setFilter] = useState<FilterType>("Week");

    const userGoal = 500;

    const stats = {
        Today: { streak: 12, accuracy: 92, time: "25m", snap: 12, mastered: 5, learning: 10, new: 5 },
        Week: { streak: 12, accuracy: 85, time: "2h 15m", snap: 150, mastered: 240, learning: 85, new: 75 },
        Month: { streak: 12, accuracy: 78, time: "10h 40m", snap: 540, mastered: 450, learning: 120, new: 50 },
        Year: { streak: 12, accuracy: 82, time: "124h", snap: 2350, mastered: 1850, learning: 420, new: 150 },
    };

    const currentData = stats[filter];

    return (
        <MainLayout>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: currentTheme.mainText }]}>Insights</Text>
            </View>

            <View style={[styles.filterBar, { backgroundColor: currentTheme.border + "40" }]}>
                {(["Today", "Week", "Month", "Year"] as FilterType[]).map((item) => (
                    <TouchableOpacity
                        key={item}
                        onPress={() => setFilter(item)}
                        style={[
                            styles.filterItem,
                            filter === item && { backgroundColor: currentTheme.white, elevation: 2 },
                        ]}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                { color: filter === item ? currentTheme.primary : currentTheme.subText },
                            ]}
                        >
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 1. ACTIVITY METRICS */}
            <View style={styles.sectionHeader}>
                <Text style={[styles.subTitle, { color: currentTheme.mainText }]}>Activity Metrics</Text>
            </View>
            <View style={styles.statGrid}>
                <View style={styles.statRow}>
                    <View
                        style={[
                            styles.statBox,
                            { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                        ]}
                    >
                        <FontAwesome5 name="fire-alt" size={20} color="#FF9800" />
                        <Text style={[styles.statValue, { color: currentTheme.mainText }]}>{currentData.streak}</Text>
                        <Text style={[styles.statLabel, { color: currentTheme.subText }]}>Day Streak</Text>
                    </View>
                    <View
                        style={[
                            styles.statBox,
                            { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                        ]}
                    >
                        <MaterialCommunityIcons name="target-account" size={22} color={currentTheme.primary} />
                        <Text style={[styles.statValue, { color: currentTheme.mainText }]}>
                            {currentData.accuracy}%
                        </Text>
                        <Text style={[styles.statLabel, { color: currentTheme.subText }]}>Accuracy</Text>
                    </View>
                </View>
                <View style={styles.statRow}>
                    <View
                        style={[
                            styles.statBox,
                            { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                        ]}
                    >
                        <Feather name="clock" size={20} color="#4CAF50" />
                        <Text style={[styles.statValue, { color: currentTheme.mainText }]}>{currentData.time}</Text>
                        <Text style={[styles.statLabel, { color: currentTheme.subText }]}>Time Spent</Text>
                    </View>
                    <View
                        style={[
                            styles.statBox,
                            { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                        ]}
                    >
                        <Ionicons name="camera-outline" size={22} color="#E91E63" />
                        <Text style={[styles.statValue, { color: currentTheme.mainText }]}>{currentData.snap}</Text>
                        <Text style={[styles.statLabel, { color: currentTheme.subText }]}>Snap Created</Text>
                    </View>
                </View>
            </View>

            <LearningPipeline
                mastered={currentData.mastered}
                learning={currentData.learning}
                newWords={currentData.new}
                retentionRate={currentData.accuracy}
            />

            {filter !== "Today" && (
                <BarChart
                    title={`${filter === "Year" ? "Yearly" : filter + "ly"} Progress & Forecast`}
                    data={CHART_DATA_MOCK[filter as "Week" | "Month" | "Year"]}
                    expectedLabels={EXPECTED_LABELS[filter as "Week" | "Month" | "Year"]}
                    goalValue={filter === "Year" ? userGoal : filter === "Month" ? userGoal / 4 : userGoal / 10}
                />
            )}

            {filter !== "Today" && (
                <View style={[styles.infoBox, { backgroundColor: currentTheme.tagBlueBg }]}>
                    <Feather name="info" size={16} color={currentTheme.primary} />
                    <Text style={[styles.infoText, { color: currentTheme.tagBlueText }]}>
                        Based on your current pace, you re on track to crush your goal! 🚀
                    </Text>
                </View>
            )}

            <View style={styles.sectionHeaderRow}>
                <Text style={[styles.subTitle, { color: currentTheme.mainText }]}>Toughest Words</Text>
                <TouchableOpacity>
                    <Text style={{ color: currentTheme.primary, fontWeight: "bold" }}>Review Now</Text>
                </TouchableOpacity>
            </View>
            <View
                style={[styles.toughestCard, { backgroundColor: currentTheme.white, borderColor: currentTheme.border }]}
            >
                {TOUGHEST_WORDS.map((item, idx) => (
                    <View
                        key={item.word}
                        style={[
                            styles.wordItem,
                            idx < 2 && { borderBottomWidth: 1, borderBottomColor: currentTheme.border },
                        ]}
                    >
                        <View>
                            <Text style={[styles.wordText, { color: currentTheme.mainText }]}>{item.word}</Text>
                            <Text style={[styles.collectionText, { color: currentTheme.subText }]}>
                                {item.collection}
                            </Text>
                        </View>
                        <View style={styles.wordBadge}>
                            <Text style={styles.badgeText}>{item.accuracy} recall</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={{ height: 20 }} />
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    headerRow: { marginBottom: 15 },
    headerTitle: { fontSize: 36, fontWeight: "900" },
    filterBar: { flexDirection: "row", padding: 4, borderRadius: 12, marginBottom: 25 },
    filterItem: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10 },
    filterText: { fontSize: 13, fontWeight: "700" },
    sectionHeader: { marginBottom: 15 },
    sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    subTitle: { fontSize: 18, fontWeight: "700" },

    statGrid: { gap: 10, marginBottom: 30 },
    statRow: { flexDirection: "row", gap: 10 },
    statBox: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderRadius: 14,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    statValue: { fontSize: 18, fontWeight: "bold", marginTop: 6, marginBottom: 2 },
    statLabel: { fontSize: 11, fontWeight: "600", color: "#7C89AB" },

    infoBox: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, marginBottom: 30, gap: 10 },
    infoText: { fontSize: 13, fontWeight: "600", flex: 1 },

    toughestCard: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 },
    wordItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 15, alignItems: "center" },
    wordText: { fontSize: 16, fontWeight: "700" },
    collectionText: { fontSize: 12, marginTop: 4 },
    wordBadge: { backgroundColor: "#FFE5EB", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { color: "#FF2D55", fontSize: 11, fontWeight: "bold" },
});
