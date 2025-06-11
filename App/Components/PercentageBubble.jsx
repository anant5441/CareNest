import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const CircularProgress = ({
                              value = 0,
                              color = '#4ECDC4',
                              title = '',
                              size = 120,
                              backgroundColor = '#E5E5E5'
                          }) => {
    const normalizedValue = Math.max(0, Math.min(100, value));
    const radius = size / 2;
    const centerX = size / 2;
    const centerY = size / 2;

    const angle = (normalizedValue / 100) * 360;
    const radians = (angle - 90) * (Math.PI / 180);

    const endX = centerX + radius * Math.cos(radians);
    const endY = centerY + radius * Math.sin(radians);


    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = angle === 0 ? '' :
        `M ${centerX} ${centerY} 
     L ${centerX} ${centerY - radius} 
     A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} 
     Z`;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.svg}>
                <Circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill={backgroundColor}
                />
                {normalizedValue > 0 && (
                    <Path
                        d={pathData}
                        fill={color}
                    />
                )}
            </Svg>
            <View style={styles.centerContent}>
                <Text style={styles.valueText}>
                    {normalizedValue}%
                </Text>
                {title && (
                    <Text style={styles.titleText}>
                        {title}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    svg: {
        position: 'absolute',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    valueText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
    },
    titleText: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '600',
    },
});

export default CircularProgress;