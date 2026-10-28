import { colorType, darkColors, lightColors } from '@/theme/colors'
import { format, isToday } from 'date-fns'
import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native'

export enum Variant {
    regular = 1,
    today,
    future,
    completed,
    oldCompleted,
}

interface Props {
    date: Date
    onPress: (date: Date) => void
    variant: Variant
}

export default function Box({ date, variant, onPress }: Props) {
    const colorscheme = useColorScheme()
    const colors = colorscheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const today = isToday(date)
    return (
        <Pressable
            style={[
                styles.container,
                variant === Variant.completed && styles.completed,
                variant === Variant.future && styles.future,
                variant === Variant.regular && styles.regular,
                variant === Variant.oldCompleted && styles.regular,
                today ? styles.today : '',
            ]}
            onPress={() => onPress(date)}
        >
            <Text
                style={[
                    variant === Variant.today && styles.textFg,
                    variant === Variant.completed && styles.textBg,
                    variant === Variant.future && styles.textFg,
                    variant === Variant.regular && styles.textFg,

                    variant === Variant.oldCompleted && styles.textGreen,
                ]}
            >
                {format(date, 'd')}
            </Text>
        </Pressable>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        textFg: {
            color: colors.fg,
        },

        textBg: {
            color: colors.bg,
        },

        textRed: {
            color: colors.red,
        },

        textGreen: {
            color: colors.green,
        },

        textDarkGreen: {
            color: colors.darkGreen,
        },

        container: {
            justifyContent: 'center',
            alignItems: 'center',
            aspectRatio: 1,
            width: 30,
            height: 30,
            borderRadius: 10,
        },

        today: {
            borderWidth: 2,
            borderColor: colors.fg,
        },

        completed: {
            backgroundColor: colors.green,
        },

        regular: {
            backgroundColor: colors.bg,
        },

        future: {
            backgroundColor: colors.bg2,
        },
    })
}
