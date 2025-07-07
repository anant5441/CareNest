import React, { useState, useEffect } from 'react';
import {Text, StyleSheet, TouchableOpacity, Modal, TextInput, View, ScrollView, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddMealModal = ({ visible, onClose, mealFormData, onFormDataChange, onAddMeal }) => {
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [isUserOverride, setIsUserOverride] = useState(false);

    // Function to determine meal type based on time
    const getMealTypeFromTime = (hour) => {
        if (hour >= 5 && hour < 11) return 'breakfast';
        if (hour >= 11 && hour < 16) return 'lunch';
        if (hour >= 16 && hour < 21) return 'dinner';
        return 'snack';
    };

    // Initialize time when modal opens
    useEffect(() => {
        if (visible) {
            if (mealFormData.time) {
                const [hour, minute] = mealFormData.time.split(':').map(Number);
                const newTime = new Date();
                newTime.setHours(hour, minute, 0, 0);
                setSelectedTime(newTime);
            } else {
                // Set to current time if no time is set
                const now = new Date();
                setSelectedTime(now);
                const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                handleFormChange('time', timeString);
            }
        }
    }, [visible, mealFormData.time]);

    // Update meal type when time changes (only if user hasn't overridden)
    useEffect(() => {
        if (!isUserOverride) {
            const hour = selectedTime.getHours();
            const suggestedMealType = getMealTypeFromTime(hour);
            if (mealFormData.meal_type !== suggestedMealType) {
                handleFormChange('meal_type', suggestedMealType);
            }
        }
    }, [selectedTime, isUserOverride]);

    const handleFormChange = (field, value) => {
        onFormDataChange({
            ...mealFormData,
            [field]: value
        });
    };

    const handleMealTypeChange = (type) => {
        setIsUserOverride(true);
        handleFormChange('meal_type', type);
    };

    const handleTimeChange = (event, newTime) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }

        if (newTime) {
            setSelectedTime(newTime);
            const timeString = `${newTime.getHours().toString().padStart(2, '0')}:${newTime.getMinutes().toString().padStart(2, '0')}`;
            handleFormChange('time', timeString);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        const time = new Date();
        time.setHours(parseInt(hour), parseInt(minute));

        // Format for display (12-hour format)
        return time.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getSuggestedMealType = () => {
        return getMealTypeFromTime(selectedTime.getHours());
    };

    const showTimePickerModal = () => {
        setShowTimePicker(true);
    };

    const hideTimePickerModal = () => {
        setShowTimePicker(false);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Meal</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                        <Text style={styles.inputLabel}>Meal Name *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter meal name"
                            value={mealFormData.name}
                            onChangeText={(text) => handleFormChange('name', text)}
                        />

                        <Text style={styles.inputLabel}>Time *</Text>
                        <TouchableOpacity
                            style={styles.timePickerButton}
                            onPress={showTimePickerModal}
                        >
                            <Icon name="access-time" size={20} color="#6B46C1" />
                            <Text style={styles.timePickerButtonText}>
                                {mealFormData.time ? formatTime(mealFormData.time) : 'Select time'}
                            </Text>
                            <Icon name="keyboard-arrow-down" size={20} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>
                            Meal Type
                            {!isUserOverride && (
                                <Text style={styles.suggestedText}> (suggested: {getSuggestedMealType()})</Text>
                            )}
                        </Text>
                        <View style={styles.pickerContainer}>
                            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.mealTypeButton,
                                        mealFormData.meal_type === type && styles.selectedMealType,
                                        !isUserOverride && getSuggestedMealType() === type && styles.suggestedMealType
                                    ]}
                                    onPress={() => handleMealTypeChange(type)}
                                >
                                    <Text style={[
                                        styles.mealTypeText,
                                        mealFormData.meal_type === type && styles.selectedMealTypeText
                                    ]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                    {!isUserOverride && getSuggestedMealType() === type && (
                                        <Icon name="auto-awesome" size={14} color="#FFA500" style={styles.suggestedIcon} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        {isUserOverride && (
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => {
                                    setIsUserOverride(false);
                                    handleFormChange('meal_type', getSuggestedMealType());
                                }}
                            >
                                <Icon name="refresh" size={16} color="#6B46C1" />
                                <Text style={styles.resetButtonText}>Reset to suggested</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>

                    <View style={styles.modalButtons}>
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
                    </View>
                </View>
            </View>

            {showTimePicker && (
                <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    onTouchCancel={hideTimePickerModal}
                />
            )}

            {Platform.OS === 'ios' && showTimePicker && (
                <Modal
                    visible={showTimePicker}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={hideTimePickerModal}
                >
                    <View style={styles.timePickerOverlay}>
                        <View style={styles.timePickerContent}>
                            <View style={styles.timePickerHeader}>
                                <Text style={styles.timePickerTitle}>Select Time</Text>
                                <View style={styles.timePickerHeaderButtons}>
                                    <TouchableOpacity
                                        onPress={hideTimePickerModal}
                                        style={styles.timePickerHeaderButton}
                                    >
                                        <Text style={styles.timePickerHeaderButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={hideTimePickerModal}
                                        style={[styles.timePickerHeaderButton, styles.confirmHeaderButton]}
                                    >
                                        <Text style={[styles.timePickerHeaderButtonText, styles.confirmHeaderButtonText]}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.timePickerBody}>
                                <DateTimePicker
                                    value={selectedTime}
                                    mode="time"
                                    is24Hour={false}
                                    display="spinner"
                                    onChange={handleTimeChange}
                                    style={styles.iosTimePicker}
                                />
                            </View>

                            <View style={styles.timePickerPreview}>
                                <Text style={styles.timePreviewText}>
                                    {formatTime(selectedTime.getHours() + ':' + selectedTime.getMinutes())}
                                </Text>
                                <Text style={styles.mealTypePreview}>
                                    Suggested: {getMealTypeFromTime(selectedTime.getHours())}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
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
        maxHeight: 400,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 12,
    },
    suggestedText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFA500',
        fontStyle: 'italic',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    timePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
        gap: 8,
    },
    timePickerButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    selectedMealType: {
        backgroundColor: '#6B46C1',
        borderColor: '#6B46C1',
    },
    suggestedMealType: {
        borderColor: '#FFA500',
        borderWidth: 2,
    },
    mealTypeText: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize',
    },
    selectedMealTypeText: {
        color: 'white',
    },
    suggestedIcon: {
        marginLeft: 2,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        paddingVertical: 4,
    },
    resetButtonText: {
        fontSize: 14,
        color: '#6B46C1',
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

    // Native Time Picker Styles
    timePickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    timePickerContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        maxHeight: '50%',
    },
    timePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 15,
    },
    timePickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    timePickerHeaderButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    timePickerHeaderButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    confirmHeaderButton: {
        backgroundColor: '#6B46C1',
    },
    timePickerHeaderButtonText: {
        fontSize: 16,
        color: '#6B46C1',
        fontWeight: '600',
    },
    confirmHeaderButtonText: {
        color: 'white',
    },
    timePickerBody: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iosTimePicker: {
        width: '100%',
        height: 200,
    },
    timePickerPreview: {
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    timePreviewText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    mealTypePreview: {
        fontSize: 14,
        color: '#FFA500',
        fontStyle: 'italic',
    },
});

export default AddMealModal;