import { Modal } from '../ui/modal';
import { AuthForm } from './auth_form';
import { useAuthConfig } from '../../hooks/use_auth_config';
import { useEffect } from 'react';

export function AuthModal({ integration_name, integration_logo, onClose }) {
    const { authConfig, loading, error } = useAuthConfig(integration_name, onClose);
    useEffect(() => {
        const handleMessage = (event) => {
            let status = "error"
            let error_message = "Unknown error";
            if (event.origin === "https://api.integration.app") {
                status = event.data.connection.state === "READY" ? "success" : "error";
            } else {
                status = event.data.status;
                error_message = event.data.error_message || "Unknown error";
            }

            console.log("Auth response received:", status, error_message);

            if (status === "success") {
                onClose(true);
            } else {
                alert("Authentication failed: " + error_message);
            }

        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [onClose]);
    return <Modal isOpen={true} onClose={onClose}>
        {integration_logo && (
            <img
                src={integration_logo}
                alt={`${integration_name} logo`}
                className="h-12 w-auto mx-auto mb-4"
            />
        )}
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
            Connect to <span className="capitalize">{integration_name}</span>
        </h2>

        {loading && <div className="text-gray-600">Loading authorization details...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {authConfig && <AuthForm authConfig={authConfig} onClose={onClose} />}
    </Modal>
}
