import { Modal } from '../ui/modal';
import { AuthForm } from './auth_form';
import { useEffect, useState } from 'react';
import * as utils from '../../utils';

export function AuthModal({ integration_name, integration_logo, onClose, authConfig }) {
    const [overrideError, setOverrideError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const effectiveError = overrideError

    const openAuthWindowOrIframe = (authType, url) => {
        if (authType === 'credentials') {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            return { type: 'iframe', element: iframe };
        } else {
            const popup = window.open(
                url,
                'authWindow',
                'width=500,height=600,scrollbars=yes,resizable=yes'
            );
            return { type: 'popup', window_: popup };
        }
    };


    const handleFormSubmit = (formData) => {
        setIsSubmitting(true);
        setOverrideError(null);

        const { auth_method, auth_url } = authConfig;
        const url = new URL(auth_url);

        if (auth_method !== 'oauth2') {
            const connectionParameters = {};
            for (const { id } of authConfig.auth_params) {
                const value = formData[id];
                if (value !== null && value !== undefined) {
                    connectionParameters[id] = value;
                }
            }

            if (Object.keys(connectionParameters).length > 0) {
                url.searchParams.append(
                    'connectionParameters',
                    JSON.stringify(connectionParameters)
                );
            }
        }

        const { type, element, window_ } = openAuthWindowOrIframe(auth_method, url.toString());

        if (type === "popup") {
            if (!window_ || window_.closed || typeof window_.closed === 'undefined') {
                setOverrideError("Popup blocked or failed to open. Please allow popups for this site.");
                setIsSubmitting(false);
                return;
            }
        }
    };

    useEffect(() => {
        if (!authConfig || !isSubmitting) return;

        const pollInterval = 2000;
        let pollTimer = null;
        const requestId = new URL(authConfig.auth_url).searchParams.get('requestId');

        const checkAuthStatus = async () => {
            try {
                const data = await utils.fetchAuthStatus(integration_name, requestId);

                if (data.status === "success") {
                    onClose(true);
                    clearInterval(pollTimer);
                } else if (data.status === "error") {
                    setOverrideError("Authentication failed: " + data.error_message);
                    clearInterval(pollTimer);
                    setIsSubmitting(false);
                }
            } catch (error) {
                setOverrideError("Failed to check authentication status: " + error.message);
                clearInterval(pollTimer);
                setIsSubmitting(false);
            }
        };

        pollTimer = setInterval(checkAuthStatus, pollInterval);
        checkAuthStatus();

        return () => {
            if (pollTimer) {
                clearInterval(pollTimer);
            }
        };
    }, [integration_name, onClose, isSubmitting, authConfig]);

    return <Modal isOpen={true} onClose={() => onClose(false)}>
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


        {effectiveError && <div className="text-red-600">{effectiveError}</div>}
        {authConfig && (
            <AuthForm
                authConfig={authConfig}
                onClose={() => onClose(false)}
                onSubmit={handleFormSubmit}
                isLoading={isSubmitting}
            />
        )}
    </Modal>
}
