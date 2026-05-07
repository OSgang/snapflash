import { useState } from "react";
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Colors, SIZES } from "@/constants/theme";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
    const router = useRouter();
    const currentTheme = Colors[useColorScheme() ?? "light"];

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignIn = () => {
        console.log("Đăng nhập với:", email);
        router.replace("/(tabs)");
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
                    <AuthInput label="Email" placeholder="Enter your email..." value={email} onChangeText={setEmail} />

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
                        <AuthButton title="Sign in" variant="primary" style={{ flex: 1 }} onPress={handleSignIn} />
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
