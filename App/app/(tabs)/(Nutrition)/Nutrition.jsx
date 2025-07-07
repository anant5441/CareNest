//react libs
import {Text, StyleSheet, Dimensions, Platform, TouchableOpacity, ScrollView,Modal, TextInput} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useState, useEffect} from "react";
//custom components
import CView from '../../../Components/CView'
import Background from '../../../Components/BackgoundWrapper'
import PercentageBubble from "../../../Components/PercentageBubble";
import Pentagon from "../../../Components/Pentagon";
import MenuItemComponent from "../../../Components/MenuItem";
import Loading from "../../../Components/Loading";
//Constants
import Colors from "../../../Constants/Colors";
import serverConfig from "../../../Constants/serverConfig";
import {useAuth} from "../../../hooks/AuthContext";

const App = () => {
    let width = Dimensions.get("window").width;
    let height = Dimensions.get("window").height;

    const { authToken } = useAuth();

    const [Report, setReport] = useState({
        carbs: 90,
        protein: 90,
        fat: 90
    });
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dailyMeals, setDailyMeals] = useState([]);
    const [mealsLoading, setMealsLoading] = useState(false);
    const [showAddMealModal, setShowAddMealModal] = useState(false);
    const [showMealRecapModal, setShowMealRecapModal] = useState(false);
    const [todayMeals, setTodayMeals] = useState([]);
    const [mealFormData, setMealFormData] = useState({
        time: '',
        name: '',
        meal_type: 'breakfast'
    });

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const weeklyData = await getWeeklyReports(authToken);
                setReport(weeklyData);
            } catch (error) {
                console.error('Error fetching weekly report:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, []);

    // Fetch meals when date changes
    useEffect(() => {
        if (!isToday(currentDate)) {
            fetchDailyMeals();
        }
    }, [currentDate]);

    const fetchDailyMeals = async () => {
        try {
            setMealsLoading(true);
            const meals = await getDailyMeals(currentDate,authToken);
            setDailyMeals(meals);
        } catch (error) {
            console.error('Error fetching daily meals:', error);
        } finally {
            setMealsLoading(false);
        }
    };

    const fetchTodayMeals = async () => {
        try {
            const today = new Date();
            const meals = await getDailyMeals(today, authToken);
            setTodayMeals(meals);
        } catch (error) {
            console.error('Error fetching today meals:', error);
        }
    };

    const handleAddMeal = async () => {
        if (!mealFormData.time || !mealFormData.name) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];

            await addMealToDate(authToken, formattedDate, mealFormData);

            // Reset form and close modal
            setMealFormData({
                time: '',
                name: '',
                meal_type: 'breakfast'
            });
            setShowAddMealModal(false);

            // Refresh today's meals if we're viewing today
            if (isToday(currentDate)) {
                await fetchTodayMeals();
            }

            alert('Meal added successfully!');
        } catch (error) {
            console.error('Error adding meal:', error);
            alert('Failed to add meal. Please try again.');
        }
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const formatDate = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-US', options);
    };

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + direction);
        setCurrentDate(newDate);
    };

    const formatTime = (timeString) => {
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const todayMenuItems = [
        {
            id: 1,
            title: 'Add a meal',
            subtitle: 'Tell us what you ate today',
            icon: require('../../../assets/Nutrition/Add meal.jpeg'),
            iconType: 'image',
            showArrow: false,
            backgroundColor: Colors.menuitemNutritionBackgroundPrimary,

        },
        {
            id: 2,
            title: 'AI guide',
            subtitle: 'Get AI-Powered Food Suggestions',
            icon: require('../../../assets/Nutrition/AI guide.jpeg'),
            iconType: 'image',
            backgroundColor: Colors.menuitemNutritionBackgroundSecondary,
        },
        {
            id: 3,
            title: 'Food Stats',
            subtitle: 'Instant Macro Insights',
            icon: require('../../../assets/Nutrition/AI guide.jpeg'),
            iconType: 'image',
            backgroundColor: Colors.menuItemNutritionBackgroundTertiary,
        },
        {
            id: 4,
            title: 'Meal Recap',
            subtitle: 'Your Food Diary, Simplified',
            icon: require('../../../assets/Nutrition/Recap.jpeg'),
            iconType: 'image',
            backgroundColor: Colors.menuitemNutritionBackgroundQuad,
        }
    ];

    const pastDateMenuItems = [
        {
            id: 1,
            title: 'Edit meal',
            subtitle: 'Modify your meal entries',
            icon: 'edit',
            iconType: 'material',
            backgroundColor: Colors.menuitemNutritionBackgroundEdit,
        }
    ];

    const handleMenuPress = (itemId) => {
        const isCurrentDateToday = isToday(currentDate);

        if (isCurrentDateToday) {
            switch(itemId) {
                case 1:
                    setShowAddMealModal(true);
                    break;
                case 2:
                    console.log('Navigate to AI Guide');
                    break;
                case 3:
                    console.log('Navigate to Food Stats');
                    break;
                case 4:
                    fetchTodayMeals();
                    setShowMealRecapModal(true);
                    break;
                default:
                    break;
            }
        } else {
            switch(itemId) {
                case 1:
                    console.log('Navigate to Edit Meal');
                    break;
                default:
                    break;
            }
        }
    };

    // Move modal components to top level
    const AddMealModal = () => (
        <Modal
            visible={showAddMealModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAddMealModal(false)}
        >
            <CView style={styles.modalOverlay}>
                <CView style={styles.modalContent}>
                    <CView style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Meal</Text>
                        <TouchableOpacity
                            onPress={() => setShowAddMealModal(false)}
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
                            onChangeText={(text) => setMealFormData({...mealFormData, name: text})}
                        />

                        <Text style={styles.inputLabel}>Time *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="HH:MM (e.g., 14:30)"
                            value={mealFormData.time}
                            onChangeText={(text) => setMealFormData({...mealFormData, time: text})}
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
                                    onPress={() => setMealFormData({...mealFormData, meal_type: type})}
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
                            onPress={() => setShowAddMealModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddMeal}
                        >
                            <Text style={styles.addButtonText}>Add Meal</Text>
                        </TouchableOpacity>
                    </CView>
                </CView>
            </CView>
        </Modal>
    );

    const MealRecapModal = () => (
        <Modal
            visible={showMealRecapModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowMealRecapModal(false)}
        >
            <CView style={styles.modalOverlay}>
                <CView style={styles.modalContent}>
                    <CView style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Today's Meal Recap</Text>
                        <TouchableOpacity
                            onPress={() => setShowMealRecapModal(false)}
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

    const renderMealTimeline = () => {
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

    const currentMenuItems = isToday(currentDate) ? todayMenuItems : pastDateMenuItems;
    const isCurrentDateToday = isToday(currentDate);

    return (
        <CView style={styles.wrapper} safe={true}>
            <Background>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <CView style={styles.container}>
                        <CView style={styles.dashBoard}>
                            <Pentagon width={width * 0.9} height={height * 0.35} color={Colors.dashBoardBackgroundPrimary}>
                                <CView style={styles.pentagonContent}>
                                    <Text style={styles.title}>Weekly Report</Text>
                                    <CView style={styles.percentageBubbleContainer}>
                                        <PercentageBubble
                                            size={60}
                                            color={Colors.percentageCarbs}
                                            title='Carbs'
                                            value={Report.carbs}
                                        />
                                        <PercentageBubble
                                            size={60}
                                            color={Colors.percentageProtein}
                                            title='Protein'
                                            value={Report.protein}
                                        />
                                        <PercentageBubble
                                            size={60}
                                            color={Colors.percentageFat}
                                            title='Fat'
                                            value={Report.fat}
                                        />
                                    </CView>
                                    <CView style={styles.optionsContainer}>
                                        <Text style={styles.optionsText}>
                                            {loading ? 'Loading...' : 'Options'}
                                        </Text>
                                        <Icon name="keyboard-arrow-down" size={24} color="white" />
                                    </CView>
                                </CView>
                            </Pentagon>
                        </CView>

                        {/* Date Navigation */}
                        <CView style={styles.dateNavigationContainer}>
                            <TouchableOpacity
                                style={styles.dateNavButton}
                                onPress={() => navigateDate(-1)}
                            >
                                <Icon name="chevron-left" size={24} color="#666" />
                            </TouchableOpacity>

                            <CView style={styles.dateContainer}>
                                <Icon name="calendar-today" size={20} color="#666" style={styles.calendarIcon} />
                                <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
                            </CView>

                            <TouchableOpacity
                                style={[
                                    styles.dateNavButton,
                                    isCurrentDateToday && styles.dateNavButtonDisabled
                                ]}
                                onPress={() => navigateDate(1)}
                                disabled={isCurrentDateToday}
                            >
                                <Icon
                                    name="chevron-right"
                                    size={24}
                                    color={isCurrentDateToday ? "#ccc" : "#666"}
                                />
                            </TouchableOpacity>
                        </CView>

                        {/* Menu Items */}
                        <CView style={styles.menuContainer}>
                            {currentMenuItems.map((item) => (
                                <MenuItemComponent
                                    key={item.id}
                                    title={item.title}
                                    subtitle={item.subtitle}
                                    icon={item.icon}
                                    iconType={item.iconType}
                                    showArrow={item.showArrow !== false}
                                    onPress={() => handleMenuPress(item.id)}
                                    style={item.id === 1 ? styles.addMealItem : null}
                                    backgroundColor={item.backgroundColor}
                                />
                            ))}
                        </CView>

                        {/* Meal Timeline for Past Dates */}
                        {!isToday(currentDate) && renderMealTimeline()}
                    </CView>
                </ScrollView>
            </Background>

            {/* Render modals at the top level */}
            <AddMealModal />
            <MealRecapModal />
        </CView>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'windows' ? 20 : '15%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 0,
        paddingBottom: 30,
    },
    dashBoard: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pentagonContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Platform.OS === 'windows' ? 20 : '5%',
        paddingHorizontal: Platform.OS === 'windows' ? 0 : '2%',
    },
    title: {
        fontSize: Platform.OS === 'windows' ? 22 : 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: Platform.OS === 'windows' ? 15 : 10,
    },
    percentageBubbleContainer: {
        flexDirection: 'row',
        width: Dimensions.get("window").width * 0.7,
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1,
        marginVertical: Platform.OS === 'windows' ? 10 : 0,
    },
    optionsContainer: {
        alignItems: 'center',
        marginBottom: 5,
        marginTop: Platform.OS === 'windows' ? 20 : 0,
    },
    optionsText: {
        fontSize: Platform.OS === 'windows' ? 14 : 16,
        color: 'white',
        textAlign: 'center',
    },
    // Date Navigation Styles
    dateNavigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 25,
        paddingHorizontal: 20,
    },
    dateNavButton: {
        padding: 8,
        backgroundColor: Colors.dateNavContainer,
        borderRadius: 20,
        marginHorizontal: 15,
    },
    dateNavButtonDisabled: {
        backgroundColor: 'transparent',
        opacity: 0.5,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dateNavContainer,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 140,
        justifyContent: 'center',
    },
    calendarIcon: {
        marginRight: 8,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    // Menu Items Styles
    menuContainer: {
        width: '100%',
        paddingHorizontal: 20,
    },
    addMealItem: {
        position: 'relative',
    },
    // Meal Timeline Styles
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
    loadingText: {
        fontSize: 16,
        color: '#666',
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
    mealCalories: {
        fontSize: 14,
        color: '#666',
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
    // Modal Styles
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
    // Form Styles
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
    // Meal Recap Styles
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

export default App;

// Move utility functions outside the component
async function getWeeklyReports(authToken) {
    const URL = serverConfig.BaseURL + '/api/auth/meal_avg';

    try{
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        return {
            carbs: data.carbs * 100,
            protein: data.fats * 100,
            fat: data.proteins * 100,
        }

    } catch (error) {
        console.error(error);
    }
}

async function getDailyMeals(date,authToken) {

    // Format date to YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    const URL = serverConfig.BaseURL + '/api/auth/meals/' + formattedDate;

    try {
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if data.meals exists and is an array
        if (!data.meals || !Array.isArray(data.meals)) {
            return [];
        }

        // Transform the API response to required format
        const transformedMeals = data.meals.map(meal => {
            // Generate a meal name based on type (you can customize this logic)
            const mealNames = {
                breakfast: "Morning Meal",
                lunch: "Afternoon Meal",
                dinner: "Evening Meal",
                snack: "Snack"
            };

            return {
                time: meal.time ? meal.time + ":00" : "00:00:00", // Add seconds if not present
                type: meal.meal_type || "meal",
                name: meal.meal_name || "Meal",
                carbs: meal.composition?.carbs ? Math.round(meal.composition.carbs * 100) : 0,
                protein: meal.composition?.proteins ? Math.round(meal.composition.proteins * 100) : 0,
                fat: meal.composition?.fats ? Math.round(meal.composition.fats * 100) : 0
            };
        });

        return transformedMeals;

    } catch (error) {
        return []; // Return empty array instead of throwing
    }
}

async function addMealToDate(authToken, date, meal) {
    //date format 2025-07-03
    //meal sample
    /*
    {
      "time": "19:30",
      "name": "Mango",
      "meal_type": "Dinner"
     }
    */
    const URL = serverConfig.BaseURL + '/api/auth/meals/add-custom?date=' + date;

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(meal)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error adding meal:', error);
        throw error;
    }
}