import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { AuthService } from "@/services/AuthService"; 
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    
    const [isReady, setIsReady] = useState(false);
    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await SecureStore.getItemAsync("jwtToken");
                
                if (token) {
                    const isValid = await AuthService.introspect(token);
                    if (isValid) {
                        setInitialRoute("/(tabs)");
                        return;
                    } else {
                        await SecureStore.deleteItemAsync("jwtToken");
                    }
                } 
                setInitialRoute("/onboarding");
            } catch (error) {
                console.error("Error on INTROSPECT:", error)
                setInitialRoute("/onboarding");
            } finally {
                setIsReady(true); 
            }
        };

        checkLoginStatus();
    }, []);

    useEffect(() => {
        if (isReady && initialRoute) {
            router.replace(initialRoute as any);
            setTimeout(() => {
                SplashScreen.hideAsync();
            }, 100);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, initialRoute]);

    if (!isReady) {
        return null;
    }

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack initialRouteName="onboarding">
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />

                <Stack.Screen name="login" options={{ headerShown: false, animation: "slide_from_right" }} />
                <Stack.Screen name="signup" options={{ headerShown: false, animation: "slide_from_right" }} />
                <Stack.Screen name="forgot-password" options={{ headerShown: false, animation: "slide_from_bottom" }} />

                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false, animation: "slide_from_right" }} />

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
