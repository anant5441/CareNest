import { View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ThemeView = ({ style, safe = false, children, ...props }) => {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                // Apply flex: 1 when safe is true to ensure it fills the screen
                safe && { flex: 1 },
                safe && {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                },
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

export default ThemeView;