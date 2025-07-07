import React from 'react';
import {Text, StyleSheet, TouchableOpacity, Modal, TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CView from '../CView';

const AddMealModal = ({ visible, onClose, mealFormData, onFormDataChange, onAddMeal }) => {
    const handleFormChange = (field, value) => {
        onFormDataChange({
            ...mealFormData,
            [field]: value
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
                        <Text style={styles.modalTitle}>Add New Meal</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </CView>

                    <CView style={styles.formContainer}>
                        <Text style={styles.inputLabel}>Meal Name *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter meal name"
                            value={mealFormData.name}
                            onChangeText={(text) => handleFormChange('name', text)}
                        />

                        <Text style={styles.inputLabel}>Time *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="HH:MM (e.g., 14:30)"
                            value={mealFormData.time}
                            onChangeText={(text) => handleFormChange('time', text)}
                        />

                        <Text style={styles.inputLabel}>Meal Type</Text>
                        <CView style={styles.pickerContainer}>
                            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.mealTypeButton,
                                        mealFormData.meal_type === type && styles.selectedMealType
                                    ]}
                                    onPress={() => handleFormChange('meal_type', type)}
                                >
                                    <Text style={[
                                        styles.mealTypeText,
                                        mealFormData.meal_type === type && styles.selectedMealTypeText
                                    ]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </CView>
                    </CView>

                    <CView style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={onAddMeal}
                        >
                            <Text style={styles.addButtonText}>Add Meal</Text>
                        </TouchableOpacity>
                    </CView>
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
    formContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 12,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    mealTypeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedMealType: {
        backgroundColor: '#6B46C1',
        borderColor: '#6B46C1',
    },
    mealTypeText: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize',
    },
    selectedMealTypeText: {
        color: 'white',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    addButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#6B46C1',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
});

export default AddMealModal;