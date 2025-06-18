import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

const TouchableImageCard = ({ src, alt, title, onPress, style, imageStyle, textStyle }) => {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
            <Image
                source={{ uri: src }}
                style={[styles.image, imageStyle]}
                resizeMode="contain"
                accessibilityLabel={alt}
            />
            <Text style={[styles.title, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
    },
});

export default TouchableImageCard;