import { colorType, lightColors, darkColors } from '@/theme/colors'
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
    useColorScheme,
    TextStyle,
    Pressable,
} from 'react-native'
import {
    startOfToday,
    add,
    isToday,
    isAfter,
    isSameYear,
    format,
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isBefore,
    isSameDay,
    isSameMonth,
    parseISO,
} from 'date-fns'
import Box from './Box'
import { useState, useEffect } from 'react'
import { AppData } from '@/api/api'

interface calendarProps {
    data: AppData
}

export default function Calendar({ data }: calendarProps) {
    const today = startOfToday()
    const [month, setMonth] = useState(startOfMonth(today))
    const [days, setDays] = useState(
        eachDayOfInterval({
            start: startOfWeek(startOfMonth(month)),
            end: endOfWeek(endOfMonth(month)),
        })
    )

    useEffect(() => {
        const updatedDays = eachDayOfInterval({
            start: startOfWeek(startOfMonth(month)),
            end: endOfWeek(endOfMonth(month)),
        })
        setDays(updatedDays)
    }, [month])

    const weekDays = eachDayOfInterval({
        start: startOfWeek(today),
        end: endOfWeek(today),
    }).map((day) => format(day, 'EEE'))

    const colorscheme = useColorScheme()
    const colors = colorscheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    return (
        <View style={styles.container}>
            <View style={styles.monthContainer}>
                <Pressable
                    onPress={() => {
                        setMonth(add(month, { months: -1 }))
                    }}
                >
                    <Text style={styles.text}>{'<'}</Text>
                </Pressable>

                <View
                    style={{
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={styles.text}>{format(month, 'MMMM')}</Text>
                    {!isSameYear(today, month) && (
                        <Text style={{ fontSize: 16, color: colors.fg }}>
                            {format(month, 'yyyy')}
                        </Text>
                    )}
                </View>

                <Pressable
                    onPress={() => {
                        setMonth(add(month, { months: 1 }))
                    }}
                >
                    <Text style={styles.text}>{'>'}</Text>
                </Pressable>
            </View>

            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <View style={styles.weekContainer}>
                    {weekDays.map((day, i) => (
                        <Text key={i} style={styles.weekText}>
                            {day}
                        </Text>
                    ))}
                </View>

                <View style={styles.datesContainer}>
                    {days.map((day, i) => {
                        // Determine variant for current month days
                        let variant:
                            | 'today'
                            | 'future'
                            | 'completed'
                            | 'rest'
                            | 'regular'
                            | 'oldCompleted'
                            | 'oldRest'
                            | 'oldMissed'
                            | 'missed' = 'regular'

                        if (isBefore(day, today) || isToday(day)) {
                            const dayName = format(
                                day,
                                'EEE'
                            ).toLocaleLowerCase()
                            const isWorkoutDay =
                                data?.workoutDays.includes(dayName)
                            const isWorkoutDone = data?.workouts.some((w) =>
                                isSameDay(day, parseISO(w))
                            )

                            if (isWorkoutDone) {
                                variant = isSameMonth(day, month)
                                    ? 'completed'
                                    : 'oldCompleted'
                            } else if (isWorkoutDay) {
                                variant = isSameMonth(day, month)
                                    ? 'missed'
                                    : 'oldMissed'
                            } else {
                                variant = isSameMonth(day, month)
                                    ? 'rest'
                                    : 'oldRest'
                            }

                            data?.workouts.forEach((w) => {
                                if (
                                    isSameDay(day, parseISO(w)) &&
                                    isSameMonth(day, month)
                                ) {
                                    variant = 'completed'
                                } else if (
                                    isSameDay(day, parseISO(w)) &&
                                    !isSameMonth(day, month)
                                ) {
                                    variant = 'oldCompleted'
                                }
                            })
                        }

                        if (isAfter(day, today) && isSameMonth(day, month)) {
                            variant = 'future'
                        } else if (
                            isBefore(day, parseISO(data?.appStartDate))
                        ) {
                            variant = 'regular'
                        }

                        return <Box key={i} date={day} variant={variant} />
                    })}
                </View>
            </View>
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

        weekText: {
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
    })
}
