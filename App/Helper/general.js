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

        return await response.json();

    } catch (error) {
        throw error;
    }
}

export {getUserDetails}