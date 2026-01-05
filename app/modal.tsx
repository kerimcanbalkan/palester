import { View, StyleSheet, ViewStyle, useColorScheme } from 'react-native'
import { Link } from 'expo-router'
import { colorType, darkColors, lightColors } from '@/theme/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslation } from '@/localization/useTranslation'

export default function Modal() {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    return (
        <View style={{ width: '100%', height: '100%' }}>
            <Link href="../" style={styles.close}>
                <Ionicons name="close" size={32} color={colors.fg} />
            </Link>
            <View style={styles.container}>
                <View>
                    <Link href="/settings/program" style={styles.link}>
                        {t('modal.program')}
                    </Link>
                    <Link href="/settings/import-export" style={styles.link}>
                        {t('modal.importExport')}
                    </Link>
                    <Link href="/settings/language" style={styles.link}>
                        {t('modal.language')}
                    </Link>
                </View>
            </View>
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.bg,
        } as ViewStyle,

        link: {
            color: colors.fg,
            fontSize: 24,
            padding: 10,
            borderWidth: 1,
            borderColor: colors.fg,
            margin: 10,
            textAlign: 'center',
        },

        close: {
            color: colors.fg,
            fontSize: 48,
            paddingHorizontal: 30,
            alignSelf: 'flex-end',
        },
    })
}
