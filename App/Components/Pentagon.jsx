import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const Pentagon = ({
                      width = 200,
                      height = 180,
                      color = '#B794F6',
                      borderRadius = 20,
                      children,
                  }) => {
    const pathData = `
        M ${borderRadius} 0
        L ${width - borderRadius} 0
        Q ${width} 0 ${width} ${borderRadius}
        L ${width} ${height - 60}
        L ${width / 2} ${height}
        L 0 ${height - 60}
        L 0 ${borderRadius}
        Q 0 0 ${borderRadius} 0
        Z
    `;

    return (
        <View style={[styles.container, { width, height }]}>
            <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
                <Path d={pathData} fill={color} />
            </Svg>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    content: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
});

export default Pentagon;
