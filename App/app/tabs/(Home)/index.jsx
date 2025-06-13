//React modules
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native'
import {Ionicons} from "@expo/vector-icons";
//Custom Components
import CView from '../../../Components/CView'
import Background from '../../../Components/BackgoundWrapper'
//Constants
import Colors from "../../../Constants/Colors";
import {router} from "expo-router";

const App = () => {
    return (
        <CView style={styles.wrapper} safe={true}>
            <Background>
                <CView style={styles.container}>

                    <CView style={styles.GreetingBarContainer} >
                        <CView style={styles.GreetingBar}>
                            <Ionicons name={getGreetingIconName()} size={20} color={Colors.greetIconColor} />
                            <Text style={styles.greetingText}>{getGreeting()}</Text>
                        </CView>
                    </CView>

                    <CView style={styles.UpperTextContainer} >
                        <Text style={styles.UpperTextTitle}>Hello {getUserName()}</Text>
                        <Text style={styles.UpperTextSubheading}>Make your day with us</Text>
                    </CView>

                    <CView style={styles.MainOptionContainer} >
                        <TouchableOpacity
                            style={styles.TalkOptionContainer}
                            onPress={handleTalkWithAI}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="mic-outline" size={40} color="#666" />
                            <Text style={styles.talkWithAITitle}>Talk with AI</Text>
                            <Text style={styles.talkWithAISubtitle}>Let's try it now</Text>
                        </TouchableOpacity>

                        <CView style={styles.MultipleOptionContainer}>
                            <TouchableOpacity
                                style={styles.newChatOption}
                                onPress={handleNewChat}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="chatbubble-outline" size={24} color="#666" />
                                <Text style={styles.optionText}>New Chat</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.trackPoshanOption}
                                onPress={handleTrackPotion}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="analytics-outline" size={24} color="#fff" />
                                <Text style={styles.trackPoshanText}>Track Poshan</Text>
                            </TouchableOpacity>
                        </CView>
                    </CView>

                    <CView style={styles.ExploreOptionContainer} >
                        <Text style={styles.exploreTitle}>Explore more</Text>

                        <TouchableOpacity
                            style={[{ backgroundColor: Colors.exploreOptionPrimary }, styles.exploreItem]}
                            activeOpacity={0.7}
                            onPress={handleMalnourishedCare}
                        >
                            <CView style={styles.exploreItemContent}>
                                <Ionicons name="heart-outline" size={20} color="#666" />
                                <Text style={styles.exploreItemText}>Malnourished Care</Text>
                            </CView>
                            <Ionicons name="chevron-forward-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[{ backgroundColor: Colors.exploreOptionSecondary }, styles.exploreItem]}
                            activeOpacity={0.7}
                            onPress={handlePregNutrition}
                        >
                        <CView style={styles.exploreItemContent}>
                                <Ionicons name="nutrition-outline" size={20} color="#666" />
                                <Text style={styles.exploreItemText}>Pregnancy Nutrition</Text>
                            </CView>
                            <Ionicons name="chevron-forward-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[{ backgroundColor: Colors.exploreOptionPrimary }, styles.exploreItem]}
                            activeOpacity={0.7}
                            onPress={handleWorker}
                        >
                            <CView style={styles.exploreItemContent}>
                                <Ionicons name="medical-outline" size={20} color="#666" />
                                <Text style={styles.exploreItemText}>Health Worker</Text>
                            </CView>
                            <Ionicons name="chevron-forward-outline" size={20} color="#666" />
                        </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 20,
    },

    // Greeting Bar Styles
    GreetingBarContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    GreetingBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.greetingBarBackground,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    greetingText: {
        fontSize: 14,
        color: '#333',
    },

    // Upper Text Styles
    UpperTextContainer: {
        marginVertical: 10,
    },
    UpperTextTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    UpperTextSubheading: {
        fontSize: 16,
        color: '#666',
    },


    MainOptionContainer: {
        flexDirection: 'row',
        gap: '2%',
        height: 200,
        justifyContent: 'space-between',
        paddingHorizontal: '5%'
    },
    TalkOptionContainer: {
        flex: 0.45,
        backgroundColor: Colors.talkOption,
        borderRadius: 15,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    talkWithAITitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        marginBottom: 5,
    },
    talkWithAISubtitle: {
        fontSize: 14,
        color: '#666',
    },

    MultipleOptionContainer: {
        flex: 0.45,
        gap: 10,
    },
    newChatOption: {
        flex: 1,
        backgroundColor: Colors.newChatOption,
        borderRadius: 15,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackPoshanOption: {
        flex: 1,
        backgroundColor: Colors.trackPotion,
        borderRadius: 15,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 8,
        textAlign: 'center',
    },
    trackPoshanText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginTop: 8,
        textAlign: 'center',
    },

    // Explore Section
    ExploreOptionContainer: {
        flex: 1,
        gap: 15,
    },
    exploreTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    exploreItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 25,
        marginBottom: 10,
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    },
    exploreItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    exploreItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
})

export default App;

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
}

function getGreetingIconName() {
    const hour = new Date().getHours();
    if (hour < 12) return 'sunny-outline';  //morning
    if (hour < 18) return 'sunny-outline';  // day
    return 'moon-outline';   // night
}
function getUserName() {
    return "John";
}
function handleTalkWithAI() {
    console.log("handleTalkWithAI");
}
function handleNewChat() {
    console.log("handleNewChat");
    router.push('../stack/HomeChat');
}
function handleTrackPotion() {
    console.log("handleTrackPotion");
}
function handleMalnourishedCare(){
    console.log("handleMalnourishedCare");
}
function handlePregNutrition() {
    console.log("pregNutrition");
}
function handleWorker() {
    console.log("handleWorker");
}
