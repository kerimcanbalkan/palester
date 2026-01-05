import CustomText from '@/components/CustomText'
import i18n, { AVAILABLE_LANGUAGES, changeLanguage } from '@/localization/i18n'
import { useTranslation } from '@/localization/useTranslation'
import { colorType, darkColors, lightColors } from '@/theme/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState } from 'react'
import {
    View,
    StyleSheet,
    useColorScheme,
    TouchableOpacity,
} from 'react-native'

export default function Language() {
    const { t } = useTranslation()
    const languages = AVAILABLE_LANGUAGES
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    const [language, setLanguage] = useState(i18n.locale)

    const onLangPress = (lang: string) => {
        setLanguage(lang)
        changeLanguage(lang)
        AsyncStorage.setItem('language', lang)
    }

    return (
        <View style={styles.container}>
            <CustomText style={styles.title}>{t('language.title')}</CustomText>
            <View style={styles.radioContainer}>
                {languages.map((lang, i) => (
                    <TouchableOpacity
                        style={styles.radioButton}
                        onPress={() => onLangPress(lang.code)}
                        key={i}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                gap: 5,
                                justifyContent: 'space-between',
                            }}
                        >
                            <CustomText style={styles.radioText}>
                                {lang.label}
                            </CustomText>
                            {language === lang.code ? (
                                <Ionicons
                                    name="checkmark-circle-outline"
                                    size={32}
                                    color={colors.fg}
                                />
                            ) : (
                                <Ionicons
                                    name="ellipse-outline"
                                    size={32}
                                    color={colors.fg}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
        },
        title: {
            color: colors.fg,
            fontSize: 32,
        },
        radioContainer: {
            flex: 1,
            justifyContent: 'center',
            padding: 20,
            gap: 20,
        },
        radioButton: {
            borderWidth: 1,
            borderColor: colors.fg,
            padding: 10,
        },
        radioText: {
            fontSize: 24,
        },
    })
}
