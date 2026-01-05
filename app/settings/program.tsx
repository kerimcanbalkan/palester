import { View, StyleSheet, useColorScheme } from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import Logo from '@/components/Logo'
import CustomButton from '@/components/CustomButton'
import { useEffect, useState } from 'react'
import DayButton from '@/components/DayButton'
import { useRouter } from 'expo-router'
import { useAlert } from '@/context/AlertContext'
import { addProgram, getData, Session, TrainingProgram } from '@/api/api'
import CustomText from '@/components/CustomText'
import { useSQLiteContext } from 'expo-sqlite'
import SessionModal from '@/components/SessionModal'
import Loading from '@/components/Loading'
import { useTranslation } from '@/localization/useTranslation'
import { enUS, tr, sq } from 'date-fns/locale'
import {
    startOfToday,
    eachDayOfInterval,
    format,
    startOfWeek,
    endOfWeek,
} from 'date-fns'
import i18n from '@/localization/i18n'

export default function Program() {
    const { t } = useTranslation()
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
    const localeMapping = {
        en: enUS,
        tr: tr,
        sq: sq,
    }
    const currentLocale =
        localeMapping[i18n.locale as keyof typeof localeMapping] || enUS

    const today = startOfToday()
    const days = eachDayOfInterval({
        start: startOfWeek(today, { locale: currentLocale }),
        end: endOfWeek(today, { locale: currentLocale }),
    }).map((day) => format(day, 'EEE').toLowerCase())

    const daysLocale = eachDayOfInterval({
        start: startOfWeek(today, { locale: currentLocale }),
        end: endOfWeek(today, { locale: currentLocale }),
    }).map((day) => format(day, 'EEE', { locale: currentLocale }))

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

    const handleDeleteSession = (session: Session) => {
        setTrainingProgram((prev) => {
            return {
                ...prev,
                sessions: prev.sessions.filter(
                    (s: Session) => s.day !== session.day
                ),
            }
        })
    }

    const handleSaveTrainingProgram = async () => {
        if (trainingProgram.sessions.length === 0) {
            showAlert(
                t('program.error.invalidTrainingProgram.title'),
                t('program.error.invalidTrainingProgram.message'),
                'error'
            )
            return
        }

        try {
            await addProgram(db, trainingProgram)
        } catch (err) {
            console.error('there has been error while saving program', err)
            showAlert(
                t('program.error.couldNotSave.title'),
                t('program.error.couldNotSave.message'),
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
                        {t('error.somethingWentWrong')}
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
                    <CustomText style={styles.header}>
                        {t('program.title')}
                    </CustomText>
                    <CustomText style={styles.text}>
                        {t('program.question')}
                    </CustomText>

                    <View style={styles.buttonContainer}>
                        {days.map((day, i) => (
                            <DayButton
                                key={day}
                                text={daysLocale[i]}
                                active={trainingProgram.sessions.some(
                                    (session) => session.day === day
                                )}
                                onPress={() => setActiveDay(day)}
                            />
                        ))}
                    </View>
                </View>

                <CustomButton
                    text={t('common.save')}
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
