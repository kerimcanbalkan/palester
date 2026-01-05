import { I18n } from 'i18n-js'
import * as Localization from 'expo-localization'
import en from './en.json'
import tr from './tr.json'
import sq from './sq.json'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'sq', label: 'Shqip' },
]

const locales = Localization.getLocales()[0]

const i18n = new I18n({ en, tr, sq })
i18n.enableFallback = true

export async function initI18n() {
  const storedLang = await AsyncStorage.getItem('language')
  i18n.locale = storedLang || locales.languageCode || 'en'
}

export function changeLanguage(langCode: string) {
  i18n.locale = langCode
  AsyncStorage.setItem('language', langCode) // save selection
}

export default i18n
