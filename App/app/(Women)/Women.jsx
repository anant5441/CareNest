import {Text, StyleSheet} from 'react-native'
import CView from '../../Components/CView'
import Background from '../../Components/BackgoundWrapper'
const App = () => {
    return (
        <CView style={styles.wrapper} safe={true}>
            <Background>
                <CView style={styles.container}>
                    <Text>Women</Text>
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