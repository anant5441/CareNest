import { useState } from 'react';
import * as Location from 'expo-location';

const useLocation = () => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getLocation = async () => {
        setLoading(true);
        setError(null);

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission denied');
            }

            const position = await Location.getCurrentPositionAsync();

            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        location,
        loading,
        error,
        getLocation,
    };
};

export default useLocation;