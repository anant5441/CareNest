import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BackgroundWrapper = ({ children }) => {
    const insets = useSafeAreaInsets();
    return (
        <ImageBackground
            source={require('../assets/Background.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={{ flex: 1, paddingTop: insets.top }}>
                {children}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});

export default BackgroundWrapper;
