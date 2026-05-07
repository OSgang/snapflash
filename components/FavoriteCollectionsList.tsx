import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Colors, SIZES } from "@/constants/theme";

const DUMMY_FAVORITES = [
    { id: "1", title: "IELTS Vocabulary" },
    { id: "2", title: "Common Idioms" },
    { id: "3", title: "Japanese Basic" },
    { id: "4", title: "Houses" },
];

export default function FavoriteCollectionsList() {
    const currentTheme = Colors[useColorScheme() ?? "light"];

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.subTitle, { color: currentTheme.mainText }]}>Favorite Collections</Text>
                <TouchableOpacity>
                    <Text style={{ color: currentTheme.primary, fontSize: SIZES.body2 }}>See all</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {DUMMY_FAVORITES.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.favCard,
                            { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                        ]}
                    >
                        <View style={styles.cardInfo}>
                            <AntDesign name="star" size={16} color="#FFD700" />
                            <Text style={[styles.cardTitle, { color: currentTheme.mainText }]} numberOfLines={1}>
                                {item.title}
                            </Text>
                        </View>
                        <AntDesign name="heart" size={18} color="#FF2D55" style={styles.heartIcon} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    subTitle: {
        fontSize: SIZES.body1,
        fontWeight: "600",
    },
    scrollContent: {
        gap: 12,
        paddingHorizontal: 2,
    },
    favCard: {
        width: 160,
        height: 70,
        borderRadius: 16,
        borderWidth: 1,
        padding: 12,
        justifyContent: "space-between",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "bold",
        flex: 1,
    },
    heartIcon: {
        alignSelf: "flex-end",
    },
});
