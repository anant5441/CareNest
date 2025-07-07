import React from 'react';
import { Modal, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CView from "../CView";
import Colors from "../../Constants/Colors";


const MealRecapModal = ({ visible, onClose, todayMeals }) => {
    const formatTime = (timeString) => {
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <CView style={styles.modalOverlay}>
                <CView style={styles.modalContent}>
                    <CView style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Today's Meal Recap</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Icon name="close" size={24} color={Colors.mealRecap.icon} />
                        </TouchableOpacity>
                    </CView>

                    <ScrollView style={styles.mealRecapContainer}>
                        {todayMeals.length > 0 ? (
                            todayMeals.map((meal, index) => (
                                <CView key={index} style={styles.recapMealItem}>
                                    <CView style={styles.recapMealHeader}>
                                        <Text style={styles.recapMealTime}>{formatTime(meal.time)}</Text>
                                        <Text style={styles.recapMealType}>{meal.type}</Text>
                                    </CView>
                                    <Text style={styles.recapMealName}>{meal.name}</Text>
                                    <CView style={styles.recapMacros}>
                                        <Text style={styles.recapMacroText}>Carbs: {meal.carbs}%</Text>
                                        <Text style={styles.recapMacroText}>Protein: {meal.protein}%</Text>
                                        <Text style={styles.recapMacroText}>Fat: {meal.fat}%</Text>
                                    </CView>
                                </CView>
                            ))
                        ) : (
                            <CView style={styles.noMealsRecap}>
                                <Text style={styles.noMealsRecapText}>No meals recorded for today</Text>
                            </CView>
                        )}
                    </ScrollView>
                </CView>
            </CView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    mealRecapContainer: {
        maxHeight: 400,
    },
    recapMealItem: {
        backgroundColor: Colors.mealRecap.bg,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    recapMealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    recapMealTime: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    recapMealType: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize',
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    recapMealName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    recapMacros: {
        flexDirection: 'row',
        gap: 16,
    },
    recapMacroText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    noMealsRecap: {
        padding: 40,
        alignItems: 'center',
    },
    noMealsRecapText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default MealRecapModal;