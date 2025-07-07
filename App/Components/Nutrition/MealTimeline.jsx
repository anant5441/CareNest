import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CView from '../CView';
import Loading from "../Loading";
import Colors from "../../Constants/Colors";

const MealTimeline = ({ dailyMeals, mealsLoading }) => {
    const formatTime = (timeString) => {
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (mealsLoading) {
        return (
            <CView style={styles.mealTimelineContainer}>
                <Text style={styles.timelineTitle}>Daily Meals</Text>
                <CView style={styles.loadingContainer}>
                    <Loading />
                </CView>
            </CView>
        );
    }

    return (
        <CView style={styles.mealTimelineContainer}>
            <Text style={styles.timelineTitle}>Daily Meals</Text>
            {dailyMeals.length > 0 ? (
                <CView style={styles.mealsContainer}>
                    {dailyMeals.map((meal, index) => (
                        <CView key={index} style={styles.mealItem}>
                            <CView style={styles.mealTimeContainer}>
                                <Text style={styles.mealTime}>{formatTime(meal.time)}</Text>
                                <Text style={styles.mealType}>{meal.type}</Text>
                            </CView>
                            <CView style={styles.mealDetailsContainer}>
                                <Text style={styles.mealName}>{meal.name}</Text>
                                <CView style={styles.macrosContainer}>
                                    <Text style={styles.macroText}>C: {meal.carbs}%</Text>
                                    <Text style={styles.macroText}>P: {meal.protein}%</Text>
                                    <Text style={styles.macroText}>F: {meal.fat}%</Text>
                                </CView>
                            </CView>
                            <TouchableOpacity style={styles.editMealButton}>
                                <Icon name="edit" size={20} color="#6B46C1" />
                            </TouchableOpacity>
                        </CView>
                    ))}
                </CView>
            ) : (
                <CView style={styles.noMealsContainer}>
                    <Text style={styles.noMealsText}>No meals recorded for this day</Text>
                </CView>
            )}
        </CView>
    );
};

const styles = StyleSheet.create({
    mealTimelineContainer: {
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    timelineTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    loadingContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    mealsContainer: {
        backgroundColor: Colors.mealContainerBackground,
        borderRadius: 16,
        padding: 16,
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    mealTimeContainer: {
        width: 80,
        alignItems: 'flex-start',
    },
    mealTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    mealType: {
        fontSize: 12,
        color: '#666',
        textTransform: 'capitalize',
    },
    mealDetailsContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    mealName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    macrosContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    macroText: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    editMealButton: {
        padding: 8,
        backgroundColor: 'rgba(107, 70, 193, 0.1)',
        borderRadius: 20,
    },
    noMealsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
    },
    noMealsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default MealTimeline;