import { Modal } from '../ui/modal';
import { AuthForm } from './auth_form';
import { useAuthConfig } from '../../hooks/use_auth_config';
import { useEffect } from 'react';

export function AuthModal({ integration_name, integration_logo, onClose }) {
    const { authConfig, loading, error } = useAuthConfig(integration_name, onClose);
    useEffect(() => {
        function handleMessage(event) {
            // Optionally check event.origin here for security

            if (event.data?.type === "authSuccess") {
                console.log("Authentication succeeded with state:", event.data.state);
                // Call your close modal handler or update state
                onClose();
            }
        }

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
        {authConfig && <AuthForm authConfig={authConfig} onClose={onClose}/>}
    </Modal>
}
