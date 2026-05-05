import { useState } from "react";
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import CustomSwitch from "@/components/CustomSwitch";
import { LinearGradient } from "expo-linear-gradient";
import MainLayout from "@/components/MainLayout";

export default function SettingsScreen() {
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const router = useRouter();

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [autoPlayAudio, setAutoPlayAudio] = useState(true);

    const SettingGroup = ({ title, children }: any) => (
        <View style={styles.groupContainer}>
            <Text style={[styles.groupTitle, { color: currentTheme.subText }]}>{title}</Text>
            <View
                style={[styles.groupBlock, { backgroundColor: currentTheme.white, borderColor: currentTheme.border }]}
            >
                {children}
            </View>
        </View>
    );

    const SettingItem = ({
        icon,
        iconBgColor,
        title,
        rightComponent,
        onPress,
        showBorder = true,
        isExternal = false,
    }: any) => (
        <TouchableOpacity
            style={[styles.menuItem, showBorder && { borderBottomWidth: 1, borderBottomColor: currentTheme.border }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.6 : 1}
            disabled={!onPress}
        >
            <View style={styles.menuLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>{icon}</View>
                <Text style={[styles.menuText, { color: currentTheme.mainText }]}>{title}</Text>
            </View>
            {rightComponent ||
                (isExternal ? (
                    <Feather name="arrow-up-right" size={20} color={currentTheme.subText} />
                ) : (
                    <MaterialCommunityIcons name="chevron-right" size={24} color={currentTheme.subText} />
                ))}
        </TouchableOpacity>
    );

    return (
        <MainLayout>
            <Text style={[styles.headerTitle, { color: currentTheme.mainText }]}>Settings</Text>

            <View
                style={[styles.profileCard, { backgroundColor: currentTheme.white, borderColor: currentTheme.border }]}
            >
                <LinearGradient colors={["#2B78FF", "#5AB0FF"]} style={styles.avatar}>
                    <Text style={styles.avatarText}>K</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.profileName, { color: currentTheme.mainText }]}>Đậu Minh Khôi</Text>
                    <Text style={[styles.profileEmail, { color: currentTheme.subText }]}>khoidau@gmail.com</Text>
                </View>
                <TouchableOpacity style={styles.editProfileBtn}>
                    <Feather name="edit-3" size={18} color={currentTheme.primary} />
                </TouchableOpacity>
            </View>

            <SettingGroup title="STUDY PREFERENCES">
                <SettingItem
                    title="Daily Goal"
                    icon={<Ionicons name="flag-outline" size={20} color="#FF9800" />}
                    iconBgColor="#FFF3E0"
                    rightComponent={<Text style={{ color: currentTheme.subText, fontWeight: "600" }}>20 words</Text>}
                    onPress={() => {}}
                />
                <SettingItem
                    title="Voice & Speech"
                    icon={<Feather name="mic" size={20} color="#E91E63" />}
                    iconBgColor="#FCE4EC"
                    onPress={() => {}}
                />
                <SettingItem
                    title="Auto-play Audio"
                    icon={<Ionicons name="volume-medium-outline" size={20} color="#4CAF50" />}
                    iconBgColor="#E8F5E9"
                    rightComponent={<CustomSwitch value={autoPlayAudio} onValueChange={setAutoPlayAudio} />}
                    showBorder={false}
                />
            </SettingGroup>

            <SettingGroup title="GENERAL">
                <SettingItem
                    title="Dark Mode"
                    icon={<Ionicons name="moon-outline" size={20} color="#5E5CE6" />}
                    iconBgColor="#F2F2F7"
                    rightComponent={<CustomSwitch value={isDarkMode} onValueChange={setIsDarkMode} />}
                />
                <SettingItem
                    title="App Language"
                    icon={<Ionicons name="language-outline" size={20} color="#009688" />}
                    iconBgColor="#E0F2F1"
                    rightComponent={<Text style={{ color: currentTheme.subText }}>English</Text>}
                    onPress={() => {}}
                />
                <SettingItem
                    title="Notification Settings"
                    icon={<Feather name="bell" size={20} color="#FF2D55" />}
                    iconBgColor="#FFE5EB"
                    onPress={() => {}}
                />
                <SettingItem
                    title="Change Password"
                    icon={<Feather name="lock" size={20} color="#007AFF" />}
                    iconBgColor="#E5F1FF"
                    onPress={() => {}}
                    showBorder={false}
                />
            </SettingGroup>

            <SettingGroup title="ACCOUNT & PRIVACY">
                <SettingItem
                    title="Privacy Policy"
                    icon={<Feather name="shield" size={20} color="#673AB7" />}
                    iconBgColor="#F3E5F5"
                    onPress={() => {}}
                />
                <SettingItem
                    title="Terms of Service"
                    icon={<Feather name="file-text" size={20} color="#607D8B" />}
                    iconBgColor="#ECEFF1"
                    onPress={() => {}}
                    showBorder={false}
                />
            </SettingGroup>

            <SettingGroup title="DATA & STORAGE">
                <SettingItem
                    title="Clear Cache"
                    icon={<Feather name="trash-2" size={20} color="#795548" />}
                    iconBgColor="#EFEBE9"
                    rightComponent={<Text style={{ color: currentTheme.subText }}>24.5 MB</Text>}
                    onPress={() => {}}
                />
                <SettingItem
                    title="Export Data (.csv)"
                    icon={<Feather name="download" size={20} color="#FF5722" />}
                    iconBgColor="#FBE9E7"
                    onPress={() => {}}
                    showBorder={false}
                />
            </SettingGroup>

            <SettingGroup title="SUPPORT">
                <SettingItem
                    title="Help Center"
                    icon={<Ionicons name="help-buoy-outline" size={20} color="#32ADE6" />}
                    iconBgColor="#E5F6FD"
                    isExternal={true}
                    onPress={() => {}}
                />
                <SettingItem
                    title="Rate SnapFlash"
                    icon={<AntDesign name="star" size={20} color="#FFCC00" />}
                    iconBgColor="#FFF9E5"
                    isExternal={true}
                    onPress={() => {}}
                    showBorder={false}
                />
            </SettingGroup>

            <View style={styles.logoutContainer}>
                <TouchableOpacity
                    style={[styles.logoutBtn, { backgroundColor: "#FFE5EB" }]}
                    onPress={() => router.replace("/login")}
                >
                    <Feather name="log-out" size={20} color="#FF2D55" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={styles.footerInfo}>
                    <Text style={styles.appVersion}>SnapFlash v1.0.0</Text>
                    <Text style={styles.copyrightText}>Copyright © 2026 OS Gang Team.</Text>
                    <Text style={styles.copyrightText}>All rights reserved.</Text>
                </View>
            </View>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    headerTitle: { fontSize: 36, fontWeight: "900", marginBottom: 25 },
    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderRadius: 20,
        marginBottom: 30,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    avatarText: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
    profileName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
    profileEmail: { fontSize: 13 },
    editProfileBtn: {
        padding: 8,
        backgroundColor: "rgba(43, 120, 255, 0.1)",
        borderRadius: 12,
    },
    groupContainer: { marginBottom: 25 },
    groupTitle: {
        fontSize: 13,
        fontWeight: "700",
        marginLeft: 15,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    groupBlock: {
        borderWidth: 1,
        borderRadius: 20,
        overflow: "hidden",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    menuLeft: { flexDirection: "row", alignItems: "center" },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    menuText: { fontSize: 16, fontWeight: "500" },
    logoutContainer: {
        marginTop: 10,
        alignItems: "center",
    },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
        marginBottom: 25,
    },
    logoutText: { color: "#FF2D55", fontSize: 16, fontWeight: "bold" },
    footerInfo: {
        alignItems: "center",
        gap: 4,
    },
    appVersion: {
        fontSize: 13,
        color: "#666",
        fontWeight: "700",
        marginBottom: 2,
    },
    copyrightText: {
        fontSize: 11,
        color: "#999",
        fontWeight: "500",
    },
});
