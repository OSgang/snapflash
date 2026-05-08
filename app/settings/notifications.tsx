import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    ScrollView,
    Modal,
} from "react-native";

import { useRouter } from "expo-router";

import {
    Ionicons,
    Feather,
    MaterialCommunityIcons,
} from "@expo/vector-icons";

import MainLayout from "@/components/MainLayout";
import CustomSwitch from "@/components/CustomSwitch";
import { Colors } from "@/constants/theme";

const HOURS = Array.from(
    { length: 12 },
    (_, i) => (i + 1).toString().padStart(2, "0")
);

const MINUTES = Array.from(
    { length: 12 },
    (_, i) => (i * 5).toString().padStart(2, "0")
);

const WheelPicker = ({
    items,
    selectedValue,
    onValueChange,
    theme,
}: any) => {
    const itemHeight = 60;

    const [currentIndex, setCurrentIndex] = useState(
        items.indexOf(selectedValue)
    );

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const index = items.indexOf(selectedValue);

        if (index >= 0 && scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({
                    y: index * itemHeight,
                    animated: false,
                });
            }, 100);
        }
    }, []);

    const handleScroll = (event: any) => {
        const y = event.nativeEvent.contentOffset.y;

        let index = Math.round(y / itemHeight);

        if (index < 0) {
            index = 0;
        }

        if (index >= items.length) {
            index = items.length - 1;
        }

        if (index !== currentIndex) {
            setCurrentIndex(index);

            onValueChange(items[index]);
        }
    };

    const padItems = items;

    return (
        <View
            style={{
                height: itemHeight * 3,
                width: 80,
            }}
        >
            <View
                pointerEvents="none"
                style={[
                    styles.highlightBox,
                    {
                        top: itemHeight,
                        height: itemHeight,

                        borderColor:
                            theme.primary + "50",

                        backgroundColor:
                            theme.primary + "10",
                    },
                ]}
            />

            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                decelerationRate="fast"
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
                nestedScrollEnabled
                bounces={false}
                contentContainerStyle={{
                    paddingVertical: itemHeight,
                }}
            >
                {padItems.map((item: string, idx: number) => {
                    const itemIndex = idx;

                    const isSelected =
                        itemIndex === currentIndex;

                    return (
                        <View
                            key={idx}
                            style={{
                                height: itemHeight,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: isSelected
                                        ? 32
                                        : 22,

                                    fontWeight: isSelected
                                        ? "bold"
                                        : "500",

                                    color: isSelected
                                        ? theme.primary
                                        : theme.subText,

                                    opacity: isSelected
                                        ? 1
                                        : 0.4,
                                }}
                            >
                                {item}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default function NotificationsScreen() {
    const router = useRouter();

    const currentTheme =
        Colors[useColorScheme() ?? "light"];

    const [dailyReminder, setDailyReminder] =
        useState(true);

    const [reviewAlerts, setReviewAlerts] =
        useState(true);

    const [weeklyReport, setWeeklyReport] =
        useState(false);

    const [appUpdates, setAppUpdates] =
        useState(true);

    const [reminderTime, setReminderTime] =
        useState("08:00 PM");

    const [isTimePickerVisible, setIsTimePickerVisible] =
        useState(false);

    const [tempHour, setTempHour] =
        useState("08");

    const [tempMinute, setTempMinute] =
        useState("00");

    const [tempPeriod, setTempPeriod] =
        useState("PM");

    const handleSaveTime = () => {
        setReminderTime(
            `${tempHour}:${tempMinute} ${tempPeriod}`
        );

        setIsTimePickerVisible(false);
    };

    const handleOpenTimePicker = () => {
        const [time, period] =
            reminderTime.split(" ");

        const [hour, minute] =
            time.split(":");

        setTempHour(hour);
        setTempMinute(minute);
        setTempPeriod(period);

        setIsTimePickerVisible(true);
    };

    const SettingGroup = ({
        title,
        children,
    }: any) => (
        <View style={styles.groupContainer}>
            <Text
                style={[
                    styles.groupTitle,
                    { color: currentTheme.subText },
                ]}
            >
                {title}
            </Text>

            <View
                style={[
                    styles.groupBlock,
                    {
                        backgroundColor:
                            currentTheme.white,

                        borderColor:
                            currentTheme.border,
                    },
                ]}
            >
                {children}
            </View>
        </View>
    );

    const ToggleItem = ({
        icon,
        iconBgColor,
        title,
        subtitle,
        value,
        onValueChange,
        showBorder = true,
    }: any) => (
        <TouchableOpacity
            style={[
                styles.menuItem,

                showBorder && {
                    borderBottomWidth: 1,
                    borderBottomColor:
                        currentTheme.border,
                },
            ]}
            activeOpacity={0.4}
            onPress={() => onValueChange(!value)}
        >
            <View style={styles.menuLeft}>
                <View
                    style={[
                        styles.iconWrapper,
                        {
                            backgroundColor:
                                iconBgColor,
                        },
                    ]}
                >
                    {icon}
                </View>

                <View style={styles.textContainer}>
                    <Text
                        style={[
                            styles.menuText,
                            {
                                color:
                                    currentTheme.mainText,
                            },
                        ]}
                    >
                        {title}
                    </Text>

                    {subtitle && (
                        <Text
                            style={[
                                styles.subText,
                                {
                                    color:
                                        currentTheme.subText,
                                },
                            ]}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

            <View pointerEvents="none">
                <CustomSwitch
                    value={value}
                    onValueChange={() => {}}
                />
            </View>
        </TouchableOpacity>
    );

    return (
        <MainLayout>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtn}
                    activeOpacity={0.4}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={currentTheme.mainText}
                    />
                </TouchableOpacity>

                <Text
                    style={[
                        styles.headerTitle,
                        {
                            color:
                                currentTheme.mainText,
                        },
                    ]}
                >
                    Notifications
                </Text>

                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.scrollContent
                }
            >
                <SettingGroup title="STUDY REMINDERS">
                    <ToggleItem
                        title="Daily Practice Reminder"
                        subtitle="Remind you to hit your daily goal."
                        icon={
                            <Feather
                                name="clock"
                                size={20}
                                color="#FF9800"
                            />
                        }
                        iconBgColor="#FFF3E0"
                        value={dailyReminder}
                        onValueChange={
                            setDailyReminder
                        }
                    />

                    {dailyReminder && (
                        <TouchableOpacity
                            style={
                                styles.timePickerItem
                            }
                            activeOpacity={0.4}
                            onPress={
                                handleOpenTimePicker
                            }
                        >
                            <Text
                                style={[
                                    styles.menuText,
                                    {
                                        color:
                                            currentTheme.mainText,
                                    },
                                ]}
                            >
                                Reminder Time
                            </Text>

                            <View
                                style={[
                                    styles.timeBox,
                                    {
                                        backgroundColor:
                                            "rgba(43, 120, 255, 0.1)",
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.timeText,
                                        {
                                            color:
                                                currentTheme.primary,
                                        },
                                    ]}
                                >
                                    {reminderTime}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </SettingGroup>
            </ScrollView>

            <Modal
                visible={isTimePickerVisible}
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setIsTimePickerVisible(false)
                }
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() =>
                            setIsTimePickerVisible(
                                false
                            )
                        }
                    />

                    <View
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor:
                                    currentTheme.background,
                            },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text
                                style={[
                                    styles.modalTitle,
                                    {
                                        color:
                                            currentTheme.mainText,
                                    },
                                ]}
                            >
                                Set Reminder Time
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    setIsTimePickerVisible(
                                        false
                                    )
                                }
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={
                                        currentTheme.subText
                                    }
                                />
                            </TouchableOpacity>
                        </View>

                        {isTimePickerVisible && (
                            <View
                                style={
                                    styles.timePickerContainer
                                }
                            >
                                <WheelPicker
                                    items={HOURS}
                                    selectedValue={
                                        tempHour
                                    }
                                    onValueChange={
                                        setTempHour
                                    }
                                    theme={currentTheme}
                                />

                                <Text
                                    style={[
                                        styles.colonText,
                                        {
                                            color:
                                                currentTheme.mainText,
                                        },
                                    ]}
                                >
                                    :
                                </Text>

                                <WheelPicker
                                    items={MINUTES}
                                    selectedValue={
                                        tempMinute
                                    }
                                    onValueChange={
                                        setTempMinute
                                    }
                                    theme={currentTheme}
                                />

                                <View
                                    style={[
                                        styles.pickerColumn,
                                        {
                                            marginLeft: 20,
                                        },
                                    ]}
                                >
                                    <TouchableOpacity
                                        onPress={() =>
                                            setTempPeriod(
                                                "AM"
                                            )
                                        }
                                        style={[
                                            styles.periodBox,
                                            {
                                                backgroundColor:
                                                    tempPeriod ===
                                                    "AM"
                                                        ? currentTheme.primary
                                                        : currentTheme.white,

                                                borderColor:
                                                    tempPeriod ===
                                                    "AM"
                                                        ? currentTheme.primary
                                                        : currentTheme.border,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.periodText,
                                                {
                                                    color:
                                                        tempPeriod ===
                                                        "AM"
                                                            ? "#FFF"
                                                            : currentTheme.subText,
                                                },
                                            ]}
                                        >
                                            AM
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() =>
                                            setTempPeriod(
                                                "PM"
                                            )
                                        }
                                        style={[
                                            styles.periodBox,
                                            {
                                                backgroundColor:
                                                    tempPeriod ===
                                                    "PM"
                                                        ? currentTheme.primary
                                                        : currentTheme.white,

                                                borderColor:
                                                    tempPeriod ===
                                                    "PM"
                                                        ? currentTheme.primary
                                                        : currentTheme.border,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.periodText,
                                                {
                                                    color:
                                                        tempPeriod ===
                                                        "PM"
                                                            ? "#FFF"
                                                            : currentTheme.subText,
                                                },
                                            ]}
                                        >
                                            PM
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.saveBtn,
                                {
                                    backgroundColor:
                                        currentTheme.primary,
                                },
                            ]}
                            onPress={handleSaveTime}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={
                                    styles.saveBtnText
                                }
                            >
                                Save Time
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    backBtn: {
        padding: 4,
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },

    scrollContent: {
        paddingBottom: 40,
    },

    groupContainer: {
        marginBottom: 25,
    },

    groupTitle: {
        fontSize: 13,
        fontWeight: "700",
        marginLeft: 15,
        marginBottom: 8,
        letterSpacing: 0.5,
        textTransform: "uppercase",
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

    menuLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        paddingRight: 10,
    },

    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },

    textContainer: {
        flex: 1,
    },

    menuText: {
        fontSize: 16,
        fontWeight: "500",
    },

    subText: {
        fontSize: 12,
        marginTop: 4,
        lineHeight: 16,
    },

    timePickerItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        paddingLeft: 66,
    },

    timeBox: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },

    timeText: {
        fontSize: 15,
        fontWeight: "bold",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },

    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },

    timePickerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },

    highlightBox: {
        position: "absolute",
        top: 60,
        height: 60,
        width: "100%",
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderRadius: 12,
    },

    pickerColumn: {
        alignItems: "center",
        justifyContent: "center",
        gap: 15,
    },

    colonText: {
        fontSize: 32,
        fontWeight: "bold",
        marginHorizontal: 15,
    },

    periodBox: {
        width: 60,
        height: 45,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    periodText: {
        fontSize: 16,
        fontWeight: "bold",
    },

    saveBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },

    saveBtnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});