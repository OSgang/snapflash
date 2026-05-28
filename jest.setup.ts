jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (callback: () => void | (() => void)) => {
        const React = require("react");
        React.useEffect(() => callback(), [callback]);
    },
    Stack: {
        Screen: () => null,
    },
}));

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(() => Promise.resolve(null)),
    setItemAsync: jest.fn(() => Promise.resolve()),
    deleteItemAsync: jest.fn(() => Promise.resolve()),
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

jest.mock("expo-camera", () => {
    const React = require("react");
    const { View } = require("react-native");

    const CameraView = React.forwardRef(({ children, ...props }: any, ref: any) => {
        React.useImperativeHandle(ref, () => ({
            takePictureAsync: jest.fn(() => Promise.resolve({ uri: "camera-photo.jpg" })),
        }));
        return React.createElement(View, props, children);
    });

    return {
        CameraView,
        useCameraPermissions: () => [{ granted: true }, jest.fn()],
    };
});

jest.mock("expo-image-picker", () => ({
    MediaTypeOptions: {
        Images: "Images",
    },
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
