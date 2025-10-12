import { Pressable, Text, StyleSheet, useColorScheme } from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import { useState } from 'react'

interface Props {
    text: string
    onToggle: (day: string, active: boolean) => void
}

export default function DayButton({ text, onToggle }: Props) {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    const [active, setActive] = useState(false)

    function handlePress() {
        const newState = !active
        setActive(newState)
        onToggle(text, newState)
    }

    return (
        <Pressable
            style={active ? styles.activeButton : styles.button}
            onPress={handlePress}
        >
            <Text style={active ? styles.activeButtonText : styles.buttonText}>
                {text}
            </Text>
        </Pressable>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        button: {
            backgroundColor: colors.bg2,
            borderRadius: 10,
            width: '27%',
            alignItems: 'center',
        },
        activeButton: {
            backgroundColor: colors.fg,
            borderRadius: 10,
            width: '27%',
            alignItems: 'center',
        },
        buttonText: {
            color: colors.fg,
            textTransform: 'uppercase',
            fontSize: 18,
            paddingVertical: 10,
            paddingHorizontal: 20,
        },
        activeButtonText: {
            color: colors.bg,
            textTransform: 'uppercase',
            fontSize: 18,
            paddingVertical: 10,
            paddingHorizontal: 20,
        },
    })
}
