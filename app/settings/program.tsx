import { View, StyleSheet, useColorScheme } from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import Logo from '@/components/Logo'
import CustomButton from '@/components/CustomButton'
import { useEffect, useState } from 'react'
import DayButton from '@/components/DayButton'
import { useRouter } from 'expo-router'
import { useAlert } from '@/context/AlertContext'
import {
    addProgram,
    getData,
    Session,
    TrainingProgram,
} from '@/api/api'
import { startOfToday } from 'date-fns'
import CustomText from '@/components/CustomText'
import { useSQLiteContext } from 'expo-sqlite'
import SessionModal from '@/components/SessionModal'
import Loading from '@/components/Loading'

export default function Program() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const router = useRouter()
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const db = useSQLiteContext()
    const { showAlert } = useAlert()

    const [trainingProgram, setTrainingProgram] = useState<TrainingProgram>({
        date: startOfToday().toISOString(),
        sessions: [],
    })
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

    const [activeDay, setActiveDay] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            const data = await getData(db)
            return data
        } catch (error) {
            throw new Error(`Failed to fetch app data: ${error}`)
        }
    }

    useEffect(() => {
        const getUserData = async () => {
            setLoading(true)
            setError(false)
            try {
                const appData = await fetchData()
                if (!appData) return
                setTrainingProgram(
                    appData?.programs[appData.programs.length - 1]
                )
            } catch (error) {
                setError(true)
                console.error('Error getting user data: ', error)
            } finally {
                setLoading(false)
            }
        }

        getUserData()
    }, [])

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
            await addProgram(db, trainingProgram)
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

    if (loading) {
        return <Loading />
    }

    if (error) {
        return (
            <View
                style={{
                    paddingHorizontal: 5,
                    alignContent: 'center',
                    justifyContent: 'center',
                }}
            >
                <View>
                    <CustomText
                        style={{
                            fontSize: 120,
                            textAlign: 'center',
                            textOverflow: 'visible',
                            color: colors.fg,
                        }}
                    >
                        ⚠︎
                    </CustomText>
                    <CustomText
                        style={{
                            fontSize: 24,
                            textOverflow: 'visible',
                            textAlign: 'center',
                            color: colors.fg,
                        }}
                    >
                        Opps! Something wen't wrong. Try again later.
                    </CustomText>
                </View>
            </View>
        )
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
