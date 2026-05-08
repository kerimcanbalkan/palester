import { colorType, darkColors, lightColors } from '@/theme/colors'
import {
    useColorScheme,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TouchableOpacity,
} from 'react-native'
import CustomText from '@/components/CustomText'

interface Props {
    text: string
    size: number
    onPress: () => void
    disabled?: boolean
}
export default function CustomButton({ text, onPress, size, disabled }: Props) {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors, size, disabled)

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.button}
            disabled={disabled}
        >
            <CustomText style={styles.buttonCustomText}>{text}</CustomText>
        </TouchableOpacity>
    )
}

function themedStyles(colors: colorType, size: number, disabled?: boolean) {
    return StyleSheet.create({
        button: {
            backgroundColor: colors.fg,
            paddingHorizontal: 17,
            paddingVertical: 10,
            borderRadius: 10,
            overflow: 'visible',
            // if disabled
            opacity: disabled ? 0.5 : 1,
            elevation: disabled ? 0 : 2,
        } as ViewStyle,

        buttonCustomText: {
            fontSize: size,
            fontFamily: 'OpenSans_700Bold',
            textTransform: 'uppercase',
            color: colors.bg,
            paddingHorizontal: 10,
            overflow: 'visible',
        } as TextStyle,
    })
}
