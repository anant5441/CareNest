import React, { useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions} from 'react-native';
import BackgoundWrapper from "./BackgoundWrapper";
import Colors from "../Constants/Colors";

const { width } = Dimensions.get('window');

// Results Component
const ResultsScreen = ({ result, onBack }) => {
    return (
        <BackgoundWrapper>
            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <View style={styles.celebrationIcon}>
                            <Text style={styles.celebrationEmoji}>🎉</Text>
                        </View>
                        <Text style={styles.title}>Your Meal Plan is Ready!</Text>
                        <Text style={styles.subtitle}>Enjoy your personalized nutrition journey</Text>
                    </View>

                    {/* Results Card */}
                    <View style={styles.resultsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>📋 Your Plan</Text>
                            <View style={styles.divider} />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.resultText}>{result.result}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={onBack}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>✨ Create Another Plan</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </BackgoundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(248, 250, 252, 0.3)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // Header Section
    headerSection: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 30,
    },
    celebrationIcon: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    celebrationEmoji: {
        fontSize: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1A202C',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        fontWeight: '500',
    },

    // Results Card
    resultsCard: {
        marginHorizontal: 20,
        marginBottom: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 12,
        overflow: 'hidden',
    },
    cardHeader: {
        backgroundColor: 'rgba(66, 153, 225, 0.08)',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(226, 232, 240, 0.5)',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2D3748',
        marginBottom: 12,
    },
    divider: {
        height: 3,
        backgroundColor: Colors.genMealPrimary,
        borderRadius: 2,
        width: 40,
    },
    cardContent: {
        padding: 24,
    },
    resultText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#4A5568',
        fontWeight: '400',
        letterSpacing: 0.2,
    },

    // Action Section
    actionSection: {
        paddingHorizontal: 20,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: Colors.genMealPrimary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: Colors.genMealPrimary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(226, 232, 240, 0.8)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButtonText: {
        color: '#4A5568',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});

export default ResultsScreen;