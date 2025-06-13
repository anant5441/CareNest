import React from 'react'
import {StyleSheet} from 'react-native'
import Chatbot from "../../Components/Chatbot";
function HomeChat() {
    const HandleQuery = async (query) => {
        try {
            const response = await fetch('http://192.168.29.233:8000/api/v1/query', {
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
