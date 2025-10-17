import React, { createContext, useContext, useState, ReactNode } from 'react'
import CustomAlert from '@/components/CustomAlert'

export type AlertType = 'info' | 'warning' | 'error'

interface AlertData {
    title: string
    message: string
    type: AlertType
}

interface AlertContextType {
    showAlert: (title: string, message: string, type?: AlertType) => void
    hideAlert: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [alert, setAlert] = useState<AlertData | null>(null)

    const showAlert = (
        title: string,
        message: string,
        type: AlertType = 'info'
    ) => {
        setAlert({ title, message, type })
    }

    const hideAlert = () => setAlert(null)

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            {alert && (
                <CustomAlert
                    visible
                    title={alert.title}
                    message={alert.message}
                    onClose={hideAlert}
                    type={alert.type}
                />
            )}
        </AlertContext.Provider>
    )
}

export function useAlert(): AlertContextType {
    const context = useContext(AlertContext)
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider')
    }
    return context
}
