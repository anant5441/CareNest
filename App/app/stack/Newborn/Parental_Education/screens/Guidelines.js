import React from "react";
import {Text,ScrollView,View,Stylesheet} from 'react-native'
import i18n from '../i18n.js'

const Guidelines = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>🧠 Infant Care Guidelines</Text>
            //looking up current translation string based on the browser language (active locale en,hi, etc)
            <Text style={styles.guidelines}>{i18n.t('guidelines')}</Text> 

        </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  guidelines: {
    fontSize: 16,
    lineHeight: 24,
  },
});
