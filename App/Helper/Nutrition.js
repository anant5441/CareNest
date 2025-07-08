import serverConfig from "../Constants/serverConfig";

async function getWeeklyReports(authToken) {
    const URL = serverConfig.BaseURL + '/api/auth/meal_avg';
    try{
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            carbs: data.carbs * 100,
            protein: data.fats * 100,
            fat: data.proteins * 100,
        }

    } catch (error) {
        console.error(error);
    }
}

async function getDailyMeals(date,authToken) {

    // Format date to YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    const URL = serverConfig.BaseURL + '/api/auth/meals/' + formattedDate;

    try {
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if data.meals exists and is an array
        if (!data.meals || !Array.isArray(data.meals)) {
            return [];
        }

        // Transform the API response to required format
        const transformedMeals = data.meals.map(meal => {
            // Generate a meal name based on type (you can customize this logic)
            const mealNames = {
                breakfast: "Morning Meal",
                lunch: "Afternoon Meal",
                dinner: "Evening Meal",
                snack: "Snack"
            };

            return {
                time: meal.time ? meal.time + ":00" : "00:00:00", // Add seconds if not present
                type: meal.meal_type || "meal",
                name: meal.meal_name || "Meal",
                carbs: meal.composition?.carbs ? Math.round(meal.composition.carbs * 100) : 0,
                protein: meal.composition?.proteins ? Math.round(meal.composition.proteins * 100) : 0,
                fat: meal.composition?.fats ? Math.round(meal.composition.fats * 100) : 0
            };
        });

        return transformedMeals;

    } catch (error) {
        return []; // Return empty array instead of throwing
    }
}

async function addMealToDate(authToken, date, meal) {
    //date format 2025-07-03
    //meal sample
    /*
    {
      "time": "19:30",
      "name": "Mango",
      "meal_type": "Dinner"
     }
    */
    const URL = serverConfig.BaseURL + '/api/auth/meals/add-custom?date=' + date;

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(meal)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error adding meal:', error);
        throw error;
    }
}

export {getDailyMeals,getWeeklyReports,addMealToDate}