import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import Colors from "../Constants/Colors";

const TouchableImageCard = ({ src, alt, title, onPress, style, imageStyle, textStyle }) => {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
            <Image
                source={src}
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
        backgroundColor: Colors.optionItemBgColor,
        alignItems: 'center',
        padding: 10,
        borderRadius:30

    },
    image: {
        width: 100,
        height: 100,
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