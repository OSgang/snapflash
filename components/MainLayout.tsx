import { StyleSheet, ScrollView, useColorScheme, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";

interface MainLayoutProps {
    children: React.ReactNode;
    isScrollable?: boolean;
    style?: ViewStyle;
}

export default function MainLayout({ children, isScrollable = true, style }: MainLayoutProps) {
    const currentTheme = Colors[useColorScheme() ?? "light"];

    const content = isScrollable ? (
        <ScrollView contentContainerStyle={[styles.scrollContent, style]} showsVerticalScrollIndicator={false}>
            {children}
        </ScrollView>
    ) : (
        <View style={[styles.scrollContent, style]}>{children}</View>
    );

    return (
        <LinearGradient colors={[currentTheme.customBackground as string, currentTheme.white]} style={styles.container}>
            <SafeAreaView edges={["top"]} style={styles.safeArea}>
                {content}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 15,
        paddingBottom: 130,
    },
});
