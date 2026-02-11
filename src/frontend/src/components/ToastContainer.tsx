import { useToast } from "../hooks/useToast";
import '../styles/toast.css'

export function ToastContainer() {
    const {toasts, removeToast} = useToast()

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast--${toast.type}`}
                    role="alert"
                >
                    <div className="toast__content">
                        <span className="toast__icon">
                            {toast.type === 'success' && '✓'}
                            {toast.type === 'error' && '✗'}
                            {toast.type === 'warning' && '⚠'}
                            {toast.type === 'info' && 'ℹ'}
                        </span>
                        <span className="toast__message">{toast.message}</span>
                    </div>
                    <button
                        className="toast__close"
                        onClick={() => removeToast(toast.id)}
                        aria-label="Cerrar notificación"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    )
}