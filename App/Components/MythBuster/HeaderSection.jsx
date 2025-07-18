import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { staticMyths, categories } from './StaticMyths';

const HeaderSection = () => (
    <LinearGradient
        colors={['#8e44ad', '#9b59b6', '#af7ac5']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
                <Ionicons name="shield-checkmark" size={32} color="white" />
            </View>
            <Text style={styles.headerTitle}>Pregnancy Myth Buster</Text>
            <Text style={styles.headerSubtitle}>
                Get evidence-based answers to your pregnancy questions
            </Text>
            <View style={styles.headerStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{staticMyths.length}</Text>
                    <Text style={styles.statLabel}>Myths Busted</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{categories.length - 1}</Text>
                    <Text style={styles.statLabel}>Categories</Text>
                </View>
            </View>
        </View>
    </LinearGradient>
);

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 15,
        borderRadius: 50,
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 20,
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 20,
    },
});

export default HeaderSection;
