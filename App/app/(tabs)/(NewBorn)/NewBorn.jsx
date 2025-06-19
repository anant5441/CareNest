import {Text, StyleSheet, View, Image, ScrollView, Alert} from 'react-native'
import {useEffect, useState} from 'react'
import CView from '../../../Components/CView'
import Background from '../../../Components/BackgoundWrapper'
import ImgButton from "../../../Components/ImgButton";
import Colors from "../../../Constants/Colors";

const App = () => {
    const getAge = async () => {
        let age = 101;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(age);
            }, 2000);
        });
    }

    const [Age, setAge] = useState(0);
    useEffect(() => {
        getAge().then((age) => {
            setAge(age);
        });
    }, []);

    const getFunFact = (Age) => {
        if (Age === 0) {
            return "Fresh into the world! Your baby is just beginning to breathe and adjust to their new environment.";
        } else if (Age <= 14) {
            return "In the first two weeks, babies sleep a lot and rely entirely on reflexes. Feeding and sleeping rule their world.";
        } else if (Age <= 30) {
            return "Around this time, babies begin to respond to sounds and start showing signs of a social smile.";
        } else if (Age <= 50) {
            return "Their vision improves fast in this window. They're starting to track moving objects and lock eyes with people — meaning they're literally beginning to recognize you and process faces, which kicks off early emotional bonding.";
        } else if (Age <= 70) {
            return "Babies start cooing more and exploring vocal sounds. They may begin to mimic facial expressions too!";
        } else if (Age <= 100) {
            return "Neck strength is building! Many babies can lift their heads during tummy time and may even start rolling slightly.";
        } else {
            return "Every day brings a new skill — from better motor control to stronger social awareness. You're watching a little personality form.";
        }
    };


    // Handle option clicks
    const handleOptionClick = (option) => {
        switch(option.id) {
            case 1:
                handleVaccineTracker();
                break;
            case 2:
                handleSymptomAnalyzer();
                break;
            case 3:
                handleMilestoneTracker();
                break;
            case 4:
                handleNutritionAdvisor();
                break;
            case 5:
                handleParentalEducation();
                break;
            default:
                Alert.alert('Coming Soon', `${option.title} feature will be available soon!`);
        }
    }

    const handleVaccineTracker = () => {
        Alert.alert('Vaccine Tracker', 'Under Development!');
    }

    const handleSymptomAnalyzer = () => {
        Alert.alert('Symptom Analyzer', 'Under Development!');
    }

    const handleMilestoneTracker = () => {
        Alert.alert('Milestone Tracker', 'Under Development!');
    }

    const handleNutritionAdvisor = () => {
        Alert.alert('Nutrition Advisor', 'Under Development!');
    }

    const handleParentalEducation = () => {
        Alert.alert('Parental Education', 'Under Development!');
    }

    const optionData = [
        {
            id: 1,
            title: 'Vaccine Tracker',
            image: require('../../../assets/NewBorn/Vaccine.png'),
        },
        {
            id: 2,
            title: 'Symptom Analyzer',
            image: require('../../../assets/NewBorn/Symptom.png'),
        },
        {
            id: 3,
            title: 'Milestone Tracker',
            image: require('../../../assets/NewBorn/Milestone.png'),
        },
        {
            id: 4,
            title: 'Nutrition Advisor',
            image: require('../../../assets/NewBorn/Nutrition.png'),
        },
        {
            id: 5,
            title: 'Parental Education',
            image: require('../../../assets/NewBorn/Education.png'),
        }
    ];

    return (
        <CView style={styles.wrapper} safe={true}>
            <Background>
                <CView style={styles.container}>
                    <View style={styles.upperContainer}>
                        <Image
                            source={require('../../../assets/NewBorn/UpperImg.png')}
                            style={styles.image}
                            resizeMode={"contain"}
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.ageText}>Age</Text>
                            <Text style={styles.daysText}>{Age} Days</Text>
                        </View>
                    </View>

                    {/* Options Title Section */}
                    <View style={styles.optionTitleContainer}>
                        <Text style={styles.optionTitleText}>Options</Text>
                        <View style={styles.scrollIndicator}>
                            <Text style={styles.scrollHintText}>Swipe to explore →</Text>
                        </View>
                    </View>

                    <View style={styles.optionContainer}>
                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            style={styles.scrollContainer}
                            contentContainerStyle={{
                                paddingHorizontal: 10,
                                alignItems: 'center',
                            }}
                        >
                            {optionData.map(item => (
                                <ImgButton
                                    key={item.id}
                                    title={item.title}
                                    src={item.image}
                                    style={{ marginHorizontal: 8 }}
                                    onPress={() => handleOptionClick(item)}
                                />
                            ))}
                        </ScrollView>
                    </View>
                    <View style={styles.funFactContainer}>
                        <View style={styles.factBabyImageContainer}>
                            <Image
                                source={require('../../../assets/NewBorn/BossBaby.png')}
                                style={styles.babyImage}
                                resizeMode={"contain"}
                            />
                        </View>
                        <View style={styles.factTextContainer}>
                            <View style={styles.titleRow}>
                                <Text style={styles.titleText}>Mind unlocked</Text>
                                <Image
                                    source={require('../../../assets/NewBorn/FireImg.png')}
                                    style={styles.fireImage}
                                    resizeMode={"contain"}
                                />
                            </View>
                            <Text style={styles.factText}>{getFunFact(Age)}</Text>
                        </View>
                    </View>
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
        justifyContent: 'space-between',
        paddingVertical: '20%',
        alignItems: 'center',
    },
    upperContainer: {
        height: '20%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '5%',
        borderRadius: 15,
        width:'100%'
    },
    image: {
        width: 120,
        height: 120,
    },
    factBabyImageContainer: {
        justifyContent: 'center',
    },
    babyImage: {
        width: 80,
        height: 120,
    },
    fireImage: {
        width: 24,
        height: 24,
        marginLeft: 8,
    },
    textContainer: {
        alignItems: 'flex-end',
    },
    ageText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    daysText: {
        fontSize: 18,
        color: 'white',
        fontWeight: '600',
    },
    // New styles for options title and scroll indicator
    optionTitleContainer: {
        width: '94%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
        marginBottom: 8,
    },
    optionTitleText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    scrollIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scrollHintText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        fontStyle: 'italic',
    },
    optionContainer: {
        backgroundColor: Colors.optionBgColor,
        height: '30%',
        width: '94%',
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    scrollContainer: {
        flexGrow: 0,
    },
    funFactContainer: {
        backgroundColor: Colors.funFactBgColor,
        minHeight: '24%',
        width: '94%',
        flexDirection: 'row',
        borderRadius: 12,
        paddingRight: '2%'
    },
    factTextContainer: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15,
        paddingBottom: 15,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    factText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        textAlign: 'left',
    },
})

export default App;