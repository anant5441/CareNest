import {StyleSheet, View} from 'react-native'
import CView from "../../Components/CView";
import BubbleCheckbox from "../../Components/BubbleCheckbox";
import BrezzierCurve from "../../Components/BrezzierCurve";

const VaccTracker = () => {
    return (
        <CView safe={true} style={styles.container}>
            <View style={styles.primaryRow}>
                <BubbleCheckbox
                    title="Test 1"
                    titlePosition="left"
                />
            </View>
            <View style={styles.curvePrimary}>
                <BrezzierCurve
                    width='85%'
                    height={100}
                />
            </View>
            <View style={styles.secRow}>
                <BubbleCheckbox
                    title="Test 2"
                    titlePosition="right"
                />
            </View>
            <View style={styles.curvePrimary}>
                <BrezzierCurve
                    width='85%'
                    height={100}
                    isPrimary={false}
                />
            </View>
            <View style={styles.primaryRow}>
                <BubbleCheckbox
                    title="Test 3"
                    titlePosition="left"
                />
            </View>
            <View style={styles.curvePrimary}>
                <BrezzierCurve
                    width='85%'
                    height={100}
                />
            </View>
            <View style={styles.secRow}>
                <BubbleCheckbox
                    title="Test 4"
                    titlePosition="right"
                />
            </View>
        </CView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '10%',
    },
    primaryRow:{
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    secRow:{
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    curvePrimary: {
        width: '100%',
        alignItems: 'center',
        paddingLeft:'10%'
    },
    curveSecondary: {
        width: '100%',
        alignItems: 'center',
        paddingRight:'10%'
    }
})

export default VaccTracker
