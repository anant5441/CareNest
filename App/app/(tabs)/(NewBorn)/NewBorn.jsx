import {Text, StyleSheet, View, Image, ScrollView, Alert, Dimensions} from 'react-native'
import {useEffect, useState} from 'react'
import CView from '../../../Components/CView'
import Background from '../../../Components/BackgoundWrapper'
import ImgButton from "../../../Components/ImgButton";
import Colors from "../../../Constants/Colors";
import {router} from "expo-router";

const { width, height } = Dimensions.get('window');

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
            return "Fresh into the world! Your baby is just beginning to breathe on their own, adjust to the lights and sounds around them, and experience their first moments outside the womb.";
        } else if (Age <= 14) {
            return "In the first two weeks of life, babies tend to sleep most of the time and rely completely on primitive reflexes. Their tiny bodies are adjusting, and feeding, sleeping, and crying are pretty much their full-time job right now.";
        } else if (Age <= 30) {
            return "By this age, babies often start to recognize familiar voices and may respond to sounds more noticeably. You might even catch the earliest version of a social smile, which is their first big step into human connection.";
        } else if (Age <= 50) {
            return "Their vision is sharpening quickly around now. Babies start tracking moving objects, focusing better on faces, and even holding your gaze — a key moment that signals the beginning of facial recognition and emotional bonding.";
        } else if (Age <= 70) {
            return "Cooing becomes more frequent, and your baby might start experimenting with different vocal sounds. At the same time, they may begin copying your facial expressions, like sticking out their tongue or mimicking your smile.";
        } else if (Age <= 100) {
            return "Neck and upper body strength are picking up! Many babies at this stage can lift their heads during tummy time, and some might even begin rolling from side to side as their muscles grow stronger.";
        } else {
            return "Every single day brings new milestones — from improved motor skills and control to a deepening sense of social awareness. You’re witnessing the formation of a unique personality, moment by moment.";
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
        router.push('../../stack/VaccTracker');
    }

    const handleSymptomAnalyzer = () => {
        Alert.alert('Symptom Analyzer', 'Under Development!');
    }

    const handleMilestoneTracker = () => {
        Alert.alert('Milestone Tracker', 'Under Development!');
    }

    const handleNutritionAdvisor = () => {
        router.push('../../stack/GenMeal')
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
                            contentContainerStyle={styles.scrollContentContainer}
                        >
                            {optionData.map(item => (
                                <ImgButton
                                    key={item.id}
                                    title={item.title}
                                    src={item.image}
                                    style={styles.buttonSpacing}
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
        paddingHorizontal: width * 0.03,
        paddingVertical: height * 0.05,
        gap: height * 0.02,
    },
    upperContainer: {
        minHeight: 120,
        maxHeight: height * 0.18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.05,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    image: {
        width: Math.min(120, width * 0.25),
        height: Math.min(120, width * 0.25),
    },
    factBabyImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        minWidth: 80,
    },
    babyImage: {
        width: Math.min(80, width * 0.15),
        height: Math.min(120, height * 0.15),
    },
    fireImage: {
        width: 24,
        height: 24,
        marginLeft: 8,
    },
    textContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    ageText: {
        fontSize: Math.min(24, width * 0.06),
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    daysText: {
        fontSize: Math.min(18, width * 0.045),
        color: 'white',
        fontWeight: '600',
    },
    optionTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width * 0.02,
        marginBottom: 8,
    },
    optionTitleText: {
        fontSize: Math.min(20, width * 0.05),
        fontWeight: 'bold',
        color: 'white',
    },
    scrollIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scrollHintText: {
        fontSize: Math.min(12, width * 0.03),
        color: 'rgba(255, 255, 255, 0.7)',
        fontStyle: 'italic',
    },
    optionContainer: {
        backgroundColor: Colors.optionBgColor,
        minHeight: 180,
        maxHeight: height * 0.25,
        borderRadius: 12,
        paddingVertical: 20,
        flex: 0,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingHorizontal: 10,
        alignItems: 'center',
        minHeight: 120,
    },
    buttonSpacing: {
        marginHorizontal: 8,
    },
    funFactContainer: {
        backgroundColor: Colors.funFactBgColor,
        minHeight: 140,
        maxHeight: height * 0.3,
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
        flex: 1,
    },
    factTextContainer: {
        flex: 1,
        padding: 15,
        justifyContent: 'flex-start',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    titleText: {
        fontSize: Math.min(18, width * 0.045),
        fontWeight: 'bold',
        color: '#333',
    },
    factText: {
        fontSize: Math.min(14, width * 0.035),
        color: '#666',
        lineHeight: Math.min(20, width * 0.05),
        textAlign: 'left',
        flex: 1,
    },
})

export default App;