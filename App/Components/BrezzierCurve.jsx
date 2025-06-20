import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const BezierCurve = ({ width = '100%', height = 200, strokeWidth = 3, strokeColor = '#007AFF', isPrimary = true }) => {
    // Define viewBox dimensions for SVG
    const viewBoxWidth = 100;
    const viewBoxHeight = 100;

    let startX, startY, endX, endY, controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y;

    if (isPrimary) {
        // Primary curve: starts lower left, ends upper right
        startX = 0;
        startY = viewBoxHeight; // Lower left
        endX = viewBoxWidth;
        endY = 0; // Upper right

        // Control points for horizontal S-curve
        controlPoint1X = viewBoxWidth * 0.3;
        controlPoint1Y = viewBoxHeight * 0.2; // Pull up
        controlPoint2X = viewBoxWidth * 0.7;
        controlPoint2Y = viewBoxHeight * 0.8; // Pull down
    } else {
        // Secondary curve: starts upper left, ends lower right
        startX = 0;
        startY = 0; // Upper left
        endX = viewBoxWidth;
        endY = viewBoxHeight; // Lower right

        // Control points for inverted horizontal S-curve
        controlPoint1X = viewBoxWidth * 0.3;
        controlPoint1Y = viewBoxHeight * 0.8; // Pull down
        controlPoint2X = viewBoxWidth * 0.7;
        controlPoint2Y = viewBoxHeight * 0.2; // Pull up
    }

    // Create SVG path string for cubic Bézier curve
    const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;

    return (
        <View style={{ width, height }}>
            <Svg
                width={width}
                height={height}
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                preserveAspectRatio="none"
            >
                <Path
                    d={pathData}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                />
            </Svg>
        </View>
    );
};

export default BezierCurve;