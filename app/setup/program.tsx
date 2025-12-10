import { View, StyleSheet, useColorScheme } from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import Logo from '@/components/Logo'
import CustomButton from '@/components/CustomButton'
import { useState } from 'react'
import DayButton from '@/components/DayButton'
import { useRouter } from 'expo-router'
import { useAlert } from '@/context/AlertContext'
import { AppData, initData, TrainingProgram } from '@/api/api'
import { startOfToday } from 'date-fns'
import CustomText from '@/components/CustomText'
import { useSQLiteContext } from 'expo-sqlite'

export default function Program() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const router = useRouter()
    const db = useSQLiteContext()
    const { showAlert } = useAlert()

    const [workoutDays, setWorkoutDays] = useState<string[]>([])
    const [program, setProgram] = useState<TrainingProgram[]>()

    function handleDayToggle(day: string, active: boolean) {
        setWorkoutDays((prev) => {
            const newDays = active
                ? [...prev, day]
                : prev.filter((d) => d !== day)

            setProgram([
                { date: startOfToday().toISOString(), workoutDays: newDays },
            ])

            return newDays
        })
    }

    const handleConfirm = async () => {
        if (workoutDays.length === 0) {
            showAlert(
                'Error',
                'You should choose at least 1 workout day!',
                'error'
            )
            return
        }
        if (!program) {
            showAlert(
                'Error',
                'You should choose at least 1 workout day!',
                'error'
            )
            return

        }
        const workouts: string[] = []
        const data: AppData = {
            id: 1,
            programs: program,
            workouts: workouts,
        }

        try {
            console.log('trying to initialize data', data)
            await initData(db, data)
        } catch (err) {
            console.error('something went wrong while initializing app data', err)
            showAlert(
                'Error',
                'Something went wrong! Could not initialize user data, try again later',
                'error'
            )
        } finally {
            router.replace('/home')
        }
    }

    return (
        <View style={styles.container}>
            <Logo size={46} />
            <View style={{ alignItems: 'center' }}>
                <CustomText style={styles.header}>Program</CustomText>
                <CustomText style={styles.text}>Which Days will you go to gym?</CustomText>

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
                text="Confirm"
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
