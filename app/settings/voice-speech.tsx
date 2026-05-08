import React, { useState } from "react";
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    useColorScheme, 
    ScrollView,
    Modal,
    FlatList
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import MainLayout from "@/components/MainLayout";
import CustomSwitch from "@/components/CustomSwitch";
import { Colors } from "@/constants/theme";

// Danh sách các giọng đọc đề xuất
const ACCENTS = [
    { id: "en-us-f", label: "US English (Female)", icon: "earth", color: "#007AFF", region: "United States" },
    { id: "en-us-m", label: "US English (Male)", icon: "earth", color: "#007AFF", region: "United States" },
    { id: "en-gb-f", label: "UK English (Female)", icon: "earth", color: "#007AFF", region: "United Kingdom" },
    { id: "en-gb-m", label: "UK English (Male)", icon: "earth", color: "#007AFF", region: "United Kingdom" },
    { id: "en-au", label: "Australian English", icon: "earth", color: "#007AFF", region: "Australia" }
];

export default function VoiceSpeechScreen() {
    const router = useRouter();
    const currentTheme = Colors[useColorScheme() ?? "light"];

    // States
    const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
    const [speechRate, setSpeechRate] = useState("1x"); 
    const [autoPlayCard, setAutoPlayCard] = useState(true);
    const [autoPlayAnswer, setAutoPlayAnswer] = useState(false);

    // Modals visibility
    const [isAccentModalVisible, setIsAccentModalVisible] = useState(false);
    const [isAlertVisible, setIsAlertVisible] = useState(false);

    const handleTestVoice = () => {
        setIsAlertVisible(true);
    };

    const SettingGroup = ({ title, children }: any) => (
        <View style={styles.groupContainer}>
            <Text style={[styles.groupTitle, { color: currentTheme.subText }]}>{title}</Text>
            <View style={[styles.groupBlock, { backgroundColor: currentTheme.white, borderColor: currentTheme.border }]}>
                {children}
            </View>
        </View>
    );

    const SpeedOption = ({ label, value }: any) => {
        const isSelected = speechRate === value;
        return (
            <TouchableOpacity 
                style={[
                    styles.speedOption, 
                    { borderColor: currentTheme.border },
                    isSelected && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
                ]}
                onPress={() => setSpeechRate(value)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.speedText, 
                    { color: currentTheme.mainText },
                    isSelected && { color: "#FFF", fontWeight: "bold" }
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <MainLayout>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={currentTheme.mainText} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: currentTheme.mainText }]}>Voice & Speech</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Voice Selection */}
                <SettingGroup title="VOICE ENGINE">
                    {/* Bấm vào đây để mở menu chọn Accent */}
                    <TouchableOpacity 
                        style={styles.menuItem} 
                        activeOpacity={0.7}
                        onPress={() => setIsAccentModalVisible(true)}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconWrapper, { backgroundColor: `${selectedAccent.color}20` }]}>
                                <MaterialCommunityIcons 
                                    name={selectedAccent.icon as any} 
                                    size={20} 
                                    color={selectedAccent.color} 
                                />
                            </View>
                            <View>
                                <Text style={[styles.menuText, { color: currentTheme.mainText }]}>Language & Accent</Text>
                                <Text style={[styles.subValueText, { color: selectedAccent.color, fontWeight: '600' }]}>
                                    {selectedAccent.label}
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={currentTheme.subText} />
                    </TouchableOpacity>
                </SettingGroup>

                {/* Speech Rate */}
                <SettingGroup title="SPEAKING RATE">
                    <View style={styles.speedContainer}>
                        <SpeedOption label="0.5x" value="0.5x" />
                        <SpeedOption label="0.75x" value="0.75x" />
                        <SpeedOption label="Normal" value="1x" />
                        <SpeedOption label="1.25x" value="1.25x" />
                    </View>
                    <Text style={[styles.helperText, { color: currentTheme.subText }]}>
                        Adjust how fast the flashcards are read aloud.
                    </Text>
                </SettingGroup>

                {/* Playback Behaviors */}
                <SettingGroup title="PLAYBACK BEHAVIORS">
                    <View style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: currentTheme.border }]}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconWrapper, { backgroundColor: "#E8F5E9" }]}>
                                <Ionicons name="volume-high" size={20} color="#4CAF50" />
                            </View>
                            <Text style={[styles.menuText, { color: currentTheme.mainText }]}>Auto-play on Front</Text>
                        </View>
                        <CustomSwitch value={autoPlayCard} onValueChange={setAutoPlayCard} />
                    </View>
                    <View style={styles.menuItem}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconWrapper, { backgroundColor: "#E3F2FD" }]}>
                                <Ionicons name="volume-medium" size={20} color="#2196F3" />
                            </View>
                            <Text style={[styles.menuText, { color: currentTheme.mainText }]}>Auto-play on Back</Text>
                        </View>
                        <CustomSwitch value={autoPlayAnswer} onValueChange={setAutoPlayAnswer} />
                    </View>
                </SettingGroup>

                {/* Test Voice Button */}
                <TouchableOpacity 
                    style={[styles.testBtn, { backgroundColor: "rgba(43, 120, 255, 0.1)" }]} 
                    onPress={handleTestVoice}
                    activeOpacity={0.7}
                >
                    <Feather name="play-circle" size={20} color={currentTheme.primary} />
                    <Text style={[styles.testBtnText, { color: currentTheme.primary }]}>Test Audio Settings</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* MODAL CHỌN ACCENT */}
            <Modal
                visible={isAccentModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsAccentModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setIsAccentModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: currentTheme.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: currentTheme.mainText }]}>Select Accent</Text>
                            <TouchableOpacity onPress={() => setIsAccentModalVisible(false)}>
                                <Ionicons name="close" size={24} color={currentTheme.subText} />
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={ACCENTS}
                            keyExtractor={(item) => item.id}
                            bounces={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.accentOption, 
                                        { borderBottomColor: currentTheme.border },
                                        selectedAccent.id === item.id && { backgroundColor: `${item.color}10` }
                                    ]}
                                    onPress={() => {
                                        setSelectedAccent(item);
                                        setIsAccentModalVisible(false);
                                    }}
                                >
                                    <View style={styles.accentLeft}>
                                        <View style={[styles.accentIconWrapper, { backgroundColor: `${item.color}20` }]}>
                                            <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                                        </View>
                                        <View>
                                            <Text style={[
                                                styles.accentLabel, 
                                                { color: selectedAccent.id === item.id ? item.color : currentTheme.mainText },
                                                selectedAccent.id === item.id && { fontWeight: "bold" }
                                            ]}>
                                                {item.label}
                                            </Text>
                                            <Text style={[styles.accentRegion, { color: currentTheme.subText }]}>{item.region}</Text>
                                        </View>
                                    </View>
                                    {selectedAccent.id === item.id && (
                                        <Feather name="check" size={20} color={item.color} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* CUSTOM ALERT CHO TEST AUDIO */}
            <Modal
                visible={isAlertVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsAlertVisible(false)}
            >
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, { backgroundColor: currentTheme.white }]}>
                        <View style={[styles.alertIconBg, { backgroundColor: `${selectedAccent.color}20` }]}>
                            <Feather name="volume-2" size={32} color={selectedAccent.color} />
                        </View>
                        <Text style={[styles.alertTitle, { color: currentTheme.mainText }]}>Testing Audio</Text>
                        <Text style={[styles.alertMessage, { color: currentTheme.subText }]}>
                            Playing sample audio in <Text style={{fontWeight: 'bold', color: selectedAccent.color}}>{selectedAccent.label}</Text> at {speechRate} speed.
                        </Text>
                        <TouchableOpacity 
                            style={[styles.alertBtn, { backgroundColor: currentTheme.primary }]} 
                            onPress={() => setIsAlertVisible(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.alertBtnText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </MainLayout>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: "bold" },
    scrollContent: { paddingBottom: 40 },
    groupContainer: { marginBottom: 25 },
    groupTitle: { fontSize: 13, fontWeight: "700", marginLeft: 15, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" },
    groupBlock: { borderWidth: 1, borderRadius: 20, overflow: "hidden" },
    menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16 },
    menuLeft: { flexDirection: "row", alignItems: "center" },
    iconWrapper: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 14 },
    menuText: { fontSize: 16, fontWeight: "500" },
    subValueText: { fontSize: 13, marginTop: 2 },
    speedContainer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    speedOption: { flex: 1, paddingVertical: 10, marginHorizontal: 4, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    speedText: { fontSize: 14, fontWeight: "500" },
    helperText: { fontSize: 13, paddingHorizontal: 16, paddingBottom: 16, textAlign: "center", marginTop: 5 },
    testBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 16, gap: 10, marginTop: 10 },
    testBtnText: { fontSize: 16, fontWeight: "bold" },

    /* Modal Styles */
    modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingBottom: 40, maxHeight: "70%" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: "bold" },
    accentOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1 },
    accentLeft: { flexDirection: "row", alignItems: "center" },
    accentIconWrapper: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 14 },
    accentLabel: { fontSize: 16 },
    accentRegion: { fontSize: 12, marginTop: 2 },

    /* Alert Styles */
    alertOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
    alertBox: { width: "85%", borderRadius: 24, padding: 24, alignItems: "center" },
    alertIconBg: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", marginBottom: 16 },
    alertTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
    alertMessage: { fontSize: 15, textAlign: "center", marginBottom: 24, lineHeight: 22 },
    alertBtn: { width: "100%", height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    alertBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});