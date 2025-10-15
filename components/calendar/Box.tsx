import { colorType, darkColors, lightColors } from '@/theme/colors'
import { format, isToday } from 'date-fns'
import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native'

interface Props {
    date: Date
    variant:
        | 'completed'
        | 'rest'
        | 'missed'
        | 'today'
        | 'future'
        | 'regular'
        | 'oldCompleted'
        | 'oldMissed'
        | 'oldRest'
}

export default function Box({ date, variant }: Props) {
    const colorscheme = useColorScheme()
    const colors = colorscheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const today = isToday(date)
    return (
        <Pressable
            style={[
                styles.container,
                variant === 'completed' && styles.completed,
                variant === 'rest' && styles.rest,
                variant === 'missed' && styles.missed,
                variant === 'future' && styles.future,
                variant === 'regular' && styles.regular,
                variant === 'oldCompleted' && styles.regular,
                variant === 'oldMissed' && styles.regular,
                variant === 'oldRest' && styles.regular,
                today ? styles.today : '',
            ]}
        >
            <Text
                style={[
                    variant === 'today' && styles.textFg,
                    variant === 'completed' && styles.textBg,
                    variant === 'rest' && styles.textBg,
                    variant === 'missed' && styles.textBg,
                    variant === 'future' && styles.textFg,
                    variant === 'regular' && styles.textFg,

                    variant === 'oldCompleted' && styles.textGreen,
                    variant === 'oldRest' && styles.textDarkGreen,
                    variant === 'oldMissed' && styles.textRed,
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
            borderColor: colors.fg2,
        },

        completed: {
            backgroundColor: colors.green,
        },

        rest: {
            backgroundColor: colors.darkGreen,
        },

        regular: {
            backgroundColor: colors.bg,
        },

        missed: {
            backgroundColor: colors.red,
        },

        future: {
            backgroundColor: colors.bg2,
        },
    })
}
