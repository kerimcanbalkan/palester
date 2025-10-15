import { colorType, darkColors, lightColors } from '@/theme/colors'
import {
    Pressable,
    Text,
    useColorScheme,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native'

interface Props {
    text: string
    size: number
    onPress: () => void
}
export default function CustomButton({ text, onPress, size }: Props) {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors, size)

    return (
        <Pressable onPress={onPress} style={styles.button}>
            <Text style={styles.buttonText}>{text}</Text>
        </Pressable>
    )
}

function themedStyles(colors: colorType, size: number) {
    return StyleSheet.create({
        button: {
            backgroundColor: colors.fg,
            fontFamily: 'OpenSans_700Bold',
            paddingHorizontal: 17,
            paddingVertical: 10,
            borderRadius: 10,
        } as ViewStyle,

        buttonText: {
            fontSize: size,
            fontFamily: 'OpenSans_700Bold',
            textTransform: 'uppercase',
            color: colors.bg,
        } as TextStyle,
    })
}
