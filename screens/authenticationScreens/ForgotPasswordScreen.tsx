import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Colors } from "@/constants/theme";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const currentTheme = Colors[useColorScheme() ?? "light"];

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const handleResetPassword = () => {
        console.log("Khôi phục mật khẩu cho:", email);
        router.back();
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
                <Text style={[styles.title, { color: currentTheme.mainText }]}>Forgot password ?</Text>

                <View style={styles.form}>
                    <AuthInput
                        label="Email"
                        placeholder="Enter your email..."
                        value={email}
                        onChangeText={setEmail}
                    />

                    <AuthInput
                        label="New Password"
                        placeholder="Enter new password..."
                        isPassword
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />

                    <AuthInput
                        label="Re-enter New Password"
                        placeholder="Confirm new password..."
                        isPassword
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                    />

                    <Text style={[styles.disclaimer, { color: currentTheme.subText }]}>
                        By resetting password you agree to our{"\n"}
                        <Text style={{ fontWeight: "bold" }}>terms and conditions</Text>
                    </Text>

                    <AuthButton title="Reset password" onPress={handleResetPassword} style={styles.mainBtn} />
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
