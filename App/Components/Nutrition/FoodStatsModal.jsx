import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, Modal, TextInput, View, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import serverConfig from "../../Constants/serverConfig";

const FoodStatsModal = ({
                            visible,
                            onClose
                        }) => {
    const [foodName, setFoodName] = useState('');
    const [foodStats, setFoodStats] = useState(null);
    const [foodStatsLoading, setFoodStatsLoading] = useState(false);
    const [foodStatsError, setFoodStatsError] = useState(null);

    const fetchFoodStats = async () => {
        if (!foodName.trim()) {
            setFoodStatsError('Please enter a food name');
            return;
        }

        try {
            setFoodStatsLoading(true);
            setFoodStatsError(null);
            const URL = serverConfig.BaseURL + '/api/auth/analyze/' + foodName.trim();

            const response = await fetch(URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(response.status === 404
                    ? 'Food not found in database'
                    : 'Failed to fetch nutrition data');
            }

            const data = await response.json();
            setFoodStats(data);
        } catch (err) {
            console.error(err);
            setFoodStatsError(err.message || 'Could not fetch food stats');
            setFoodStats(null);
        } finally {
            setFoodStatsLoading(false);
        }
    };

    const handleClose = () => {
        setFoodName('');
        setFoodStats(null);
        setFoodStatsError(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Food Nutrition Analyzer</Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={styles.closeButton}
                        >
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.inputLabel}>Food Name *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter food name (e.g., oats, chicken breast)"
                            value={foodName}
                            onChangeText={setFoodName}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <TouchableOpacity
                            style={styles.analyzeButton}
                            onPress={fetchFoodStats}
                            disabled={!foodName.trim() || foodStatsLoading}
                        >
                            <Text style={styles.analyzeButtonText}>
                                {foodStats ? "Analyze Again" : "Analyze"}
                            </Text>
                        </TouchableOpacity>

                        {foodStatsLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#4a8cff" />
                                <Text style={styles.loadingText}>Analyzing nutrition data...</Text>
                            </View>
                        )}

                        {foodStatsError && (
                            <View style={styles.errorContainer}>
                                <Icon name="error-outline" size={20} color="red" />
                                <Text style={styles.errorText}>{foodStatsError}</Text>
                            </View>
                        )}

                        {foodStats && (
                            <View style={styles.resultsContainer}>
                                <Text style={styles.resultsTitle}>
                                    Nutrition Facts for "{foodName}"
                                </Text>

                                <View style={styles.nutrientRow}>
                                    <View style={styles.nutrientLabel}>
                                        <Icon name="local-pizza" size={18} color="#4a8cff" />
                                        <Text style={styles.nutrientText}>Carbs</Text>
                                    </View>
                                    <Text style={styles.nutrientValue}>{foodStats.carbs * 100}%</Text>
                                </View>

                                <View style={styles.nutrientRow}>
                                    <View style={styles.nutrientLabel}>
                                        <Icon name="whatshot" size={18} color="#ff6b6b" />
                                        <Text style={styles.nutrientText}>Protein</Text>
                                    </View>
                                    <Text style={styles.nutrientValue}>{foodStats.proteins * 100}%</Text>
                                </View>

                                <View style={styles.nutrientRow}>
                                    <View style={styles.nutrientLabel}>
                                        <Icon name="water-drop" size={18} color="#ffd166" />
                                        <Text style={styles.nutrientText}>Fats</Text>
                                    </View>
                                    <Text style={styles.nutrientValue}>{foodStats.fats * 100}%</Text>
                                </View>

                                {foodStats.calories && (
                                    <View style={[styles.nutrientRow, styles.caloriesRow]}>
                                        <View style={styles.nutrientLabel}>
                                            <Icon name="local-fire-department" size={18} color="#ff9e2c" />
                                            <Text style={[styles.nutrientText, styles.caloriesText]}>Calories</Text>
                                        </View>
                                        <Text style={[styles.nutrientValue, styles.caloriesValue]}>
                                            {foodStats.calories}kcal
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={handleClose}
                        >
                            <Text style={styles.closeModalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
    formContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        marginBottom: 15,
    },
    analyzeButton: {
        backgroundColor: '#4a8cff',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    analyzeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginBottom: 15,
    },
    loadingText: {
        marginLeft: 10,
        color: '#666',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffeeee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    errorText: {
        color: 'red',
        marginLeft: 8,
    },
    resultsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
        marginBottom: 15,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    nutrientLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nutrientText: {
        fontSize: 15,
        marginLeft: 8,
        color: '#555',
    },
    nutrientValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    caloriesRow: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    caloriesText: {
        fontWeight: 'bold',
        color: '#333',
    },
    caloriesValue: {
        fontWeight: 'bold',
        color: '#ff9e2c',
    },
    modalButtons: {
        flexDirection: 'row',
    },
    closeModalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    closeModalButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
});

export default FoodStatsModal;