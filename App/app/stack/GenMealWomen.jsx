import React, {useCallback, useRef, useState, useMemo} from 'react';
import {Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import serverConfig from "../../Constants/serverConfig";

const { width, height } = Dimensions.get('window');

const generatePregnancyMealPlan = async (formData) => {
    const url =  serverConfig.BaseURL + '/api/f6/generate';
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
        console.error('Error generating pregnancy meal plan:', error);
        throw error;
    }
};

// Loading Component - Memoized to prevent re-renders
const PregnancyLoader = React.memo(() => (
    <View style={styles.loaderContainer}>
        <Text style={styles.loaderText}>🤱 Generating your pregnancy meal plan...</Text>
        <Text style={styles.loaderSubtext}>Creating nutritious meals for you and your baby</Text>
    </View>
));

// Result Component - Memoized to prevent re-renders
const PregnancyResult = React.memo(({ result, onBack }) => (
    <ScrollView style={styles.resultContainer}>
        <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>🍽️ Your Pregnancy Meal Plan</Text>
        </View>

        <View style={styles.resultContent}>
            <Text style={styles.mealPlanText}>{result.result}</Text>

            {result.sources && result.sources.length > 0 && (
                <View style={styles.sourcesContainer}>
                    <Text style={styles.sourcesTitle}>📚 Sources:</Text>
                    {result.sources.map((source, index) => (
                        <Text key={index} style={styles.sourceItem}>
                            • {source.source.split('\\').pop().replace('.pdf', '')}
                        </Text>
                    ))}
                </View>
            )}
        </View>

        <TouchableOpacity style={styles.newPlanButton} onPress={onBack}>
            <Text style={styles.newPlanButtonText}>Create New Plan</Text>
        </TouchableOpacity>
    </ScrollView>
));

// Optimized Others Input Component - Memoized and isolated
const OthersInput = React.memo(({ questionKey, placeholder, value, onChangeText, autoFocus = true }) => {
    return (
        <TextInput
            style={styles.otherInput}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="#999"
            multiline={true}
            numberOfLines={2}
            autoFocus={autoFocus}
            blurOnSubmit={false}
        />
    );
});

// Option Button Component - Memoized to prevent unnecessary re-renders
const OptionButton = React.memo(({ option, isSelected, onPress }) => (
    <TouchableOpacity
        style={[
            styles.optionButton,
            isSelected && styles.selectedOption
        ]}
        onPress={onPress}
    >
        <Text style={[
            styles.optionText,
            isSelected && styles.selectedOptionText
        ]}>
            {option}
        </Text>
    </TouchableOpacity>
));

// Input Field Component - Memoized for better performance
const InputField = React.memo(({ placeholder, value, onChangeText, keyboardType = "default" }) => (
    <View style={styles.inputContainer}>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            placeholderTextColor="#999"
        />
    </View>
));

// Progress Bar Component - Memoized
const ProgressBar = React.memo(({ progress }) => (
    <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
));

// Header Component - Memoized since it's static
const Header = React.memo(() => (
    <View style={styles.header}>
        <Text style={styles.headerTitle}>🤱 Pregnancy Meal Planner</Text>
        <Text style={styles.headerSubtitle}>Nutritious meals for you and your baby</Text>
    </View>
));

// Question Counter Component - Memoized
const QuestionCounter = React.memo(({ current, total }) => (
    <Text style={styles.questionCounter}>
        {current} of {total}
    </Text>
));

// Navigation Buttons Component - Memoized
const NavigationButtons = React.memo(({
                                          currentStep,
                                          totalSteps,
                                          isValid,
                                          onBack,
                                          onNext,
                                          onSubmit
                                      }) => (
    <View style={styles.navigationContainer}>
        {currentStep > 0 && (
            <TouchableOpacity
                style={styles.backBtn}
                onPress={onBack}
            >
                <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
        )}

        {currentStep < totalSteps - 1 ? (
            <TouchableOpacity
                style={[
                    styles.nextButton,
                    !isValid && styles.disabledButton
                ]}
                onPress={onNext}
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
                <TouchableOpacity style={styles.generateButton} onPress={onSubmit}>
                    <Text style={styles.generateButtonText}>🎯 Generate Plan</Text>
                </TouchableOpacity>
            )
        )}
    </View>
));

// Main Form Component
const PregnancyMealPlanForm = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [otherInputs, setOtherInputs] = useState({});
    const [formData, setFormData] = useState({
        pregnancy_month: '',
        diet_type: '',
        allergies: '',
        nutrient_focus: '',
        medical_condition: '',
        cultural_preference: '',
        preference: ''
    });

    // Memoize questions array to prevent recreation on every render
    const questions = useMemo(() => [
        {
            key: 'pregnancy_month',
            title: '🤱 Pregnancy Month',
            question: 'Which month of pregnancy are you in?',
            type: 'input',
            placeholder: 'Enter pregnancy month (1-9)'
        },
        {
            key: 'diet_type',
            title: '🥗 Diet Type',
            question: 'What type of diet do you follow?',
            options: ['Vegetarian', 'Vegan', 'Non-vegetarian', 'Pescatarian', 'Others Specify']
        },
        {
            key: 'allergies',
            title: '⚠️ Allergies',
            question: 'Do you have any food allergies?',
            options: ['None', 'Nuts', 'Dairy', 'Gluten', 'Eggs', 'Shellfish', 'Others Specify']
        },
        {
            key: 'nutrient_focus',
            title: '💊 Nutrient Focus',
            question: 'Which nutrients are you focusing on?',
            options: ['Iron & Folic Acid', 'Calcium & Vitamin D', 'Protein', 'Omega-3', 'All Essential', 'Others Specify']
        },
        {
            key: 'medical_condition',
            title: '🏥 Medical Conditions',
            question: 'Any pregnancy-related medical conditions?',
            options: ['None', 'Gestational Diabetes', 'High Blood Pressure', 'Anemia', 'Morning Sickness', 'Others Specify']
        },
        {
            key: 'cultural_preference',
            title: '🌍 Cultural Preference',
            question: 'Any cultural food preferences?',
            options: ['Indian', 'Mediterranean', 'Asian', 'Western', 'Mixed', 'Others Specify']
        },
        {
            key: 'preference',
            title: '👅 Food Preferences',
            question: 'Any specific food preferences?',
            options: ['Spicy', 'Mild', 'Low-carb', 'High-protein', 'No preference', 'Others Specify']
        }
    ], []);

    // Memoized handlers to prevent recreation on every render
    const handleOptionSelect = useCallback((value) => {
        const currentKey = questions[currentStep].key;
        setFormData(prev => ({
            ...prev,
            [currentKey]: value
        }));

        if (value !== 'Others Specify') {
            setOtherInputs(prev => ({
                ...prev,
                [currentKey]: ''
            }));
        }
    }, [currentStep, questions]);

    const handleOtherInputChange = useCallback((value) => {
        const currentKey = questions[currentStep].key;
        setOtherInputs(prev => ({
            ...prev,
            [currentKey]: value
        }));
    }, [currentStep, questions]);

    const handleInputChange = useCallback((value) => {
        const currentKey = questions[currentStep].key;
        setFormData(prev => ({
            ...prev,
            [currentKey]: value
        }));
    }, [currentStep, questions]);

    const handleNext = useCallback(() => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    }, [currentStep, questions.length]);

    const handleBack = useCallback(() => {
        setCurrentStep(currentStep - 1);
    }, [currentStep]);

    const handleSubmit = useCallback(async () => {
        const processedFormData = { ...formData };

        // Replace "Others Specify" with actual input values
        Object.keys(otherInputs).forEach(key => {
            if (formData[key] === 'Others Specify' && otherInputs[key]) {
                processedFormData[key] = otherInputs[key];
            }
        });

        setIsLoading(true);
        try {
            const response = await generatePregnancyMealPlan(processedFormData);
            setResult(response);
        } catch (error) {
            console.error('Error generating pregnancy meal plan:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsLoading(false);
        }
    }, [formData, otherInputs]);

    const resetForm = useCallback(() => {
        setCurrentStep(0);
        setResult(null);
        setOtherInputs({});
        setFormData({
            pregnancy_month: '',
            diet_type: '',
            allergies: '',
            nutrient_focus: '',
            medical_condition: '',
            cultural_preference: '',
            preference: ''
        });
    }, []);

    // Memoized validation logic
    const isCurrentStepValid = useMemo(() => {
        const currentQuestion = questions[currentStep];
        const currentValue = formData[currentQuestion.key];

        if (currentQuestion.type === 'input') {
            return currentValue && currentValue.trim() !== '' &&
                !isNaN(currentValue) &&
                parseInt(currentValue) >= 1 &&
                parseInt(currentValue) <= 9;
        } else {
            if (!currentValue) return false;
            if (currentValue === 'Others Specify') {
                const otherInput = otherInputs[currentQuestion.key];
                return otherInput && otherInput.trim() !== '';
            }
            return true;
        }
    }, [currentStep, formData, otherInputs, questions]);

    // Memoized current question and progress
    const currentQuestion = useMemo(() => questions[currentStep], [questions, currentStep]);
    const progress = useMemo(() => ((currentStep + 1) / questions.length) * 100, [currentStep, questions.length]);

    // Early returns for different states
    if (result) {
        return <PregnancyResult result={result} onBack={resetForm} />;
    }

    if (isLoading) {
        return <PregnancyLoader />;
    }

    return (
        <View style={styles.container}>
            <Header />
            <ProgressBar progress={progress} />
            <QuestionCounter current={currentStep + 1} total={questions.length} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.questionContainer}>
                    <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>

                    {currentQuestion.type === 'input' ? (
                        <InputField
                            placeholder={currentQuestion.placeholder}
                            value={formData[currentQuestion.key]}
                            onChangeText={handleInputChange}
                            keyboardType="numeric"
                        />
                    ) : (
                        <View style={styles.optionsContainer}>
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = formData[currentQuestion.key] === option;
                                return (
                                    <OptionButton
                                        key={option} // Use option as key instead of index for better performance
                                        option={option}
                                        isSelected={isSelected}
                                        onPress={() => handleOptionSelect(option)}
                                    />
                                );
                            })}

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

            <NavigationButtons
                currentStep={currentStep}
                totalSteps={questions.length}
                isValid={isCurrentStepValid}
                onBack={handleBack}
                onNext={handleNext}
                onSubmit={handleSubmit}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(253,247,240,0.49)',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFE5E5',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D63384',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6C757D',
        marginTop: 5,
        textAlign: 'center',
    },
    progressContainer: {
        height: 4,
        backgroundColor: '#E9ECEF',
        marginHorizontal: 20,
        borderRadius: 2,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#D63384',
        borderRadius: 2,
    },
    questionCounter: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
        color: '#6C757D',
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
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E9ECEF',
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
        backgroundColor: '#FFFFFF',
        paddingVertical: 20,
        paddingHorizontal: 25,
        marginVertical: 8,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    selectedOption: {
        borderColor: '#D63384',
        backgroundColor: '#FFF0F5',
        transform: [{ scale: 1.02 }],
    },
    optionText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#2D3748',
        fontWeight: '500',
    },
    selectedOptionText: {
        color: '#D63384',
        fontWeight: '600',
    },
    otherInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#D63384',
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
        color: '#6C757D',
        fontWeight: '500',
    },
    nextButton: {
        backgroundColor: '#D63384',
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
        backgroundColor: '#D63384',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    generateButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FDF7F0',
        paddingHorizontal: 20,
    },
    loaderText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#D63384',
        textAlign: 'center',
        marginBottom: 10,
    },
    loaderSubtext: {
        fontSize: 16,
        color: '#6C757D',
        textAlign: 'center',
    },
    resultContainer: {
        flex: 1,
        backgroundColor: '#FDF7F0',
    },
    resultHeader: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFE5E5',
        alignItems: 'center',
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D63384',
        textAlign: 'center',
    },
    resultContent: {
        padding: 20,
    },
    mealPlanText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#2D3748',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
    },
    sourcesContainer: {
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    sourcesTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 10,
    },
    sourceItem: {
        fontSize: 14,
        color: '#6C757D',
        marginBottom: 5,
    },
    newPlanButton: {
        backgroundColor: '#D63384',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginHorizontal: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    newPlanButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default PregnancyMealPlanForm;