import { useState } from 'react'
import { Session } from '@/api/api'

export function useProgram() {
    const [sessions, setSessions] = useState<Session[]>([])

    const handleSaveSession = (session: Session) => {
        setSessions((prev) => {
            return {
                ...prev,
                session
            }
        })
    }

    const handleDeleteSession = (session: Session) => {
        setSessions((s) => {
            return s.filter((s: Session) => s === session)
            }
        )
    }

    return {
        sessions,
        setSessions,
        handleSaveSession,
        handleDeleteSession,
    }
}
