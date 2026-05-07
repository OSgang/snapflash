jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    Stack: {
        Screen: () => null,
    },
}));

jest.mock("@expo/vector-icons", () => {
    const React = require("react");
    const { Text } = require("react-native");

    const MockIcon = ({ name, ...props }: { name: string }) => {
        return React.createElement(Text, props, name);
    };

    return {
        MaterialIcons: MockIcon,
        MaterialCommunityIcons: MockIcon,
        Ionicons: MockIcon,
        AntDesign: MockIcon,
        Feather: MockIcon,
        FontAwesome5: MockIcon,
    };
});

jest.mock("expo-camera", () => ({
    CameraView: () => null,
    useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));

jest.mock("expo-image-picker", () => ({
    launchImageLibraryAsync: jest.fn(),
}));

jest.mock("expo-blur", () => ({
    BlurView: ({ children }: any) => children,
}));

jest.mock("expo-linear-gradient", () => ({
    LinearGradient: ({ children }: any) => children,
}));

jest.mock("@/components/BarChart", () => "BarChart");
jest.mock("@/components/LearningPipeline", () => "LearningPipeline");
