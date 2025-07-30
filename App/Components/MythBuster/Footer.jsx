import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const FooterSection = () => {
    return (
        <View style={styles.footer}>
            <LinearGradient
                colors={['#8e44ad', '#9b59b6']}
                style={styles.footerGradient}
            >
                <Ionicons name="medical" size={24} color="white" />
                <Text style={styles.footerText}>
                    This information is for educational purposes only.{'\n'}
                    Always consult your healthcare provider for personalized advice.
                </Text>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    footerGradient: {
        padding: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 13,
        color: 'white',
        textAlign: 'center',
        marginLeft: 10,
        fontWeight: '500',
        lineHeight: 18,
    },
});

export default FooterSection;