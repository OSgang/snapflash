import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, TextInput } from "react-native";
import { Colors } from "@/constants/theme";
import DeckCard from "@/components/DeckCard";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import MainLayout from "@/components/MainLayout";
import { useRouter } from "expo-router";

const DUMMY_DECKS = [
    { id: "1", title: "Houses", total: 20, learned: 4, time: "20 minutes ago", isStarred: true },
    { id: "2", title: "Economics", total: 5, learned: 5, time: "45 minutes ago", isStarred: false },
    { id: "3", title: "Health", total: 10, learned: 1, time: "90 minutes ago", isStarred: true },
    { id: "4", title: "My Words", total: 50, learned: 45, time: "2 hours ago", isStarred: false },
];

const CATEGORIES = ["All", "Recent", "Starred", "Languages", "Science"];

export default function CollectionsScreen() {
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const router = useRouter();

    const toggleExpand = (id: string) => {
        setExpandedCardId(expandedCardId === id ? null : id);
    };

    return (
        <MainLayout>
            <Text style={[styles.headerTitle, { color: currentTheme.mainText }]}>Collections</Text>

            <View
                style={[
                    styles.searchContainer,
                    { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                ]}
            >
                <Feather name="search" size={20} color={currentTheme.subText} />
                <TextInput
                    placeholder="Search your collections..."
                    style={styles.searchInput}
                    placeholderTextColor={currentTheme.subText}
                />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setSelectedCategory(cat)}
                        style={[
                            styles.categoryChip,
                            {
                                backgroundColor: selectedCategory === cat ? currentTheme.primary : currentTheme.white,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                { color: selectedCategory === cat ? "#FFF" : currentTheme.mainText },
                            ]}
                        >
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View>
                {DUMMY_DECKS.map((deck) => (
                    <DeckCard
                        key={deck.id}
                        title={deck.title}
                        totalWords={deck.total}
                        learnedWords={deck.learned}
                        timeAgo={deck.time}
                        variant="collection"
                        isStarred={deck.isStarred}
                        onPress={() => toggleExpand(deck.id)}
                    >
                        {expandedCardId === deck.id && (
                            <View style={styles.quickAccessMenu}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        router.push({
                                            pathname: "/card",
                                            params: { id: deck.id, title: deck.title },
                                        });
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.iconCircle,
                                            { backgroundColor: currentTheme.tagBlueBg as string },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name="eye-outline"
                                            size={18}
                                            color={currentTheme.primary}
                                        />
                                    </View>
                                    <Text style={[styles.menuText, { color: currentTheme.mainText }]}>View</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        router.push({
                                            pathname: "/deck",
                                            params: { id: deck.id, title: deck.title },
                                        });
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.iconCircle,
                                            { backgroundColor: currentTheme.tagGreenBg as string },
                                        ]}
                                    >
                                        <MaterialCommunityIcons name="pencil-outline" size={18} color="#27AE60" />
                                    </View>
                                    <Text style={[styles.menuText, { color: currentTheme.mainText }]}>Edit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.menuItem}>
                                    <View
                                        style={[
                                            styles.iconCircle,
                                            { backgroundColor: currentTheme.tagRedBg as string },
                                        ]}
                                    >
                                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EB5757" />
                                    </View>
                                    <Text style={[styles.menuText, { color: currentTheme.mainText }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </DeckCard>
                ))}
            </View>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    headerTitle: { fontSize: 36, fontWeight: "900", marginBottom: 20 },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 15,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
    categoriesScroll: { marginBottom: 20, flexDirection: "row" },
    categoryChip: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    categoryText: { fontSize: 14, fontWeight: "600" },
    quickAccessMenu: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    menuItem: { alignItems: "center", gap: 6 },
    iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
    menuText: { fontSize: 12, fontWeight: "600" },
});
