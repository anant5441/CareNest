import React from 'react'
import {StyleSheet} from 'react-native'
import Chatbot from "../../Components/Chatbot";
import ServerConfig from "../../Constants/serverConfig";
function HomeChat() {
    const HandleQuery = async (query) => {
        const URL = ServerConfig.BaseURL + '/api/f1/query';
        try {
            const response = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'query': query }),
            });

            const data = await response.json();
            console.log(data);
            return data.result;
        } catch (error) {
            throw new Error('Failed to get response');
        }
    };
    return (
        <Chatbot
            handleQuery={HandleQuery}
            style = {styles.container} />
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: '10%',
    }
})

export default HomeChat
