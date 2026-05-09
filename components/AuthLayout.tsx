import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Colors } from "@/constants/theme";

export default function AuthLayout({ title, children }: { title: string; children: React.ReactNode }) {
    const router = useRouter();
    const currentTheme = Colors[useColorScheme() ?? "light"];

    return (
        <View style={{ flex: 1, backgroundColor: currentTheme.white }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={currentTheme.mainText} />
                </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContent}
                bounces={false}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={80}
            >
                <Text style={[styles.title, { color: currentTheme.mainText }]}>{title}</Text>
                <View style={styles.form}>{children}</View>
            </KeyboardAwareScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 30, paddingBottom: 40 },
    title: { fontSize: 42, fontWeight: "bold", marginBottom: 30, marginTop: 10 },
    form: { flex: 1 },
});
