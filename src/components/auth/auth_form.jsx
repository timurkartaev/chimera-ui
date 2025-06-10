import { useState } from 'react';
import { Button } from '../ui/button';
import { FormInput } from '../ui/form_input';

export function AuthForm({ authConfig, onClose, onSubmit, isLoading }) {
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
        // Validate required fields
        const newErrors = {};
        for (const { id, label, required } of authConfig.auth_params) {
            const value = formData[id];
            if (required && !value?.toString().trim()) {
                newErrors[id] = `${label} is required`;
            }
        }

        setFieldErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        onSubmit(formData);
    };

    return (
        <div className="space-y-6">
            {authConfig.auth_params.map(({ id, label, type, required, default: defaultValue }) => (
                <FormInput
                    key={id}
                    id={id}
                    label={label}
                    type={type}
                    required={required}
                    value={formData[id] || defaultValue}
                    onChange={(fieldId, newValue) => {
                        setFormData((prev) => ({ ...prev, [fieldId]: newValue }));
                    }}
                    error={fieldErrors[id]}
                />
            ))}

            <div className="flex justify-between">
                <Button 
                    onClick={handleSubmit} 
                    className="text-sm px-3 py-1.5"
                    disabled={isLoading}
                >
                    {isLoading ? 'Connecting...' : 
                        authConfig.auth_method?.startsWith('oauth2') ? 'Connect with OAuth' : 'Connect'
                    }
                </Button>
                <Button 
                    onClick={onClose} 
                    className="text-sm px-3 py-1.5" 
                    variant="secondary"
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}
