import { useEffect, useState } from "react";
import { StyleSheet, ScrollView, useColorScheme, View, ViewStyle, DeviceEventEmitter } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { Colors } from "@/constants/theme";

interface MainLayoutProps {
    children: React.ReactNode;
    isScrollable?: boolean;
    style?: ViewStyle;
}

export default function MainLayout({ children, isScrollable = true, style }: MainLayoutProps) {
    const systemScheme = useColorScheme() ?? "light";

    const [activeMode, setActiveMode] = useState<"light" | "dark">("light");

    useEffect(() => {
        const syncTheme = async () => {
            const storedTheme = await SecureStore.getItemAsync("themePreference");

            if (storedTheme === "light" || storedTheme === "dark") {
                setActiveMode(storedTheme);
            } else {
                setActiveMode(systemScheme);
            }
        };

        syncTheme();

        const subscription = DeviceEventEmitter.addListener("themeChanged", (mode) => {
            if (mode === "light" || mode === "dark") {
                setActiveMode(mode);
            } else {
                setActiveMode(systemScheme);
            }
        });

        return () => subscription.remove();
    }, [systemScheme]);

    const currentTheme = Colors[activeMode];

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
