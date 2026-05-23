import { useState } from "react";
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
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();

        if (!cleanUsername || !cleanPassword) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Username và Password");
            return;
        }

        try {
            setIsLoading(true);
            console.log("Chuẩn bị gửi lên server:", `"${cleanUsername}"`, `"${cleanPassword}"`);
            const response = await AuthService.login(cleanUsername, cleanPassword);
            await SecureStore.setItemAsync("username", cleanUsername)
            console.log("Đăng nhập thành công:", response);
            router.replace("/(tabs)");
        } catch (error: any) {
            console.error("Lỗi đăng nhập:", error);
            Alert.alert("Đăng nhập thất bại", String(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: currentTheme.white }}>
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                bounces={false}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={80}
            >
                <View style={styles.topCurveContainer}>
                    <View style={styles.curveWrapper}>
                        <LinearGradient
                            colors={[currentTheme.lightButton, currentTheme.background]}
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

                <View style={styles.formContainer}>
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
                        <Text style={[styles.forgotPasswordText, { color: currentTheme.subText }]}>
                            Forgot password ?
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.buttonRow}>
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
    forgotPasswordText: { fontSize: SIZES.body2 },
    buttonRow: { flexDirection: "row", justifyContent: "space-between" },
});