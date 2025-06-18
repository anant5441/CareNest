import * as Localization from 'react-native-localize' //getting the browser details
import i18n from 'i18n-js' //
import {translations} from './translations.js'

//loading translations into i18n engine
i18n.translations=translations 
//getLocales is array storing countryCode, languageCode etc
const locales = Localization.getLocales()

//if successfully langauge is detected, return true
if(Array.isArray(locales))
{
    //setting the detected language
    i18n.locale=locales[0].languageCode
}

i18n.fallbacks = true //fallback to english if failed to detect browser language

export default i18n