import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CView from '../CView';
import Colors from "../../Constants/Colors";


const DateNavigation = ({ currentDate, onNavigate, isToday }) => {
    const formatDate = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <CView style={styles.dateNavigationContainer}>
            <TouchableOpacity
                style={styles.dateNavButton}
                onPress={() => onNavigate(-1)}
            >
                <Icon name="chevron-left" size={24} color="#666" />
            </TouchableOpacity>

            <CView style={styles.dateContainer}>
                <Icon name="calendar-today" size={20} color="#666" style={styles.calendarIcon} />
                <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
            </CView>

            <TouchableOpacity
                style={[
                    styles.dateNavButton,
                    isToday && styles.dateNavButtonDisabled
                ]}
                onPress={() => onNavigate(1)}
                disabled={isToday}
            >
                <Icon
                    name="chevron-right"
                    size={24}
                    color={isToday ? "#ccc" : "#666"}
                />
            </TouchableOpacity>
        </CView>
    );
};

const styles = StyleSheet.create({
    dateNavigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 25,
        paddingHorizontal: 20,
    },
    dateNavButton: {
        padding: 8,
        backgroundColor: Colors.dateNavContainer,
        borderRadius: 20,
        marginHorizontal: 15,
    },
    dateNavButtonDisabled: {
        backgroundColor: 'transparent',
        opacity: 0.5,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dateNavContainer,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 140,
        justifyContent: 'center',
    },
    calendarIcon: {
        marginRight: 8,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});

export default DateNavigation;