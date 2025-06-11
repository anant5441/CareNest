//react libs
import {Text, StyleSheet, Dimensions, Platform} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useState, useEffect} from "react";
//custom components
import CView from '../../Components/CView'
import Background from '../../Components/BackgoundWrapper'
import PercentageBubble from "../../Components/PercentageBubble";
import Pentagon from "../../Components/Pentagon";
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

    return (
        <CView style={styles.wrapper} safe={true}>
            <Background>
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
                </CView>
            </Background>
        </CView>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'windows' ? 20 : '15%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 0
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
    }
})

export default App;

async function getWeeklyReports() {
    //dummy execution this will get data from backend
    //simulate delay
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Data fetched");
            resolve({
                carbs: 45,
                protein: 28,
                fat: 27
            });
        }, 2000);
    });
}