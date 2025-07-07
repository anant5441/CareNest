import serverConfig from "../Constants/serverConfig";


const getUserDetails = async (authToken)=>{
    const URL = serverConfig.BaseURL +  '/api/auth/me';
    try {
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        return data;

    } catch (error) {
        console.error('Error adding meal:', error);
        throw error;
    }
}

export {getUserDetails}