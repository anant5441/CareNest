//react libs
import {Text, StyleSheet, Dimensions, Platform, TouchableOpacity, ScrollView} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useState, useEffect} from "react";
//custom components
import CView from '../../Components/CView'
import Background from '../../Components/BackgoundWrapper'
import PercentageBubble from "../../Components/PercentageBubble";
import Pentagon from "../../Components/Pentagon";
import MenuItemComponent from "../../Components/MenuItem";
//Constants
import Colors from "../../Constants/Colors";

const App = () => {
    let width = Dimensions.get("window").width;
    let height = Dimensions.get("window").height;

    const [Report, setReport] = useState({
        carbs: 90,
        protein: 90,
        fat: 90
    });
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dailyMeals, setDailyMeals] = useState([]);
    const [mealsLoading, setMealsLoading] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const weeklyData = await getWeeklyReports();
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
            const meals = await getDailyMeals(currentDate);
            setDailyMeals(meals);
        } catch (error) {
            console.error('Error fetching daily meals:', error);
        } finally {
            setMealsLoading(false);
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
            icon: require('../../assets/Nutrition/Add meal.jpeg'),
            iconType: 'image',
            showArrow: false,
            backgroundColor: Colors.menuItemBackgroundPrimary,

        },
        {
            id: 2,
            title: 'AI guide',
            subtitle: 'Get AI-Powered Food Suggestions',
            icon: require('../../assets/Nutrition/AI guide.jpeg'),
            iconType: 'image',
            backgroundColor: Colors.menuItemBackgroundSecondary,
        },
        {
            id: 3,
            title: 'Food Stats',
            subtitle: 'Instant Macro Insights',
            icon: require('../../assets/Nutrition/AI guide.jpeg'),
            iconType: 'image',
            backgroundColor: Colors.menuItemBackgroundTertiary,
        },
        {
            id: 4,
            title: 'Meal Recap',
            subtitle: 'Your Food Diary, Simplified',
            icon: require('../../assets/Nutrition/Recap.jpeg'),
            iconType: 'image',
            backgroundColor: Colors.menuItemBackgroundQuad,
        }
    ];

    const pastDateMenuItems = [
        {
            id: 1,
            title: 'Edit meal',
            subtitle: 'Modify your meal entries',
            icon: 'edit',
            iconType: 'material',
            backgroundColor: Colors.menuItemBackgroundPrimary,
        }
    ];

    const handleMenuPress = (itemId) => {
        const isCurrentDateToday = isToday(currentDate);

        if (isCurrentDateToday) {
            switch(itemId) {
                case 1:
                    console.log('Navigate to Add Meal');
                    break;
                case 2:
                    console.log('Navigate to AI Guide');
                    break;
                case 3:
                    console.log('Navigate to Food Stats');
                    break;
                case 4:
                    console.log('Navigate to Meal Recap');
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

    const renderMealTimeline = () => {
        if (mealsLoading) {
            return (
                <CView style={styles.mealTimelineContainer}>
                    <Text style={styles.timelineTitle}>Daily Meals</Text>
                    <CView style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading meals...</Text>
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
                                    <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                                    <CView style={styles.macrosContainer}>
                                        <Text style={styles.macroText}>C: {meal.carbs}g</Text>
                                        <Text style={styles.macroText}>P: {meal.protein}g</Text>
                                        <Text style={styles.macroText}>F: {meal.fat}g</Text>
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
                            <Pentagon width={width * 0.8} height={height * 0.4} color={Colors.dashBoardBackgroundPrimary}>
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
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        marginHorizontal: 15,
    },
    dateNavButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        opacity: 0.5,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
})

export default App;

async function getWeeklyReports() {
    //dummy execution this will get data from backend
    //simulate delay
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Weekly data fetched");
            resolve({
                carbs: 45,
                protein: 28,
                fat: 27
            });
        }, 2000);
    });
}

async function getDailyMeals(date) {
    //dummy execution this will get data from backend
    //simulate delay
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Daily meals data fetched for:", date.toDateString());

            // Generate dummy meals for the selected date
            const dummyMeals = [
                {
                    time: "07:30:00",
                    type: "breakfast",
                    name: "Oatmeal with Berries",
                    calories: 350,
                    carbs: 45,
                    protein: 12,
                    fat: 8
                },
                {
                    time: "12:15:00",
                    type: "lunch",
                    name: "Grilled Chicken Salad",
                    calories: 420,
                    carbs: 15,
                    protein: 35,
                    fat: 18
                },
                {
                    time: "15:30:00",
                    type: "snack",
                    name: "Greek Yogurt",
                    calories: 150,
                    carbs: 12,
                    protein: 15,
                    fat: 5
                },
                {
                    time: "19:00:00",
                    type: "dinner",
                    name: "Salmon with Quinoa",
                    calories: 580,
                    carbs: 42,
                    protein: 38,
                    fat: 22
                }
            ];

            resolve(dummyMeals);
        }, 1500);
    });
}