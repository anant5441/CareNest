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
function fibonacci(n) {
    if (n < 0) return null;
    if (n === 0) return 0;
    if (n === 1) return 1;

    let prev = 0, curr = 1;

    for (let i = 2; i <= n; i++) {
        const next = prev + curr;
        prev = curr;
        curr = next;
    }

    return curr;
}


export {getUserDetails , fibonacci}