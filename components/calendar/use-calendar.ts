import {
    startOfToday,
    format,
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameDay,
    parse,
    isAfter,
    isSameMonth,
} from 'date-fns'
import { AppData, Workout } from '@/api/api'
import { Variant } from './Box'
import { enUS, tr, sq } from 'date-fns/locale'
import i18n from '@/localization/i18n'
import { useState, useEffect } from 'react'

interface UseCalendarProps {
    data: AppData
}

export function useCalendar({ data }: UseCalendarProps) {
    const localeMapping = {
        en: enUS,
        tr: tr,
        sq: sq,
    }
    const currentLocale =
        localeMapping[i18n.locale as keyof typeof localeMapping] || enUS

    const today = startOfToday()
    const [month, setMonth] = useState(startOfMonth(today))
    const [days, setDays] = useState(
        eachDayOfInterval({
            start: startOfWeek(startOfMonth(month), { locale: currentLocale }),
            end: endOfWeek(endOfMonth(month), { locale: currentLocale }),
        })
    )
    const workouts = data.workouts
    const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null)
    const [workoutModal, setWorkoutModal] = useState(false)

    const handleBoxPress = (date: Date) => {
        const workout = workouts.find((w) => isSameDay(w.date, date))
        if (!workout) return
        setActiveWorkout(workout)
        setWorkoutModal(true)
    }

    useEffect(() => {
        const updatedDays = eachDayOfInterval({
            start: startOfWeek(startOfMonth(month), { locale: currentLocale }),
            end: endOfWeek(endOfMonth(month), { locale: currentLocale }),
        })
        setDays(updatedDays)
    }, [month])

    const weekDays = eachDayOfInterval({
        start: startOfWeek(today, { locale: currentLocale }),
        end: endOfWeek(today, { locale: currentLocale }),
    }).map((day) => format(day, 'EEE', { locale: currentLocale }))

    const getBoxVariant = (day: Date): Variant => {
        const isWorkoutDone = data?.workouts.some((w) =>
            isSameDay(day, parse(w.date, 'yyyy-MM-dd', new Date()))
        )

        // If date is in future
        if (isAfter(day, today)) {
            return Variant.future
        }

        // If workout is done.
        if (isWorkoutDone) {
            return isSameMonth(day, month)
                ? Variant.completed
                : Variant.oldCompleted
        }

        return Variant.regular
    }

    return {
        getBoxVariant,
        month,
        setMonth,
        currentLocale,
        today,
        days,
        setDays,
        workouts,
        handleBoxPress,
        weekDays,
        activeWorkout,
        setWorkoutModal,
        workoutModal,
        setActiveWorkout,
    }
}
