import { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, SIZES } from "@/constants/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditCardScreen() {
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const router = useRouter();
    const [selectedType, setSelectedType] = useState("Verb");
    const { word } = useLocalSearchParams();

    return (
        <LinearGradient colors={[currentTheme.customBackground as string, "#FFFFFF"]} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
                <View style={styles.topArrowContainer}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign name="arrow-left" size={28} color={currentTheme.mainText} />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.headerTitleRow}>
                            <Text style={[styles.title, { color: currentTheme.mainText }]}>{word || "Card"}</Text>
                            <TouchableOpacity style={[styles.checkBtn, { borderColor: currentTheme.mainText }]}>
                                <AntDesign name="check" size={20} color={currentTheme.mainText} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.sectionHeading, { color: currentTheme.mainText }]}>Decks</Text>
                        <TouchableOpacity
                            style={[
                                styles.dropdown,
                                { backgroundColor: currentTheme.white, borderColor: currentTheme.border },
                            ]}
                        >
                            <Text style={{ fontSize: SIZES.body1, color: currentTheme.mainText, fontWeight: "500" }}>
                                Economics
                            </Text>
                            <AntDesign name="down" size={16} color={currentTheme.mainText} />
                        </TouchableOpacity>

                        <Text style={[styles.sectionHeading, { color: currentTheme.mainText }]}>Front</Text>
                        <TextInput
                            style={[
                                styles.inputBox,
                                {
                                    backgroundColor: currentTheme.white,
                                    borderColor: currentTheme.border,
                                    color: currentTheme.mainText,
                                },
                            ]}
                        />

                        <Text style={[styles.sectionHeading, { color: currentTheme.mainText }]}>Back</Text>
                        <Text style={[styles.subLabel, { color: currentTheme.mainText }]}>Type</Text>

                        <View
                            style={[
                                styles.typeSelectorContainer,
                                { backgroundColor: "#E4EBF7", borderColor: currentTheme.border },
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

                        <Text style={[styles.subLabel, { color: currentTheme.mainText }]}>Definition</Text>
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
