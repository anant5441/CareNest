import React, {useCallback, useRef, useState} from 'react';
import {Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import BackgoundWrapper from "../../Components/BackgoundWrapper";
import Loader from "../../Components/MealLoading";
import Result from "../../Components/MealResult";
import Colors from "../../Constants/Colors";
import ServerConfig from "../../Constants/serverConfig";

const { width, height } = Dimensions.get('window');

const generateMealPlan = async (formData) => {
    formData.meal_duration = "1";
    const url = ServerConfig.BaseURL + '/api/f3/generate';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error generating meal plan:', error);
        throw error;
    }
};

// Main Form Component
const MealPlanForm = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [otherInputs, setOtherInputs] = useState({});
    const [formData, setFormData] = useState({
        meal_duration: '',
        age: '',
        diet: '',
        diet_notes: '',
        allergies: '',
        nutrient_focus: '',
        foods_tolerated: '',
        medical_conditions: '',
        cultural_preference: ''
    });

    // Use refs to prevent re-renders affecting TextInput focus
    const otherInputRefs = useRef({});

    const questions = [
        {
            key: 'age',
            title: '👶 Age',
            question: 'What\'s the age in months?',
            type: 'input',
            placeholder: 'Enter age in months (e.g., 12)'
        },
        {
            key: 'diet',
            title: '🥗 Diet Type',
            question: 'What type of diet do you prefer?',
            options: ['Vegetarian', 'Vegan', 'Non-vegetarian', 'Pescatarian', 'Others Specify']
        },
        {
            key: 'nutrient_focus',
            title: '💪 Nutrient Focus',
            question: 'Which nutrient should we focus on?',
            options: ['VitaminA', 'Iron', 'Calcium', 'Protein', 'VitaminD', 'Others Specify']
        },
        {
            key: 'cultural_preference',
            title: '🌍 Cultural Preference',
            question: 'Any cultural food preferences?',
            options: ['Indian', 'Mediterranean', 'Asian', 'Western', 'None', 'Others Specify']
        },
        {
            key: 'allergies',
            title: '⚠️ Allergies',
            question: 'Any known allergies?',
            options: ['None', 'Nuts', 'Dairy', 'Gluten', 'Eggs', 'Others Specify']
        },
        {
            key: 'medical_conditions',
            title: '🏥 Medical Conditions',
            question: 'Any medical conditions to consider?',
            options: ['None', 'Diabetes', 'Hypertension', 'Digestive Issues', 'Others Specify']
        }
    ];

    const handleOptionSelect = (value) => {
        const currentKey = questions[currentStep].key;
        setFormData(prev => ({
            ...prev,
            [currentKey]: value
        }));

        // Clear other input if switching away from "Others Specify"
        if (value !== 'Others Specify') {
            setOtherInputs(prev => ({
                ...prev,
                [currentKey]: ''
            }));
        }
    };

    // Use useCallback to prevent function recreation on every render
    const handleOtherInputChange = useCallback((value) => {
        const currentKey = questions[currentStep].key;

        // Update other inputs state
        setOtherInputs(prev => {
            const newState = {
                ...prev,
                [currentKey]: value
            };
            return newState;
        });
    }, [currentStep]);

    const handleAgeInputChange = useCallback((value) => {
        setFormData(prev => ({
            ...prev,
            age: value
        }));
    }, []);

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleSubmit = async () => {
        // Process form data, replacing "Others Specify" with actual input values
        const processedFormData = { ...formData };

        Object.keys(otherInputs).forEach(key => {
            if (formData[key] === 'Others Specify' && otherInputs[key]) {
                processedFormData[key] = otherInputs[key];
            }
        });

        // Add default values for missing fields
        const completeFormData = {
            ...processedFormData,
            diet_notes: processedFormData.nutrient_focus === 'Iron' ? 'ensure iron bioavailability with vitamin C' : 'balanced nutrition',
            foods_tolerated: 'Sweet potato, oats'
        };

        setIsLoading(true);
        try {
            const response = await generateMealPlan(completeFormData);
            setResult(response);
        } catch (error) {
            console.error('Error generating meal plan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setCurrentStep(0);
        setResult(null);
        setOtherInputs({});
        otherInputRefs.current = {};
        setFormData({
            meal_duration: '',
            age: '',
            diet: '',
            diet_notes: '',
            allergies: '',
            nutrient_focus: '',
            foods_tolerated: '',
            medical_conditions: '',
            cultural_preference: ''
        });
    };

    // Memoize the validation function to prevent unnecessary re-calculations
    const isCurrentStepValid = React.useMemo(() => {
        const currentQuestion = questions[currentStep];
        const currentValue = formData[currentQuestion.key];

        if (currentQuestion.type === 'input') {
            // For age input, check if it's not empty and is a valid number
            return currentValue && currentValue.trim() !== '' && !isNaN(currentValue);
        } else {
            // For options, check if something is selected
            if (!currentValue) return false;

            // If "Others Specify" is selected, check if the input field is filled
            if (currentValue === 'Others Specify') {
                const otherInput = otherInputs[currentQuestion.key];
                return otherInput && otherInput.trim() !== '';
            }

            return true;
        }
    }, [currentStep, formData, otherInputs]);

    // Create a separate component for the "Others" input to prevent re-renders
    const OthersInput = React.memo(({ questionKey, placeholder, value, onChangeText }) => {
        return (
            <TextInput
                ref={ref => {
                    if (ref) {
                        otherInputRefs.current[questionKey] = ref;
                    }
                }}
                style={styles.otherInput}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={2}
                autoFocus={true}
                blurOnSubmit={false}
            />
        );
    });

    if (result) {
        return <Result result={result} onBack={resetForm} />;
    }

    if (isLoading) {
        return <Loader />;
    }

    const currentQuestion = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;
    const isValid = isCurrentStepValid;

    return (
        <BackgoundWrapper>
            <View style={styles.container}>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>

                {/* Question Counter */}
                <Text style={styles.questionCounter}>
                    {currentStep + 1} of {questions.length}
                </Text>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.questionContainer}>
                        <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
                        <Text style={styles.questionText}>{currentQuestion.question}</Text>

                        {currentQuestion.type === 'input' ? (
                            // Age Input Field
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.ageInput}
                                    placeholder={currentQuestion.placeholder}
                                    value={formData[currentQuestion.key]}
                                    onChangeText={handleAgeInputChange}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        ) : (
                            // Options
                            <View style={styles.optionsContainer}>
                                {currentQuestion.options.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.optionButton,
                                            formData[currentQuestion.key] === option && styles.selectedOption
                                        ]}
                                        onPress={() => handleOptionSelect(option)}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            formData[currentQuestion.key] === option && styles.selectedOptionText
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}

                                {/* Others Specify Input Field */}
                                {formData[currentQuestion.key] === 'Others Specify' && (
                                    <OthersInput
                                        questionKey={currentQuestion.key}
                                        placeholder={`Specify your ${currentQuestion.title.toLowerCase().replace(/[^\w\s]/gi, '').trim()}...`}
                                        value={otherInputs[currentQuestion.key] || ''}
                                        onChangeText={handleOtherInputChange}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Navigation */}
                <View style={styles.navigationContainer}>
                    {currentStep > 0 && (
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => setCurrentStep(currentStep - 1)}
                        >
                            <Text style={styles.backBtnText}>← Back</Text>
                        </TouchableOpacity>
                    )}

                    {currentStep < questions.length - 1 ? (
                        <TouchableOpacity
                            style={[
                                styles.nextButton,
                                !isValid && styles.disabledButton
                            ]}
                            onPress={handleNext}
                            disabled={!isValid}
                        >
                            <Text style={[
                                styles.nextButtonText,
                                !isValid && styles.disabledButtonText
                            ]}>
                                Next →
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        isValid && (
                            <TouchableOpacity style={styles.generateButton} onPress={handleSubmit}>
                                <Text style={styles.generateButtonText}>🎯 Generate</Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </View>
        </BackgoundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(248,249,255,0.35)',
    },
    progressContainer: {
        height: 4,
        backgroundColor: Colors.genMealProgressBarEmpty,
        marginTop: 50,
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.genMealProgressBarFill,
        borderRadius: 2,
    },
    questionCounter: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
        color: '#000000',
        fontWeight: '500',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    questionContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    questionTitle: {
        fontSize: 32,
        marginBottom: 15,
        textAlign: 'center',
    },
    questionText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#2D3748',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 32,
    },
    inputContainer: {
        width: '100%',
        maxWidth: 400,
    },
    ageInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: Colors.genMealOptionBorder,
        borderRadius: 15,
        paddingVertical: 20,
        paddingHorizontal: 25,
        fontSize: 18,
        textAlign: 'center',
        color: '#2D3748',
    },
    optionsContainer: {
        width: '100%',
        maxWidth: 400,
    },
    optionButton: {
        backgroundColor: Colors.genMealOptionPrimary,
        paddingVertical: 20,
        paddingHorizontal: 25,
        marginVertical: 8,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: Colors.genMealOptionBorder,
    },
    selectedOption: {
        borderColor: Colors.genMealOptionSelected,
        backgroundColor: Colors.genMealOptionPrimary,
        transform: [{ scale: 1.02 }],
    },
    optionText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#2D3748',
        fontWeight: '500',
    },
    selectedOptionText: {
        color: Colors.genMealOptionSelected,
        fontWeight: '600',
    },
    otherInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: Colors.genMealOptionSelected,
        borderRadius: 15,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginTop: 15,
        fontSize: 16,
        color: '#2D3748',
        textAlignVertical: 'top',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 10,
    },
    backBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    backBtnText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    nextButton: {
        backgroundColor: Colors.genMealOptionSelected,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    disabledButtonText: {
        color: '#999999',
    },
    generateButton: {
        backgroundColor: Colors.genMealOptionSelected,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    generateButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default MealPlanForm;