import React from 'react';
import {StyleSheet} from 'react-native';

import CView from '../CView';
import MenuItemComponent from "../MenuItem";
import Colors from "../../Constants/Colors";

const MenuSection = ({ isToday, onMenuPress }) => {
    const todayMenuItems = [
        {
            id: 1,
            title: 'Add a meal',
            subtitle: 'Tell us what you ate today',
            icon: require('../../assets/Nutrition/Add meal.jpeg'),
            iconType: 'image',
            showArrow: false,
            backgroundColor: Colors.menuitemNutritionBackgroundPrimary,
        },
        {
            id: 2,
            title: 'AI guide',
            subtitle: 'Get AI-Powered Food Suggestions',
            icon: require('../../assets/Nutrition/AI guide.jpeg'),
            iconType: 'image',
            backgroundColor: Colors.menuitemNutritionBackgroundSecondary,
        },
        {
            id: 3,
            title: 'Food Stats',
            subtitle: 'Instant Macro Insights',
            icon: require('../../assets/Nutrition/AI guide.jpeg'),
            iconType: 'image',
            backgroundColor: Colors.menuItemNutritionBackgroundTertiary,
        },
        {
            id: 4,
            title: 'Meal Recap',
            subtitle: 'Your Food Diary, Simplified',
            icon: require('../../assets/Nutrition/Recap.jpeg'),
            iconType: 'image',
            backgroundColor: Colors.menuitemNutritionBackgroundQuad,
        }
    ];

    const pastDateMenuItems = [
        {
            id: 1,
            title: 'Edit meal',
            subtitle: 'Modify your meal entries',
            icon: 'edit',
            iconType: 'material',
            backgroundColor: Colors.menuitemNutritionBackgroundEdit,
        }
    ];

    const currentMenuItems = isToday ? todayMenuItems : pastDateMenuItems;

    return (
        <CView style={styles.menuContainer}>
            {currentMenuItems.map((item) => (
                <MenuItemComponent
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    icon={item.icon}
                    iconType={item.iconType}
                    showArrow={item.showArrow !== false}
                    onPress={() => onMenuPress(item.id)}
                    style={item.id === 1 ? styles.addMealItem : null}
                    backgroundColor={item.backgroundColor}
                />
            ))}
        </CView>
    );
};

const styles = StyleSheet.create({
    menuContainer: {
        width: '100%',
        paddingHorizontal: 20,
    },
    addMealItem: {
        position: 'relative',
    },
});

export default MenuSection;