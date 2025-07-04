import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../Constants/Colors';

const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <ActivityIndicator
                size="large"
                color={'#3B82F6'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
});

export default LoadingScreen;