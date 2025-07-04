import React, {useCallback, useState, useEffect} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import useLocation from "../../hooks/useLocation";
import BackgroundWrapper from "../../Components/BackgoundWrapper";
import LocLoading from "../../Components/LocLoading";
import HospitalItem from "../../Components/HospitalItem";
import CView from "../../Components/CView";
import Colors from "../../Constants/Colors";
import ServerConfig from "../../Constants/serverConfig";

const getHospitals = async (lat, lng, count, radius) => {
    const URL = ServerConfig.BaseURL + '/api/f4/nearby-hospitals';
    const params = {
        "lat": lat,
        "lng": lng,
        "radius": radius * 1000,
        "limit": count
    }
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return await response.json();
    }catch (e){
        console.error(e);
        throw new Error(e);
    }
};

const NearbyHospitals = () => {
    const [loading, setLoading] = useState(false);
    const [hospitals, setHospitals] = useState([]);
    const [error, setError] = useState(null);

    // Use the location hook
    const { location, loading: locationLoading, error: locationError, getLocation } = useLocation();

    // Dropdown states
    const [hospitalCount, setHospitalCount] = useState(5);
    const [radius, setRadius] = useState(10);

    // Dropdown options
    const hospitalCountOptions = [
        { label: '5 Hospitals', value: 5 },
        { label: '10 Hospitals', value: 10 },
        { label: '15 Hospitals', value: 15 },
        { label: '20 Hospitals', value: 20 },
    ];

    const radiusOptions = [
        { label: '5 km', value: 5 },
        { label: '10 km', value: 10 },
        { label: '15 km', value: 15 },
        { label: '20 km', value: 20 },
        { label: '25 km', value: 25 },
    ];

    const fetchHospitals = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Get location first if we don't have it
            if (!location) {
                await getLocation();
                return; // Will retry when location updates via useEffect
            }

            const res = await getHospitals(location.lat, location.lng, hospitalCount, radius);
            setHospitals(res.hospitals);
        } catch (error) {
            console.log('Error fetching hospitals:', error);
            setError('Failed to load hospitals. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [location, hospitalCount, radius, getLocation]);

    // Retry fetching hospitals when location becomes available
    useEffect(() => {
        if (location) {
            fetchHospitals();
        }
    }, [location, hospitalCount, radius]);

    // Initial fetch
    useEffect(() => {
        fetchHospitals();
    }, []);

    const handleHospitalCountChange = useCallback((item) => {
        setHospitalCount(item.value);
    }, []);

    const handleRadiusChange = useCallback((item) => {
        setRadius(item.value);
    }, []);

    const hospitalItem = useCallback((hospital, index) => (
        <HospitalItem
            key={`hospital-${index}-${hospital.name}`}
            name={hospital.name.toUpperCase()}
            address={hospital.address}
            lat={hospital.location.lat.toFixed(6)}
            lng={hospital.location.lng.toFixed(6)}
        />
    ), []);

    // Show loading when getting location or fetching hospitals
    if (locationLoading || loading) {
        return (
            <BackgroundWrapper>
                <LocLoading />
            </BackgroundWrapper>
        );
    }

    // Show error if location permission denied or other location errors
    if (locationError || error) {
        const errorMessage = locationError || error;
        return (
            <BackgroundWrapper>
                <CView style={styles.errorContainer} safe={true}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchHospitals}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </CView>
            </BackgroundWrapper>
        );
    }

    return (
        <BackgroundWrapper>
            <CView style={styles.container} safe={true}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                >
                    <View style={styles.titlecontainer}>
                        <View style={styles.titleBar}>
                            <Text style={styles.title}>Nearby Hospitals</Text>
                        </View>
                    </View>

                    {/* Filter Controls */}
                    <View style={styles.filtersContainer}>
                        <View style={styles.filterRow}>
                            <View style={styles.dropdownContainer}>
                                <Text style={styles.dropdownLabel}>Hospitals</Text>
                                <Dropdown
                                    style={styles.dropdown}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    itemTextStyle={styles.itemTextStyle}
                                    itemContainerStyle={styles.itemContainerStyle}
                                    containerStyle={styles.dropdownContainerStyle}
                                    activeColor={Colors.nearbyHospitals.DropDownItemSelected}
                                    data={hospitalCountOptions}
                                    search={false}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select hospitals"
                                    value={hospitalCount}
                                    onChange={handleHospitalCountChange}
                                />
                            </View>

                            <View style={styles.dropdownContainer}>
                                <Text style={styles.dropdownLabel}>Search Radius</Text>
                                <Dropdown
                                    style={styles.dropdown}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    itemTextStyle={styles.itemTextStyle}
                                    itemContainerStyle={styles.itemContainerStyle}
                                    containerStyle={styles.dropdownContainerStyle}
                                    activeColor={Colors.nearbyHospitals.DropDownItemSelected}
                                    data={radiusOptions}
                                    search={false}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select radius"
                                    value={radius}
                                    onChange={handleRadiusChange}
                                />
                            </View>
                        </View>
                    </View>

                    {hospitals.map((hospital, index) => hospitalItem(hospital, index))}
                </ScrollView>

                <View style={styles.refreshButtonContainer} >
                    <TouchableOpacity style={styles.refreshButton} onPress={fetchHospitals}>
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            </CView>
        </BackgroundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    titlecontainer: {
        justifyContent: 'center',
        alignItems: 'center',

    },
    titleBar:{
        width: '60%',
        backgroundColor: Colors.greetingBarBackground,
        borderRadius: 20,
        textAlign: 'left',
        paddingVertical:'5%'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },
    filtersContainer: {
        marginTop: '3%',
        marginBottom: 16,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    dropdownContainer: {
        flex: 1,
        marginHorizontal: '3%'

    },
    dropdownLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    dropdown: {
        height: 44,
        borderColor: '#e9ecef',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: Colors.nearbyHospitals.DropDown,
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#666',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    itemTextStyle: {
        fontSize: 16,
        color: '#333',
    },
    itemContainerStyle: {
        backgroundColor: Colors.nearbyHospitals.DropDown,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    dropdownContainerStyle: {
        backgroundColor: Colors.nearbyHospitals.DropDown,
        borderColor: '#2e85da',
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollViewContent: {
        paddingBottom: 16,
    },
    refreshButtonContainer: {
        alignItems: 'center',
    },
    refreshButton: {
        width: '70%',
        backgroundColor: Colors.nearbyHospitals.refreshButtonColor,
        borderRadius: 15,
        padding: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    refreshButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: Colors.nearbyHospitals.ErrorButton,
        borderRadius: 8,
        padding: 12,
        paddingHorizontal: 24,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default NearbyHospitals;