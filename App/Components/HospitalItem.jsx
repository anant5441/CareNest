import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from "../Constants/Colors";

const { width } = Dimensions.get('window');

const LocationCard = ({ name, address, lat, lng }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Convert to numbers and validate
    const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
    const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
        return (
            <View style={styles.container}>
                <View style={styles.errorCard}>
                    <Text style={styles.errorText}>Invalid coordinates</Text>
                </View>
            </View>
        );
    }

    const handleMapPress = () => {
        const url = `https://maps.google.com/?q=${latitude},${longitude}`;
        Linking.openURL(url).catch(err => console.error('Error opening map:', err));
    };

    const handleDirectionsPress = () => {
        const url = `https://maps.google.com/maps?daddr=${latitude},${longitude}`;
        Linking.openURL(url).catch(err => console.error('Error opening directions:', err));
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    // Compressed state
    if (!isExpanded) {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.compressedCard}
                    onPress={toggleExpanded}
                    activeOpacity={0.7}
                >
                    <View style={styles.compressedContent}>
                        <View style={styles.compressedIconContainer}>
                            <Icon name="location-on" size={24} color={Colors.nearbyHospitals.iconColor} />
                        </View>
                        <Text style={styles.compressedName} numberOfLines={1}>
                            {name || 'Unknown Location'}
                        </Text>
                        <Icon name="expand-more" size={20} color="#6B7280" />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    // Expanded state (original design)
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Header Section with collapse button */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Icon name="location-on" size={32} color={Colors.nearbyHospitals.iconColor} />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.name}>{name || 'Unknown Location'}</Text>
                        <View style={styles.coordinatesContainer}>
                            <Icon name="my-location" size={16} color="#6B7280" />
                            <Text style={styles.coordinates}>
                                {latitude.toFixed(6)}, {longitude.toFixed(6)}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.collapseButton}
                        onPress={toggleExpanded}
                        activeOpacity={0.7}
                    >
                        <Icon name="expand-less" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* Address Section */}
                <View style={styles.addressSection}>
                    <View style={styles.addressHeader}>
                        <Icon name="place" size={20} color="#6B7280" />
                        <Text style={styles.addressLabel}>Address</Text>
                    </View>
                    <Text style={styles.address}>{address || 'Address not available'}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleMapPress}
                        activeOpacity={0.8}
                    >
                        <Icon name="map" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>View on Map</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleDirectionsPress}
                        activeOpacity={0.8}
                    >
                        <Icon name="directions" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Get Directions</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        alignItems: 'center',
    },
    card: {
        width: width - 32,
        borderRadius: 24,
        padding: 24,
        backgroundColor: Colors.nearbyHospitals.cardColor,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    compressedCard: {
        width: width - 32,
        borderRadius: 16,
        padding: 16,
        backgroundColor: Colors.nearbyHospitals.cardColor,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    compressedContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compressedIconContainer: {
        backgroundColor: Colors.nearbyHospitals.iconBgColor,
        borderRadius: 12,
        padding: 8,
        marginRight: 12,
    },
    compressedName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    errorCard: {
        width: width - 32,
        borderRadius: 24,
        padding: 24,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    iconContainer: {
        backgroundColor: Colors.nearbyHospitals.iconBgColor,
        borderRadius: 20,
        padding: 12,
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    coordinatesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coordinates: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
        fontFamily: 'monospace',
    },
    collapseButton: {
        padding: 4,
        marginLeft: 8,
    },
    addressSection: {
        backgroundColor: Colors.nearbyHospitals.addressContainer,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 8,
    },
    address: {
        fontSize: 15,
        color: '#1F2937',
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
        backgroundColor: Colors.nearbyHospitals.buttonColor,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
    },
});

const App = ({ name, address, lat, lng }) => {
    return (
        <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center' }}>
            <LocationCard
                name={name}
                address={address}
                lat={lat}
                lng={lng}
            />
        </View>
    );
};

export default App;