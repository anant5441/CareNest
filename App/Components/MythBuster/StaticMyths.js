const staticMyths = [
    {
        id: 1,
        question: "Can I drink coffee during pregnancy?",
        answer: "Moderate caffeine intake (less than 200mg/day) is generally considered safe during pregnancy. This equals about one 12-oz cup of coffee.",
        source: "American College of Obstetricians and Gynecologists",
        category: "nutrition",
        icon: "cafe"
    },
    {
        id: 2,
        question: "Is it safe to exercise during pregnancy?",
        answer: "Regular moderate exercise is beneficial for most pregnant women. However, always consult with your healthcare provider before starting any exercise routine.",
        source: "Mayo Clinic",
        category: "exercise",
        icon: "fitness"
    },
    {
        id: 3,
        question: "Can I dye my hair while pregnant?",
        answer: "Hair dye is generally considered safe during pregnancy, especially after the first trimester. Choose well-ventilated areas and consider highlights instead of full color.",
        source: "American Pregnancy Association",
        category: "beauty",
        icon: "brush"
    },
    {
        id: 4,
        question: "Does the shape of my belly determine the baby's gender?",
        answer: "No, the shape of your belly has nothing to do with your baby's gender. It's determined by your body type, muscle tone, and baby's position.",
        source: "WebMD",
        category: "myths",
        icon: "help-circle"
    },
    {
        id: 5,
        question: "Can I travel by plane during pregnancy?",
        answer: "Air travel is generally safe for pregnant women up to 36 weeks. Check with your airline for specific policies and consult your doctor before traveling.",
        source: "CDC Guidelines",
        category: "travel",
        icon: "airplane"
    },
    {
        id: 6,
        question: "Do cravings indicate nutrient deficiencies?",
        answer: "Food cravings during pregnancy are common but don't necessarily indicate nutrient deficiencies. They're more likely due to hormonal changes.",
        source: "Harvard Health",
        category: "nutrition",
        icon: "restaurant"
    },
    {
        id: 7,
        question: "Is it safe to eat sushi during pregnancy?",
        answer: "Cooked sushi is generally safe, but raw fish should be avoided due to potential bacteria and parasites. Opt for cooked options like California rolls.",
        source: "FDA Guidelines",
        category: "nutrition",
        icon: "fish"
    },
    {
        id: 8,
        question: "Can I sleep on my back during pregnancy?",
        answer: "After 20 weeks, it's recommended to sleep on your side rather than your back to improve blood flow to the baby.",
        source: "American Pregnancy Association",
        category: "sleep",
        icon: "bed"
    }
];

const categories = [
    { key: 'all', label: 'All', icon: 'apps', color: '#8e44ad' },
    { key: 'nutrition', label: 'Nutrition', icon: 'restaurant', color: '#e74c3c' },
    { key: 'exercise', label: 'Exercise', icon: 'fitness', color: '#2ecc71' },
    { key: 'beauty', label: 'Beauty', icon: 'brush', color: '#f39c12' },
    { key: 'travel', label: 'Travel', icon: 'airplane', color: '#3498db' },
    { key: 'myths', label: 'Myths', icon: 'help-circle', color: '#e67e22' },
    { key: 'sleep', label: 'Sleep', icon: 'bed', color: '#9b59b6' }
];

export {staticMyths,categories};