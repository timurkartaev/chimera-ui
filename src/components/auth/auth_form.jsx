import { useState } from 'react';
import { Button } from '../ui/button';
import { FormInput } from '../ui/form_input';


export function AuthForm({ authConfig, onClose }) {
    const [formData, setFormData] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

    const openAuthWindowOrIframe = (authType, url) => {
        if (authType === 'credentials') {
            // Create hidden iframe to load the URL silently
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);

            // Optionally, you might want to clean it up later
            // For example, after some timeout or when auth finishes:
            // document.body.removeChild(iframe);
            return { type: 'iframe', element: iframe };
        } else {
            // Open popup window for visible auth flow
            const popup = window.open(
                url,
                'authWindow',
                'width=500,height=600,scrollbars=yes,resizable=yes'
            );
            return { type: 'popup', window_: popup };
        }
    }

    const handleSubmit = () => {
        const { auth_method, base_connection_url, auth_params } = authConfig;

        // Validate required fields
        const newErrors = {};
        for (const { id, label, required } of auth_params) {
            const value = formData[id];
            if (required && !value?.toString().trim()) {
                newErrors[id] = `${label} is required`;
            }
        }

        setFieldErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        // Construct connection URL
        const url = new URL(base_connection_url);

        if (auth_method !== 'oauth2') {
            const connectionParameters = {};

            for (const { id } of auth_params) {
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

        const { type, element, window_ } = openAuthWindowOrIframe(authConfig.auth_method, url.toString());

        if (type === "popup") {
            console.log("Popup opened:", window_);
            if (!window_ || window_.closed || typeof window_.closed === 'undefined') {
                alert("Popup blocked or failed to open. Please allow popups for this site.");
                return;
            }
            // add a listener that tracks when popup closes
            window_.focus()
            const interval = setInterval(() => {
                if (window_.closed) {
                    clearInterval(interval);
                    console.log("Popup closed");
                    onClose()
                    // Optionally, you can handle post-auth logic here
                }
            }, 500);


        } else {
            console.log("Authentication started in iframe:", element);
            onClose();
        }
    };


    return (
        <div className="space-y-6">
            {authConfig.auth_params.map(({ id, label, type, required }) => (
                <FormInput
                    key={id}
                    id={id}
                    label={label}
                    type={type}
                    required={required}
                    value={formData[id]}
                    onChange={(fieldId, newValue) => {
                        setFormData((prev) => ({ ...prev, [fieldId]: newValue }));
                    }}
                    error={fieldErrors[id]}
                />
            ))}

            <Button onClick={handleSubmit} className="text-sm px-3 py-1.5">
                {authConfig.auth_method?.startsWith('oauth2') ? 'Connect with OAuth' : 'Connect'}
            </Button>
        </div>
    );
}
