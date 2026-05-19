import { useState } from 'react'
import { Session, TrainingProgram } from '@/api/api'
import {
    startOfToday,
    eachDayOfInterval,
    format,
    startOfWeek,
    endOfWeek,
} from 'date-fns'
import { enUS, tr, sq } from 'date-fns/locale'
import i18n from '@/localization/i18n'

export function useProgram() {
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

    return {
        trainingProgram,
        setTrainingProgram,
        handleSaveSession,
        handleDeleteSession,
        days,
        daysLocale,
        activeDay,
        setActiveDay,
    }
}
