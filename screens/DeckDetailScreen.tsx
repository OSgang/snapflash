import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Colors, SIZES } from "@/constants/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const VOCAB_DATA = [
    {
        id: "1",
        word: "Capitalism",
        type: "Noun",
        definition:
            "an economic system in which a country's businesses and industry are controlled and run for profit by private owners rather than by the government",
    },
    { id: "2", word: "Incentive", type: "", definition: "..." },
    { id: "3", word: "Abolish", type: "", definition: "..." },
    { id: "4", word: "Market", type: "", definition: "..." },
];

export default function DeckDetailScreen() {
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const router = useRouter();
    const [expandedId, setExpandedId] = useState<string | null>("1");
    const { title } = useLocalSearchParams();

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <LinearGradient colors={[currentTheme.customBackground as string, "#FFFFFF"]} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
                <View style={styles.topArrowContainer}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign name="arrow-left" size={28} color={currentTheme.mainText} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.headerTitleRow}>
                        <Text style={[styles.title, { color: currentTheme.mainText }]}>{title || "Deck Details"}</Text>
                        <TouchableOpacity style={[styles.checkBtn, { borderColor: currentTheme.mainText }]}>
                            <AntDesign name="check" size={20} color={currentTheme.mainText} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.dropdown,
                            { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                        ]}
                    >
                        <Text style={{ fontSize: SIZES.body1, color: currentTheme.mainText, fontWeight: "500" }}>
                            Tax
                        </Text>
                        <AntDesign name="down" size={16} color={currentTheme.mainText} />
                    </TouchableOpacity>

                    {VOCAB_DATA.map((item) => {
                        const isExpanded = expandedId === item.id;
                        return (
                            <View
                                key={item.id}
                                style={[
                                    styles.accordionCard,
                                    { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.accordionHeader}
                                    onPress={() => toggleExpand(item.id)}
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
                                        <Text style={[styles.label, { color: currentTheme.mainText }]}>Type</Text>
                                        <Text
                                            style={[styles.value, { color: currentTheme.mainText, marginBottom: 12 }]}
                                        >
                                            {item.type}
                                        </Text>

                                        <Text style={[styles.label, { color: currentTheme.mainText }]}>Definition</Text>
                                        <Text style={[styles.value, { color: currentTheme.mainText, lineHeight: 22 }]}>
                                            {item.definition}
                                        </Text>

                                        <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />

                                        <View style={styles.actionRow}>
                                            <TouchableOpacity
                                                style={styles.actionBtn}
                                                onPress={() =>
                                                    router.push({
                                                        pathname: "/edit-card",
                                                        params: { cardId: item.id, word: item.word },
                                                    })
                                                }
                                            >
                                                <Feather name="edit-2" size={18} color={currentTheme.mainText} />
                                                <Text style={[styles.actionText, { color: currentTheme.mainText }]}>
                                                    Edit
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.actionBtn}>
                                                <Feather name="trash-2" size={18} color={currentTheme.mainText} />
                                                <Text style={[styles.actionText, { color: currentTheme.mainText }]}>
                                                    Delete
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })}
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

    dropdown: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },

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
