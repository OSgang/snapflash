import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, useColorScheme, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Colors, SIZES } from "@/constants/theme";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";
import { AuthService } from "@/services/AuthService";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
    const router = useRouter();
    const systemScheme = useColorScheme() ?? "light";
    const [activeMode, setActiveMode] = useState<"light" | "dark">("light");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
    }, [systemScheme]);

    const currentTheme = Colors[activeMode];

    const handleSignIn = async () => {
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();

        if (!cleanUsername || !cleanPassword) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Username và Password");
            return;
        }

        try {
            setIsLoading(true);
            const response = await AuthService.login(cleanUsername, cleanPassword);
            if (response && response.jwtToken) {
                await SecureStore.setItemAsync("jwtToken", response.jwtToken);
                await SecureStore.setItemAsync("username", cleanUsername);
                router.replace("/(tabs)");
            } else {
                Alert.alert("Thất bại", "Token không hợp lệ từ máy chủ");
            }
        } catch (error: any) {
            Alert.alert("Đăng nhập thất bại", String(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: currentTheme.white }}>
            <KeyboardAwareScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <View style={styles.topCurveContainer}>
                    <View style={styles.curveWrapper}>
                        <LinearGradient
                            colors={
                                activeMode === "dark"
                                    ? ["#1F325C", "#151718"]
                                    : [currentTheme.primary as string, currentTheme.customBackground as string]
                            }
                            style={styles.gradientCurve}
                        >
                            <Image
                                source={require("@/assets/images/logo.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </LinearGradient>
                    </View>
                </View>

                <View style={[styles.formContainer, { backgroundColor: currentTheme.white }]}>
                    <AuthInput
                        label="Username"
                        placeholder="Enter your username..."
                        value={username}
                        onChangeText={setUsername}
                    />
                    <AuthInput
                        label="Password"
                        placeholder="Enter your password..."
                        isPassword
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.forgotPasswordBtn} onPress={() => router.push("/forgot-password")}>
                        <Text style={[styles.forgotPasswordText, { color: currentTheme.primary }]}>
                            Forgot password?
                        </Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: "row", width: "100%" }}>
                        <AuthButton
                            title="Sign up"
                            variant="secondary"
                            style={{ flex: 1, marginRight: 15 }}
                            onPress={() => router.push("/signup")}
                        />
                        <AuthButton
                            title={isLoading ? "Loading..." : "Sign in"}
                            variant="primary"
                            style={{ flex: 1 }}
                            onPress={handleSignIn}
                            // disabled={isLoading}
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    topCurveContainer: { height: height * 0.55, backgroundColor: "transparent" },
    curveWrapper: {
        position: "absolute",
        top: 0,
        left: -width * 0.5,
        right: -width * 0.5,
        bottom: 0,
        borderBottomLeftRadius: width,
        borderBottomRightRadius: width,
        overflow: "hidden",
    },
    gradientCurve: { flex: 1, justifyContent: "center", alignItems: "center" },
    logo: { width: 250, height: 250, marginTop: 40 },
    formContainer: { flex: 1, paddingHorizontal: 30, paddingTop: 40, paddingBottom: 40 },
    forgotPasswordBtn: { alignSelf: "center", marginBottom: 30 },
    forgotPasswordText: { fontSize: SIZES.body1 },
});