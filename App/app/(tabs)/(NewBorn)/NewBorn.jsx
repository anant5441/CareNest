import {Text, StyleSheet, View, Image} from 'react-native'
import CView from '../../../Components/CView'
import Background from '../../../Components/BackgoundWrapper'
import Colors from "../../../Constants/Colors";
import ImgButton from "../../../Components/ImgButton";

const App = () => {
    const getAge = () => {
        return 45;
    }
    const getFunFact = ()=> {
        return ("Their vision improves fast in this window. " +
            "They're starting to track moving objects and lock eyes with people" +
            " — meaning they're literally beginning to recognize you and process faces, " +
            "which kicks off early emotional bonding.")
    }

    const optionData = [
        {
            id: 1,
            title: 'Vaccine Tracker',
            image: '../../../assets/NewBorn/Vaccine.png',
        },
        {
            id: 2,
            title: 'Symptom Analyzer',
            image: '../../../assets/NewBorn/Symptom.png',
        },
        {
            id: 3,
            title: 'Milestone Tracker',
            image: '../../../assets/NewBorn/Milestone.png',
        },
        {
            id: 4,
            title: 'Nutrition Advisor',
            image: '../../../assets/NewBorn/Nutrition.png',
        },
        {
            id: 5,
            title: 'Parental Education',
            image: '../../../assets/NewBorn/Education.png',
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
                            <Text style={styles.daysText}>{getAge()} Days</Text>
                        </View>
                    </View>
                    <View style={styles.optionContainer}>
                        {optionData.map(item => (
                            <ImgButton
                                key={item.id}
                                title={item.title}
                                src={item.image}
                            />
                        ))}
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
                            <Text style={styles.factText}>{getFunFact()}</Text>
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
    optionContainer: {
        backgroundColor: 'white',
        height: '30%',
        width: '100%',
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

export default App