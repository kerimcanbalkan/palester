import { colorType, darkColors, lightColors } from '@/theme/colors'
import { format } from 'date-fns'
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

    return (
        <Pressable
            style={[
                styles.container,
                variant === 'today' && styles.today,
                variant === 'completed' && styles.completed,
                variant === 'rest' && styles.rest,
                variant === 'missed' && styles.missed,
                variant === 'future' && styles.future,
                variant === 'regular' && styles.regular,
                variant === 'oldCompleted' && styles.regular,
                variant === 'oldMissed' && styles.regular,
                variant === 'oldRest' && styles.regular,
            ]}
        >
            <Text
                style={[
                    variant === 'today' && styles.textFg,
                    variant === 'completed' && styles.textBg,
                    variant === 'rest' && styles.textBg,
                    variant === 'missed' && styles.textFg,
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
            width: 30,
            height: 30,
            borderRadius: 10,
        },

        today: {
            backgroundColor: colors.bg2,
            borderWidth: 1,
            borderColor: colors.fg,
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
