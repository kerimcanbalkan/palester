import { colorType, lightColors, darkColors } from '@/theme/colors'
import {
    View,
    StyleSheet,
    ViewStyle,
    useColorScheme,
    TextStyle,
} from 'react-native'
import { add, isSameYear, format } from 'date-fns'
import Box from './Box'
import { AppData } from '@/api/api'
import AntDesign from '@expo/vector-icons/AntDesign'
import CustomText from '@/components/CustomText'
import WorkoutModal from '../WorkoutModal'
import { useTranslation } from '@/localization/useTranslation'
import { useCalendar } from './use-calendar'

interface calendarProps {
    data: AppData
}

export default function Calendar({ data }: calendarProps) {
    const { t } = useTranslation()
    const {
        getBoxVariant,
        month,
        setMonth,
        currentLocale,
        today,
        days,
        handleBoxPress,
        weekDays,
        activeWorkout,
        setWorkoutModal,
        workoutModal,
        setActiveWorkout,
    } = useCalendar({ data })

    const colorscheme = useColorScheme()
    const colors = colorscheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    return (
        <View style={styles.container}>
            <View style={styles.monthContainer}>
                <AntDesign
                    name="left"
                    size={24}
                    color={colors.fg}
                    onPress={() => {
                        setMonth(add(month, { months: -1 }))
                    }}
                />

                <View
                    style={{
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CustomText style={styles.text}>
                        {format(month, 'MMMM', { locale: currentLocale })}
                    </CustomText>
                    {!isSameYear(today, month) && (
                        <CustomText style={{ fontSize: 16, color: colors.fg }}>
                            {format(month, 'yyyy', { locale: currentLocale })}
                        </CustomText>
                    )}
                </View>
                <AntDesign
                    name="right"
                    size={24}
                    color={colors.fg}
                    onPress={() => {
                        setMonth(add(month, { months: 1 }))
                    }}
                />
            </View>

            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <View style={styles.weekContainer}>
                    {weekDays.map((day, i) => (
                        <CustomText key={i} style={styles.weekCustomText}>
                            {day}
                        </CustomText>
                    ))}
                </View>

                <View style={styles.datesContainer}>
                    {days.map((day, i) => {
                        // Determine variant for current month days
                        const variant = getBoxVariant(day)
                        return (
                            <Box
                                key={i}
                                date={day}
                                variant={variant}
                                onPress={handleBoxPress}
                            />
                        )
                    })}
                </View>
            </View>
            <View style={styles.legendContainer}>
                <View style={styles.legend}>
                    <CustomText
                        style={[
                            styles.legendBox,
                            { backgroundColor: colors.green },
                        ]}
                    >
                        {' '}
                    </CustomText>
                    <CustomText style={{ color: colors.fg }}>
                        {t('workoutSummary.done')}
                    </CustomText>
                </View>
                <View style={styles.legend}>
                    <CustomText
                        style={[
                            styles.legendBox,
                            { backgroundColor: colors.darkGreen },
                        ]}
                    >
                        {' '}
                    </CustomText>
                    <CustomText style={{ color: colors.fg }}>
                        {t('workoutSummary.rest')}
                    </CustomText>
                </View>
                <View style={styles.legend}>
                    <CustomText
                        style={[
                            styles.legendBox,
                            { backgroundColor: colors.red },
                        ]}
                    >
                        {' '}
                    </CustomText>
                    <CustomText style={{ color: colors.fg }}>
                        {t('workoutSummary.missed')}
                    </CustomText>
                </View>
            </View>
            {activeWorkout && (
                <WorkoutModal
                    visible={workoutModal}
                    onClose={() => {
                        setWorkoutModal(false)
                        setActiveWorkout(null)
                    }}
                    workout={activeWorkout}
                />
            )}
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        },

        weekContainer: {
            flexDirection: 'row',
            width: 8.3 * 30 + 6 * 10, // same width with dates
            justifyContent: 'space-between',
            marginTop: 25,
            gap: 10,
        },

        weekCustomText: {
            color: colors.fg,
            textTransform: 'uppercase',
            fontFamily: 'OpenSans_400Regular',
            fontSize: 14,
        } as TextStyle,

        monthContainer: {
            paddingHorizontal: 40,
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
        } as ViewStyle,

        datesContainer: {
            marginTop: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            width: 8.3 * 30 + 6 * 10, // tring to implement 7 items by row grid
            gap: 10,
            paddingVertical: 10,
        },

        text: {
            color: colors.fg,
            fontFamily: 'OpenSans_400Regular',
            overflow: 'visible',
            textTransform: 'uppercase',
            fontSize: 18,
        } as TextStyle,

        legendBox: {
            borderRadius: 5,
            aspectRatio: 1,
            width: 15,
            height: 15,
        },

        legendContainer: {
            flexDirection: 'row',
            gap: 20,
            width: '100%',
            marginTop: 10,
        },

        legend: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
        },
    })
}
