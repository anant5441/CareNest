import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
    FlatList,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';


import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuth} from "../../hooks/AuthContext";
import serverConfig from "../../Constants/serverConfig";
import GeneralLoad from "../../Components/GeneralLoad";
import {LinearGradient} from "react-native-svg";
import BackgoundWrapper from "../../Components/BackgoundWrapper";
import CView from "../../Components/CView";
import Colors from "../../Constants/Colors";

const {width} = Dimensions.get('window');

const AiMealAdvisior = () => {
    const {authToken, logout} = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('analysis');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        const getadvice = async () => {
            const URL = serverConfig.BaseURL + '/api/auth/ai_meal_guide';
            try {
                const response = await fetch(URL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                // Sort foods by length in descending order
                if (result.recommendations && result.recommendations.foods) {
                    result.recommendations.foods = result.recommendations.foods.sort((a, b) => b.length - a.length);
                }

                setData(result);

                // Animate in the content
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ]).start();

            } catch (error) {
                console.error('Error fetching advice:', error);
                // Use sample data for demo
                const sampleData = {
                    "status": "success",
                    "analysis": "The user's average macronutrient intake is 60% carbohydrates, 20% protein, and 20% fats. This distribution is generally within the recommended healthy ranges for a balanced diet. Carbohydrate intake falls within the typical 45-65% range, and protein intake is within the 10-35% range. Fat intake, at 20%, is at the lower boundary of the recommended 20-35% range. While not a severe deficiency, it presents an opportunity to focus on ensuring the *quality* of fats consumed and potentially increase intake of healthy unsaturated fats for optimal nutrient absorption, hormone regulation, and satiety. The overall balance is good, but optimizing the source of these macronutrients can further enhance health benefits.",
                    "recommendations": {
                        "foods": [
                            "Avocados",
                            "Nuts (e.g., almonds, walnuts, pecans)",
                            "Seeds (e.g., chia seeds, flax seeds, sunflower seeds)",
                            "Olive oil",
                            "Fatty fish (e.g., salmon, mackerel, sardines)",
                            "Whole grains (e.g., oats, quinoa, brown rice, whole-wheat bread/pasta)",
                            "Legumes (e.g., lentils, black beans, chickpeas)",
                            "Sweet potatoes",
                            "Lean protein sources (e.g., chicken breast, turkey, tofu, tempeh, Greek yogurt, eggs)",
                            "Berries",
                            "Leafy greens (e.g., spinach, kale)",
                            "Broccoli",
                            "Bell peppers"
                        ].sort((a, b) => b.length - a.length),
                        "meals": [
                            "Breakfast: Oatmeal made with water or unsweetened plant milk, topped with fresh berries, a handful of walnuts or a tablespoon of chia seeds, and a dollop of Greek yogurt for added protein.",
                            "Breakfast: Scrambled eggs (2-3) with a side of sliced avocado and a slice of whole-wheat toast.",
                            "Lunch: Large salad featuring mixed greens, grilled chicken or roasted chickpeas, an assortment of colorful vegetables (e.g., bell peppers, cucumber, cherry tomatoes), a sprinkle of sunflower seeds, and a dressing made with olive oil and vinegar.",
                            "Lunch: Hearty lentil soup served with a small whole-grain roll and a side of avocado slices.",
                            "Dinner: Baked salmon (a good source of healthy fats) served with a generous portion of quinoa and roasted vegetables (e.g., broccoli florets, sweet potato wedges) tossed in olive oil.",
                            "Dinner: Vegetarian chili or a chickpea and vegetable curry (using light coconut milk for healthy fats) served with brown rice."
                        ],
                        "rationale": "These suggestions aim to enhance the nutritional quality and density of the user's diet while maintaining their current, generally balanced, macronutrient ratios. By emphasizing healthy fats from sources like avocados, nuts, seeds, olive oil, and fatty fish, the diet will supply essential monounsaturated and polyunsaturated fatty acids (including Omega-3s) crucial for hormone production, nutrient absorption (especially fat-soluble vitamins A, D, E, K), brain health, and inflammation reduction."
                    }
                };
                setData(sampleData);
            } finally {
                setLoading(false);
            }
        };

        getadvice();
    }, [authToken]);

    const MacronutrientCard = ({label, percentage, color}) => (
        <View style={[styles.macroCard, {borderLeftColor: color}]}>
            <Text style={styles.macroLabel}>{label}</Text>
            <Text style={[styles.macroPercentage, {color}]}>{percentage}%</Text>
        </View>
    );

    const FoodItem = ({item, index}) => (
        <Animated.View
            style={[
                styles.foodItem,
                {
                    opacity: fadeAnim,
                    transform: [{translateY: slideAnim}],
                },
            ]}>
            <View style={styles.foodItemGradient}>
                <Icon name="food-apple" size={20} color={Colors.AIGuide.foodItemIcon} />
                <Text style={styles.foodItemText}>{item}</Text>
            </View>
        </Animated.View>
    );


    const MealCard = ({meal, index}) => {
        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        const mealIcons = ['weather-sunny', 'white-balance-sunny', 'weather-night'];
        const mealColors = [
            ['#FF9800', '#FF6F00'],
            ['#2196F3', '#1976D2'],
            ['#9C27B0', '#7B1FA2']
        ];

        const mealType = meal.split(':')[0].toLowerCase();
        const mealDescription = meal.split(':')[1];
        const colorIndex = mealTypes.indexOf(mealType);

        return (
            <View style={styles.mealCard}>
                <LinearGradient
                    colors={mealColors[colorIndex] || ['#4CAF50', '#45a049']}
                    style={styles.mealHeader}>
                    <Icon name={mealIcons[colorIndex] || 'food'} size={24} color="#fff" />
                    <Text style={styles.mealType}>{mealType}</Text>
                </LinearGradient>
                <Text style={styles.mealDescription}>{mealDescription}</Text>
            </View>
        );
    };

    const TabButton = ({title, isActive, onPress, icon}) => (
        <TouchableOpacity
            style={[styles.tabButton, isActive && styles.activeTab]}
            onPress={onPress}>
            <Icon name={icon} size={20} color={isActive ? '#fff' : '#666'} />
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return <GeneralLoad />;
    }

    if (!data || data.status !== 'success') {
        return (
            <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={48} color="#f44336" />
                <Text style={styles.errorText}>Failed to load meal advice</Text>
            </View>
        );
    }

    return (
        <BackgoundWrapper>
            <CView safe={true} style={styles.container}>
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.header}>
                    <Icon name="brain" size={32} color="#fff" />
                    <Text style={styles.headerTitle}>AI Meal Advisor</Text>
                    <Text style={styles.headerSubtitle}>Your Personalized Nutrition Guide</Text>
                </LinearGradient>

                <View style={styles.tabContainer}>
                    <TabButton
                        title="Analysis"
                        icon="chart-pie"
                        isActive={activeTab === 'analysis'}
                        onPress={() => setActiveTab('analysis')}
                    />
                    <TabButton
                        title="Foods"
                        icon="food-apple"
                        isActive={activeTab === 'foods'}
                        onPress={() => setActiveTab('foods')}
                    />
                    <TabButton
                        title="Meals"
                        icon="silverware-fork-knife"
                        isActive={activeTab === 'meals'}
                        onPress={() => setActiveTab('meals')}
                    />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {activeTab === 'analysis' && (
                        <Animated.View
                            style={[
                                styles.section,
                                {
                                    opacity: fadeAnim,
                                    transform: [{translateY: slideAnim}],
                                },
                            ]}>
                            <View style={styles.macroContainer}>
                                <Text style={styles.sectionTitle}>Macronutrient Breakdown</Text>
                                <MacronutrientCard label="Carbohydrates" percentage="60" color="#4CAF50" />
                                <MacronutrientCard label="Protein" percentage="20" color="#2196F3" />
                                <MacronutrientCard label="Fats" percentage="20" color="#FF9800" />
                            </View>

                            <View style={styles.analysisCard}>
                                <Text style={styles.analysisTitle}>Nutritional Analysis</Text>
                                <Text style={styles.analysisText}>{data.analysis}</Text>
                            </View>

                            <View style={styles.rationaleCard}>
                                <Text style={styles.rationaleTitle}>Rationale</Text>
                                <Text style={styles.rationaleText}>{data.recommendations.rationale}</Text>
                            </View>
                        </Animated.View>
                    )}

                    {activeTab === 'foods' && (
                        <Animated.View
                            style={[
                                styles.section,
                                {
                                    opacity: fadeAnim,
                                    transform: [{translateY: slideAnim}],
                                },
                            ]}>
                            <Text style={styles.sectionTitle}>Recommended Foods</Text>
                            <FlatList
                                data={data.recommendations.foods}
                                renderItem={FoodItem}
                                keyExtractor={(item, index) => index.toString()}
                                numColumns={2}
                                scrollEnabled={false}
                                contentContainerStyle={styles.foodGrid}
                            />
                        </Animated.View>
                    )}

                    {activeTab === 'meals' && (
                        <Animated.View
                            style={[
                                styles.section,
                                {
                                    opacity: fadeAnim,
                                    transform: [{translateY: slideAnim}],
                                },
                            ]}>
                            <Text style={styles.sectionTitle}>Meal Suggestions</Text>
                            {data.recommendations.meals.map((meal, index) => (
                                <MealCard key={index} meal={meal} index={index} />
                            ))}
                        </Animated.View>
                    )}
                </ScrollView>
            </CView>
        </BackgoundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingTop:'7%'
    },
    header: {
        padding: 20,
        paddingTop: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.44)',
        marginTop: 10,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
        marginTop: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.AIGuide.navInactiveTintColor,
        margin: 15,
        borderRadius: 15,
        padding: 5,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: Colors.AIGuide.navActiveTintColor,
    },
    tabText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 15,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    macroContainer: {
        backgroundColor: Colors.AIGuide.textContainers,
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
    },
    macroCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginVertical: 5,
        backgroundColor: Colors.AIGuide.textBG,
        borderRadius: 10,
        borderLeftWidth: 4,
    },
    macroLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    macroPercentage: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    analysisCard: {
        backgroundColor: Colors.AIGuide.textContainers,
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
    },
    analysisTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    analysisText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    rationaleCard: {
        backgroundColor: Colors.AIGuide.textContainers,
        borderRadius: 15,
        padding: 20,
    },
    rationaleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    rationaleText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    foodGrid: {
        paddingBottom: 20,
    },
    foodItem: {
        flex: 1,
        margin: 5,
        borderRadius: 10,
        overflow: 'hidden',
    },

    foodItemGradient: {
        backgroundColor: Colors.AIGuide.foodItem,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
    },

    foodItemText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
        flex: 1,
    },
    mealCard: {
        backgroundColor: Colors.AIGuide.textContainers,
        borderRadius: 15,
        marginBottom: 15,
        overflow: 'hidden',
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    mealType: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        textTransform: 'capitalize',
    },
    mealDescription: {
        padding: 15,
        fontSize: 14,
        color: '#000',
        lineHeight: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
});

export default AiMealAdvisior;