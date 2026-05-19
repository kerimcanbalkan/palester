import { View, StyleSheet, useColorScheme } from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import Logo from '@/components/Logo'
import CustomButton from '@/components/CustomButton'
import DayButton from '@/components/DayButton'
import { useRouter } from 'expo-router'
import { useAlert } from '@/context/AlertContext'
import { initData } from '@/api/api'
import CustomText from '@/components/CustomText'
import { useSQLiteContext } from 'expo-sqlite'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SessionModal from '@/components/SessionModal'
import { useTranslation } from '@/localization/useTranslation'
import { useProgram } from '@/lib/hooks/use-program'

export default function Program() {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const router = useRouter()
    const db = useSQLiteContext()
    const { showAlert } = useAlert()
    const {
        trainingProgram,
        handleSaveSession,
        handleDeleteSession,
        daysLocale,
        days,
        activeDay,
        setActiveDay,
    } = useProgram()

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
            const appData = {
                id: Date.now(),
                programs: [trainingProgram],
                workouts: [],
            }
            await initData(db, appData)
            AsyncStorage.setItem('setup_done', 'true')
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
