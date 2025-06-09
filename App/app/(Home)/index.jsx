//React modules
import {Text, StyleSheet, TouchableOpacity} from 'react-native'
import {Ionicons} from "@expo/vector-icons";
//Custom Components
import CView from '../../Components/CView'
import Background from '../../Components/BackgoundWrapper'
//Constants
import Colors from "../../Constants/Colors";

const App = () => {
    return (
        <CView style={styles.wrapper} safe={true}>
            <Background>
                <CView style={styles.container}>

                    <CView style={styles.GreetingBarContainer} >
                        <CView style={styles.GreetingBar}>
                            <Ionicons name={getGreetingIconName()} size={24} color={Colors.greetIconColor} />
                            <Text>{getGreeting()}</Text>
                        </CView>
                    </CView>

                    <CView style={styles.UpperTextContainer} >
                        <Text style={styles.UpperTextTitle}>Hello John</Text>
                        <Text style={styles.UpperTextSubheading}>Make Your day with us</Text>
                    </CView>

                    <CView style={styles.MainOptionContainer} >
                        <TouchableOpacity
                            style={styles.TalkOptionContainer}
                            onPress={() => {console.log("Talk with AI ")}}
                            activeOpacity={0.7}
                        >
                            <Text>Talk with AI</Text>
                        </TouchableOpacity>
                        <CView style={styles.MultipleOptionContainer}></CView>
                    </CView>

                    <CView style={styles.ExploreOptionContainer} >
                        <Text>Explore</Text>
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
        gap: '5%',
        justifyContent: 'space-between',
        paddingBottom: '20%'
    },


    GreetingBarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 0,
    },
    GreetingBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: 13,
        gap: '2%',
        backgroundColor: Colors.greetingBarBackground,
        height: "25%",
        width: 'auto',
        paddingHorizontal: 20,
        borderRadius: 25,
    },


    UpperTextContainer: {
        paddingLeft: '5%'
    },
    UpperTextTitle: {
        fontSize: 27,
    },
    UpperTextSubheading: {
        fontSize: 13,
    },


    MainOptionContainer: {
        flexDirection: 'row',
        gap: '5%',
        height: '30vh'
    },
    TalkOptionContainer: {
        height: '100%',
        backgroundColor: Colors.talkOption,
    },
    MultipleOptionContainer: {
        height: 50,
        backgroundColor: Colors.talkOption,
    },


    ExploreOptionContainer: {
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
    if (hour < 12) return 'alarm-outline';  //morning
    if (hour < 18) return 'sunny-outline';  // day
    return 'moon-outline';   // night

}