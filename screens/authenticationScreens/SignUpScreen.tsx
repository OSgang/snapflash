import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Colors } from "@/constants/theme";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";

export default function SignUpScreen() {
    const router = useRouter();
    const currentTheme = Colors[useColorScheme() ?? "light"];

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignUp = () => {
        console.log("Đăng ký tài khoản:", email);
        router.replace("/(tabs)");
    };

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
                <Text style={[styles.title, { color: currentTheme.mainText }]}>Sign up</Text>

                <View style={styles.form}>
                    <AuthInput
                        label="Email"
                        placeholder="Enter your email..."
                        value={email}
                        onChangeText={setEmail}
                    />

                    <AuthInput
                        label="Password"
                        placeholder="Enter your password..."
                        isPassword
                        value={password}
                        onChangeText={setPassword}
                    />

                    <AuthInput
                        label="Re-enter Password"
                        placeholder="Re-enter your password..."
                        isPassword
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <Text style={[styles.disclaimer, { color: currentTheme.subText }]}>
                        By creating account you agree to our{"\n"}
                        <Text style={{ fontWeight: "bold" }}>terms and conditions</Text>
                    </Text>

                    <AuthButton title="Sign up" onPress={handleSignUp} style={styles.mainBtn} />
                </View>
            </KeyboardAwareScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: "bold",
        marginBottom: 30,
        marginTop: 10,
    },
    form: {
        flex: 1,
    },
    disclaimer: {
        fontSize: 12,
        textAlign: "center",
        lineHeight: 18,
        marginVertical: 12,
    },
    mainBtn: {
        marginTop: 10,
        width: "100%",
    },
});
