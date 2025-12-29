import { View, StyleSheet, useColorScheme } from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import Logo from '@/components/Logo'
import CustomButton from '@/components/CustomButton'
import { useState } from 'react'
import DayButton from '@/components/DayButton'
import { useRouter } from 'expo-router'
import { useAlert } from '@/context/AlertContext'
import {
    initData,
    Session,
    TrainingProgram,
} from '@/api/api'
import { startOfToday } from 'date-fns'
import CustomText from '@/components/CustomText'
import { useSQLiteContext } from 'expo-sqlite'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SessionModal from '@/components/SessionModal'

export default function Program() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const router = useRouter()
    const db = useSQLiteContext()
    const { showAlert } = useAlert()

    const [trainingProgram, setTrainingProgram] = useState<TrainingProgram>({
        date: startOfToday().toISOString(),
        sessions: [],
    })
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

    const [activeDay, setActiveDay] = useState<string | null>(null)

    const handleSaveSession = (session: Session) => {
        setTrainingProgram((prev) => {
            const existingIndex = prev.sessions.findIndex(
                (s) => s.day === session.day
            )

            if (existingIndex >= 0) {
                const updated = [...prev.sessions]
                updated[existingIndex] = session
                return { ...prev, sessions: updated }
            }

            return {
                ...prev,
                sessions: [...prev.sessions, session],
            }
        })
    }

    const handleDeleteSession = (session: Session) => {
        setTrainingProgram((prev) => {
            return {
                ...prev,
                sessions: prev.sessions.filter((s: Session) => s.day !== session.day),
            }
        })
    }

    const handleSaveTrainingProgram = async () => {
        if (trainingProgram.sessions.length === 0) {
            showAlert(
                'Invalid Training Program',
                'You should choose at least 1 workout day!',
                'error'
            )
            return
        }

        try {
            const appData = { id: Date.now(), programs: [trainingProgram], workouts: [] }
            await initData(db, appData)
            AsyncStorage.setItem('setup_done', 'true')
        } catch (err) {
            console.error('there has been error while saving program', err)
            showAlert(
                'error',
                'Something went wrong! Could not save new program',
                'error'
            )
            return
        } finally {
            router.replace('/home')
        }
    }

    return (
        <View>
            <View style={styles.container}>
                <Logo size={46} />
                <View style={{ alignItems: 'center' }}>
                    <CustomText style={styles.header}>Program</CustomText>
                    <CustomText style={styles.text}>
                        Which Days will you go to gym?
                    </CustomText>

                    <View style={styles.buttonContainer}>
                        {days.map((day) => (
                            <DayButton
                                key={day}
                                text={day}
                                active={trainingProgram.sessions.some(
                                    (session) => session.day === day
                                )}
                                onPress={() => setActiveDay(day)}
                            />
                        ))}
                    </View>
                </View>

                <CustomButton
                    text="Save"
                    onPress={handleSaveTrainingProgram}
                    size={24}
                />
            </View>
            {activeDay && (
                <SessionModal
                    visible
                    day={activeDay}
                    session={trainingProgram.sessions.find(
                        (s) => s.day === activeDay
                    )}
                    onClose={() => setActiveDay(null)}
                    onSave={handleSaveSession}
                    onDelete={handleDeleteSession}
                />
            )}
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
