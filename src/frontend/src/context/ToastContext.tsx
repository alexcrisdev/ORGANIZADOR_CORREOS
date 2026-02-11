import React, {createContext, useState, useCallback} from "react";

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: number
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    showToast: (mesage: string, type: ToastType, duration?: number) => void
    removeToast: (id: number) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const [nextId, setNextId] = useState(1)

    const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
        const id = nextId
        setNextId(prev => prev + 1)

        const toast: Toast = {id, message, type, duration}
        setToasts(prev => [...prev, toast])

        //Auto-remover después del duration
        if(duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }, [nextId])

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast}}>
            {children}
        </ToastContext.Provider>
    )
}