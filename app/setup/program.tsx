import { View, Text, StyleSheet, useColorScheme, Alert } from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import Logo from '@/components/Logo'
import CustomButton from '@/components/CustomButton'
import { useState } from 'react'
import DayButton from '@/components/DayButton'
import { useRouter } from 'expo-router'

export default function Program() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const router = useRouter()

    const [workoutDays, setWorkoutDays] = useState<string[]>([])

    function handleDayToggle(day: string, active: boolean) {
        setWorkoutDays((prev) => {
            if (active) {
                // if activated, add to list
                return [...prev, day]
            } else {
                // if deactivated, remove from list
                return prev.filter((d) => d !== day)
            }
        })
    }

    function handleConfirm() {
        if (workoutDays.length === 0) {
            Alert.alert('You should choose atleast 1 workout day')
            return
        }
        router.push({
            pathname: '/setup/location',
            params: { workoutDays: JSON.stringify(workoutDays) },
        })
    }

    return (
        <View style={styles.container}>
            <Logo size={46} />
            <View style={{ alignItems: 'center' }}>
                <Text style={styles.header}>Program</Text>
                <Text style={styles.text}>Which Days will you go to gym?</Text>

                <View style={styles.buttonContainer}>
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(
                        (day) => (
                            <DayButton
                                key={day}
                                text={day}
                                onToggle={handleDayToggle}
                            />
                        )
                    )}
                </View>
            </View>

            <CustomButton
                text="    Confirm    "
                onPress={handleConfirm}
                size={24}
            />
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        buttonContainer: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingHorizontal: 30,
            flexWrap: 'wrap',
            gap: 10,
            width: '100%',
        },
        text: {
            color: colors.fg,
            fontSize: 24,
            textAlign: 'center',
            padding: 15,
        },
        header: {
            color: colors.fg,
            marginBottom: 20,
            fontSize: 36,
            fontFamily: 'OpenSans_700Bold',
        },
    })
}
