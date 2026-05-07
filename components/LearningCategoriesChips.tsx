import { useState } from "react";
import { ScrollView, Text, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

const CATEGORIES = ["Vocabulary", "Grammar", "Idioms", "Verbs", "Pronunciation"];

export default function LearningCategoriesChips() {
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const [selected, setSelected] = useState("Vocabulary");

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {CATEGORIES.map((cat) => {
                const isSelected = selected === cat;
                return (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setSelected(cat)}
                        style={[
                            styles.chip,
                            {
                                backgroundColor: isSelected ? currentTheme.primary : currentTheme.white,
                                borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                { color: isSelected ? currentTheme.white : currentTheme.mainText },
                            ]}
                        >
                            {cat}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    contentContainer: {
        paddingHorizontal: 2,
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    chipText: {
        fontSize: 14,
        fontWeight: "600",
    },
});
