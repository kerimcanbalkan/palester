import { ErrorInfo } from 'react'
import React from 'react'

interface Props {
    children: React.ReactNode
    fallback: React.ReactNode
}

interface State {
    hasError: boolean
}

class AppErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    state = { hasError: false }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error: ', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback
        } else {
            return this.props.children
        }
    }
}

export default AppErrorBoundary
