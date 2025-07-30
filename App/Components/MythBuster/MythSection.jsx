import React, { useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { staticMyths, categories } from './StaticMyths';

const MythsSection = ({ selectedCategory, setSelectedCategory, fadeAnim }) => {
    const filteredMyths = useMemo(() => {
        return selectedCategory === 'all'
            ? staticMyths
            : staticMyths.filter(myth => myth.category === selectedCategory);
    }, [selectedCategory]);

    return (
        <View style={styles.mythsSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    <Ionicons name="bulb" size={20} color="#8e44ad" /> Common Pregnancy Myths
                </Text>
                <Text style={styles.sectionSubtitle}>
                    Explore evidence-based answers to frequently asked questions
                </Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryFilterContent}
                style={styles.categoryFilter}
            >
                {categories.map(category => {
                    const isActive = selectedCategory === category.key;
                    return (
                        <TouchableOpacity
                            key={category.key}
                            onPress={() => setSelectedCategory(category.key)}
                            style={[
                                styles.filterBtn,
                                isActive && [styles.activeFilterBtn, { backgroundColor: category.color }]
                            ]}
                        >
                            <Ionicons name={category.icon} size={16} color={isActive ? 'white' : category.color} />
                            <Text style={[styles.filterBtnText, isActive && styles.activeFilterBtnText]}>
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {filteredMyths.map((myth) => (
                <Animated.View key={myth.id} style={[styles.mythCard, { opacity: fadeAnim }]}>
                    <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.mythCardGradient}>
                        <View style={styles.mythHeader}>
                            <View style={styles.mythIconContainer}>
                                <Ionicons name={myth.icon} size={24} color="#8e44ad" />
                            </View>
                            <Text style={styles.mythCategoryTag}>{myth.category}</Text>
                        </View>
                        <Text style={styles.mythQuestionText}>{myth.question}</Text>
                        <Text style={styles.mythAnswerText}>{myth.answer}</Text>
                        <Text style={styles.mythSource}>📚 {myth.source}</Text>
                    </LinearGradient>
                </Animated.View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    mythsSection: {
        marginBottom: 30,
        marginHorizontal: 16,
    },
    sectionHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#8e44ad',
        marginBottom: 5,
        textAlign: 'center',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    categoryFilter: {
        marginBottom: 20,
    },
    categoryFilterContent: {
        paddingHorizontal: 0,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 25,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    activeFilterBtn: {
        backgroundColor: '#8e44ad',
        borderColor: '#8e44ad',
    },
    filterBtnText: {
        fontSize: 14,
        color: '#495057',
        marginLeft: 6,
        fontWeight: '600',
    },
    activeFilterBtnText: {
        color: 'white',
    },
    mythCard: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    mythCardGradient: {
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#8e44ad',
    },
    mythHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    mythIconContainer: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 12,
    },
    mythCategoryTag: {
        backgroundColor: '#8e44ad',
        color: 'white',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    mythQuestionText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2c3e50',
        lineHeight: 24,
        marginBottom: 12,
    },
    mythAnswerText: {
        fontSize: 15,
        color: '#495057',
        lineHeight: 22,
        marginBottom: 10,
    },
    mythSource: {
        fontSize: 13,
        color: '#6c757d',
        fontStyle: 'italic',
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 8,
    },
});

export default MythsSection;
