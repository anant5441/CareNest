import {Text, StyleSheet, Dimensions} from 'react-native'
import CView from '../../Components/CView'
import Background from '../../Components/BackgoundWrapper'
import PercentageBubble from "../../Components/PercentageBubble";
import Pentagon from "../../Components/Pentagon";
const App = () => {
    let width = Dimensions.get("window").width;
    return (
        <CView style={styles.wrapper} safe={true}>
            <Background>
                <CView style={styles.container}>
                    <Text>Nutrition</Text>
                    <Pentagon
                        width={width}
                    ></Pentagon>
                    <PercentageBubble value={10} title="test" size={60}/>
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
        justifyContent: 'center',
        alignItems: 'center',
    }
})
export default App