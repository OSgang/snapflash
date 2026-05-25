import { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Modal,
    Alert,
} from "react-native";
import { Colors } from "@/constants/theme";
import DeckCard from "@/components/DeckCard";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import MainLayout from "@/components/MainLayout";
import { useRouter, useFocusEffect } from "expo-router";
import { DeckService } from "@/services/DeckService";
import { formatTimeAgo } from "@/services/date";
import * as SecureStore from "expo-secure-store";

const CATEGORIES = ["All", "Recent", "Starred", "Languages", "Science"];

export default function CollectionsScreen() {
    const systemScheme = useColorScheme() ?? "light";
    const [activeMode, setActiveMode] = useState<"light" | "dark">("light");
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const router = useRouter();

    const [decks, setDecks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [newDeckName, setNewDeckName] = useState("");
    const [newDeckDesc, setNewDeckDesc] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const fetchDecks = async () => {
        try {
            setIsLoading(true);
            const [data, storedTheme] = await Promise.all([
                DeckService.getAllDecks(),
                SecureStore.getItemAsync("themePreference"),
            ]);
            setDecks(data || []);

            if (storedTheme === "light" || storedTheme === "dark") {
                setActiveMode(storedTheme);
            } else {
                setActiveMode(systemScheme);
            }
        } catch (error) {
            console.log("Error while loading decks: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDecks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [systemScheme]),
    );

    const currentTheme = Colors[activeMode];

    const toggleExpand = (id: string) => {
        setExpandedCardId(expandedCardId === id ? null : id);
    };

    const handleCreateDeck = async () => {
        const cleanName = newDeckName.trim();
        const cleanDesc = newDeckDesc.trim();
        if (!cleanName) {
            Alert.alert("Error", "Please enter a deck name!");
            return;
        }
        try {
            setIsCreating(true);
            await DeckService.createDeck(cleanName, cleanDesc);
            setIsCreateModalVisible(false);
            setNewDeckName("");
            setNewDeckDesc("");
            await fetchDecks();
        } catch (error: any) {
            Alert.alert("Creation failed", String(error));
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <MainLayout>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: currentTheme.mainText }]}>Collections</Text>

                <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: currentTheme.primary + "35" }]}
                    activeOpacity={0.7}
                    onPress={() => setIsCreateModalVisible(true)}
                >
                    <Feather name="plus" size={30} color={currentTheme.primary} />
                </TouchableOpacity>
            </View>

            <View
                style={[
                    styles.searchContainer,
                    { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                ]}
            >
                <Feather name="search" size={20} color={currentTheme.subText} />
                <TextInput
                    placeholder="Search your decks"
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginTop: 20 }} />
                ) : decks.length === 0 ? (
                    <Text style={{ textAlign: "center", color: currentTheme.subText, marginTop: 20 }}>
                        No decks available yet.
                    </Text>
                ) : (
                    decks.map((deck) => (
                        <DeckCard
                            key={deck.deckId}
                            title={deck.deckName}
                            totalWords={deck.flashcards?.length || 0}
                            learnedWords={0}
                            timeAgo={formatTimeAgo(deck.lastUpdate)}
                            variant="collection"
                            isStarred={true}
                            onPress={() => toggleExpand(deck.deckId)}
                        >
                            {expandedCardId === deck.deckId && (
                                <View style={styles.quickAccessMenu}>
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={() => {
                                            router.push({
                                                pathname: "/card",
                                                params: { id: deck.deckId, title: deck.deckName },
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
                                                params: { id: deck.deckId, title: deck.deckName },
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
                                            <MaterialCommunityIcons
                                                name="trash-can-outline"
                                                size={18}
                                                color="#EB5757"
                                            />
                                        </View>
                                        <Text style={[styles.menuText, { color: currentTheme.mainText }]}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </DeckCard>
                    ))
                )}
            </ScrollView>

            <Modal
                visible={isCreateModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsCreateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: currentTheme.white }]}>
                        <Text style={[styles.modalTitle, { color: currentTheme.mainText }]}>Create new deck</Text>

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
                            placeholder="Deck description"
                            placeholderTextColor={currentTheme.subText}
                            value={newDeckDesc}
                            onChangeText={setNewDeckDesc}
                            multiline
                            textAlignVertical="top"
                        />

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: "transparent" }]}
                                onPress={() => setIsCreateModalVisible(false)}
                                disabled={isCreating}
                            >
                                <Text style={[styles.modalBtnText, { color: currentTheme.subText }]}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalBtn,
                                    { backgroundColor: currentTheme.primary, opacity: isCreating ? 0.7 : 1 },
                                ]}
                                onPress={handleCreateDeck}
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={[styles.modalBtnText, { color: "#FFF" }]}>OK</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    headerTitle: { fontSize: 36, fontWeight: "900" },
    addBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
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
    categoriesScroll: { marginBottom: 20, flexDirection: "row", paddingBottom: 8 },
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
        justifyContent: "center",
    },
    categoryText: { fontSize: 14, fontWeight: "600" },
    quickAccessMenu: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
    menuItem: { alignItems: "center", gap: 6 },
    iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
    menuText: { fontSize: 12, fontWeight: "600" },
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
