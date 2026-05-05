import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack initialRouteName="onboarding">
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />

                <Stack.Screen name="login" options={{ headerShown: false, animation: "slide_from_right" }} />
                <Stack.Screen name="signup" options={{ headerShown: false, animation: "slide_from_right" }} />
                <Stack.Screen name="forgot-password" options={{ headerShown: false, animation: "slide_from_bottom" }} />

                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                <Stack.Screen name="deck" options={{ headerShown: false }} />
                <Stack.Screen name="edit-card" options={{ headerShown: false }} />
                <Stack.Screen name="card" options={{ headerShown: false }} />

                <Stack.Screen name="scan" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
