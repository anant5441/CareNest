import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const Pentagon = ({
                      width = 200,
                      height = 180,
                      color = '#B794F6',
                      borderRadius = 20
                  }) => {
    // Create pentagon path with rounded top corners
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
            <Svg width={width} height={height}>
                <Path
                    d={pathData}
                    fill={color}
                />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Pentagon;