//react libs
import {StyleSheet, Dimensions, Platform, ScrollView} from 'react-native'
import {useState, useEffect} from "react";
//custom components
import CView from '../../../Components/CView'
import Background from '../../../Components/BackgoundWrapper'
import DashboardSection from '../../../Components/Nutrition/DashboardSection';
import DateNavigation from '../../../Components/Nutrition/DateNavigation';
import MenuSection from '../../../Components/Nutrition/MenuSection';
import MealTimeline from '../../../Components/Nutrition/MealTimeline';
import AddMealModal from '../../../Components/Nutrition/AddMealModal';
import MealRecapModal from '../../../Components/Nutrition/MealRecapModal';
//Constants
import {useAuth} from "../../../hooks/AuthContext";
//Helper Functions
import {getDailyMeals,getWeeklyReports,addMealToDate} from "../../../Helper/Nutrition"



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

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + direction);
        setCurrentDate(newDate);
    };

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

    const isCurrentDateToday = isToday(currentDate);

    return (
        <CView style={styles.wrapper} safe={true}>
            <Background>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <CView style={styles.container}>
                        <DashboardSection
                            width={width}
                            height={height}
                            report={Report}
                            loading={loading}
                        />

                        <DateNavigation
                            currentDate={currentDate}
                            onNavigate={navigateDate}
                            isToday={isCurrentDateToday}
                        />

                        <MenuSection
                            isToday={isCurrentDateToday}
                            onMenuPress={handleMenuPress}
                        />

                        {!isToday(currentDate) && (
                            <MealTimeline
                                dailyMeals={dailyMeals}
                                mealsLoading={mealsLoading}
                            />
                        )}
                    </CView>
                </ScrollView>
            </Background>

            <AddMealModal
                visible={showAddMealModal}
                onClose={() => setShowAddMealModal(false)}
                mealFormData={mealFormData}
                onFormDataChange={setMealFormData}
                onAddMeal={handleAddMeal}
            />

            <MealRecapModal
                visible={showMealRecapModal}
                onClose={() => setShowMealRecapModal(false)}
                todayMeals={todayMeals}
            />
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
});

export default App;