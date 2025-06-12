import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CView from './CView';

const MenuItemComponent = ({
                               title,
                               subtitle,
                               icon,
                               iconType = 'material',
                               onPress,
                               showArrow = true,
                               backgroundColor = 'rgba(255, 255, 255, 0.9)',
                               style
                           }) => {
    const renderIcon = () => {
        switch (iconType) {
            case 'image':
                return (
                    <Image
                        source={icon}
                        style={styles.imageIcon}
                        resizeMode="cover"
                    />
                );
            case 'emoji':
                return <Text style={styles.emojiIcon}>{icon}</Text>;
            case 'material':
            default:
                return (
                    <Icon
                        name={icon}
                        size={24}
                        color="#6B46C1"
                    />
                );
        }
    };

    return (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor }, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <CView style={styles.menuItemLeft}>
                <CView style={styles.iconContainer}>
                    {renderIcon()}
                </CView>
                <CView style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{title}</Text>
                    {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
                </CView>
            </CView>
            {showArrow && (
                <Icon name="chevron-right" size={24} color="#999" />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 6,
        paddingVertical: 5,
        marginBottom: 12,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(107, 70, 193, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    imageIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    emojiIcon: {
        fontSize: 24,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
});

export default MenuItemComponent;