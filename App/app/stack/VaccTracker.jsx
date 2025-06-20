import {StyleSheet, View, ScrollView, Text, TouchableOpacity} from 'react-native'
import { useState } from 'react'
import CView from "../../Components/CView";
import Vaccines from "../../Constants/Vaccines";
import Colors from "../../Constants/Colors";
import BackgoundWrapper from "../../Components/BackgoundWrapper";

const VaccTracker = () => {
    // State to track checked vaccines
    const [checkedVaccines, setCheckedVaccines] = useState({});

    // Format age labels for better display
    const formatAgeLabel = (age) => {
        switch(age) {
            case '4_6 Years':
                return '4-6 Years';
            case '11_12 Years':
                return '11-12 Years';
            default:
                return age;
        }
    };

    // Handle checkbox change
    const handleVaccineCheck = (ageGroup, vaccineIndex, isChecked) => {
        const key = `${ageGroup}_${vaccineIndex}`;
        setCheckedVaccines(prev => ({
            ...prev,
            [key]: isChecked
        }));
    };

    // Check if a vaccine is checked
    const isVaccineChecked = (ageGroup, vaccineIndex) => {
        const key = `${ageGroup}_${vaccineIndex}`;
        return checkedVaccines[key] || false;
    };

    // Convert vaccine object to array with formatted age labels
    const vaccineEntries = Object.entries(Vaccines).map(([age, vaccines]) => ({
        age: formatAgeLabel(age),
        originalAge: age,
        vaccines: vaccines
    }));

    // Calculate completion percentage for an age group
    const getCompletionPercentage = (ageGroup, vaccines) => {
        const totalVaccines = vaccines.length;
        const checkedCount = vaccines.filter((_, index) =>
            isVaccineChecked(ageGroup, index)
        ).length;
        return totalVaccines > 0 ? Math.round((checkedCount / totalVaccines) * 100) : 0;
    };

    return (
        <BackgoundWrapper>
            <CView safe={true} style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {vaccineEntries.map((entry, index) => {
                        const completionPercentage = getCompletionPercentage(entry.originalAge, entry.vaccines);

                        return (
                            <View key={entry.age} style={styles.ageGroupContainer}>
                                <View style={[
                                    styles.ageGroupDiv,
                                    index % 2 === 0 ? styles.primaryDiv : styles.secondaryDiv
                                ]}>
                                    <View style={styles.ageHeader}>
                                        <Text style={styles.ageTitle}>{entry.age}</Text>
                                        <View style={styles.progressBadge}>
                                            <Text style={styles.progressText}>{completionPercentage}%</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.vaccineCount}>
                                        {entry.vaccines.length} vaccine{entry.vaccines.length > 1 ? 's' : ''}
                                    </Text>

                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${completionPercentage}%` }
                                            ]}
                                        />
                                    </View>

                                    <View style={styles.vaccinesList}>
                                        {entry.vaccines.map((vaccine, vaccIndex) => {
                                            const isChecked = isVaccineChecked(entry.originalAge, vaccIndex);

                                            return (
                                                <TouchableOpacity
                                                    key={vaccIndex}
                                                    style={styles.vaccineItemContainer}
                                                    onPress={() => handleVaccineCheck(entry.originalAge, vaccIndex, !isChecked)}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={styles.checkboxContainer}>
                                                        <View style={[
                                                            styles.checkbox,
                                                            isChecked && styles.checkboxChecked
                                                        ]}>
                                                            {isChecked && (
                                                                <Text style={styles.checkmark}>✓</Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                    <Text style={[
                                                        styles.vaccineItem,
                                                        isChecked && styles.vaccineItemChecked
                                                    ]}>
                                                        {vaccine}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>

                                {index < vaccineEntries.length - 1 && (
                                    <View style={[
                                        styles.curveContainer,
                                        index % 2 === 0 ? styles.curvePrimary : styles.curveSecondary
                                    ]}>
                                        <View style={styles.connectionLine} />
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            </CView>
        </BackgoundWrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingVertical:40
    },
    ageGroupContainer: {
        marginBottom: 15,
    },
    ageGroupDiv: {
        padding: 20,
        borderRadius: 16,
        backgroundColor: Colors.ageGrpBg,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    primaryDiv: {
        alignSelf: 'flex-end',
        marginRight: 0,
        width: '95%',
    },
    secondaryDiv: {
        alignSelf: 'flex-start',
        marginLeft: 0,
        width: '95%',
    },
    ageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    progressBadge: {
        backgroundColor: '#4299E1',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    progressText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    vaccineCount: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: Colors.progressBarEmpty,
        borderRadius: 3,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.progressBarFill,
        borderRadius: 3,
    },
    vaccinesList: {
        gap: 8,
    },
    vaccineItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 8,
        backgroundColor: Colors.ageGrpItem,
    },
    checkboxContainer: {
        marginRight: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#CBD5E0',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: Colors.checkbox,
        borderColor: Colors.checkbox,
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    vaccineItem: {
        fontSize: 14,
        color: '#4A5568',
        flex: 1,
        lineHeight: 20,
    },
    vaccineItemChecked: {
        textDecorationLine: 'line-through',
        color: '#A0AEC0',
    },
    curveContainer: {
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
    connectionLine: {
        width: 2,
        height: 20,
        backgroundColor: '#0f76ee',
        borderRadius: 1,
    },
    curvePrimary: {
        alignItems: 'flex-end',
        paddingRight: '10%',
    },
    curveSecondary: {
        alignItems: 'flex-start',
        paddingLeft: '10%',
    }
})

export default VaccTracker;