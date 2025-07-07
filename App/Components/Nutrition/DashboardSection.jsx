import React from 'react';
import {Text, StyleSheet, Dimensions, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Pentagon from "../Pentagon";
import PercentageBubble from "../PercentageBubble";
import CView from "../CView";
import Colors from "../../Constants/Colors";
const DashboardSection = ({ width, height, report, loading }) => {
    return (
        <CView style={styles.dashBoard}>
            <Pentagon width={width * 0.9} height={height * 0.35} color={Colors.dashBoardBackgroundPrimary}>
                <CView style={styles.pentagonContent}>
                    <Text style={styles.title}>Weekly Report</Text>
                    <CView style={styles.percentageBubbleContainer}>
                        <PercentageBubble
                            size={60}
                            color={Colors.percentageCarbs}
                            title='Carbs'
                            value={report.carbs}
                        />
                        <PercentageBubble
                            size={60}
                            color={Colors.percentageProtein}
                            title='Protein'
                            value={report.protein}
                        />
                        <PercentageBubble
                            size={60}
                            color={Colors.percentageFat}
                            title='Fat'
                            value={report.fat}
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
    );
};

const styles = StyleSheet.create({
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
    },
});

export default DashboardSection;