import { useEffect, useState } from 'react';
import { Button } from './button';

export function AuthPopup({ integration_name, onClose }) {
  const [authConfig, setAuthConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});


  const fetchAuthConfig = async () => {
    try {
      setLoading(true);
      // const res = await fetch(`/integrations/${integration_name}/authorization_begin`);
      // const res = await fetch(`https://run.mocky.io/v3/fabd110c-81d3-43e7-9ca6-5ced884642ee`);
      // if (!res.ok) throw new Error('Failed to fetch');
      // const data = await res.json();
      const data = {
        "auth_method": "oauth2+fields",
        "auth_params": [{
          "id": "api_key",
          "type": "string",
          "label": "API Key",
          "required": true
        }],
        "base_connection_url": "https://api.integration.app/connection-popup?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzliZjgwNjEwMDFhYzNiMjVjZDQ3ZCIsImlzcyI6ImMwZDhjM2EyLTg3ZTUtNGY4MS04N2YxLWYyOTY2MGU3Y2ZmNiIsImV4cCI6MTc4MDM5MzgwNn0.mzX2pCfndYobXoq9Ytzuk8xsWw3xtosMsqRt7eY2QuU&requestId=2&integrationKey=salesforce"
      }
      setAuthConfig(data);

    } catch (err) {
      setError('Failed to fetch authorization config.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = () => {
    if (!authConfig) return;

    const newErrors = {};
    authConfig.auth_params.forEach(({ id, label, required }) => {
      if (required && !formData[id]?.trim()) {
        newErrors[id] = `${label} is required`;
      }
    });

    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // If errors, do not proceed
      return;
    }

    // No errors, proceed with submission
    const { auth_method, base_connection_url } = authConfig;
    let url = base_connection_url;
    if (auth_method !== 'oauth2') {
      const url_constructor = new URL(base_connection_url);
      const connectionParameters = JSON.stringify(formData);
      url_constructor.searchParams.append("connectionParameters", connectionParameters);
      // window.location.href = url.toString();
      url = url_constructor.toString();
    }
    window.open(
      url.toString(),
      'authWindow',
      'width=500,height=600,noopener,noreferrer,scrollbars=yes,resizable=yes'
    );
  };



  useEffect(() => {
    fetchAuthConfig();
  }, [integration_name]);

  if (loading) return <div className="text-gray-600 p-4">Loading authorization details...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!authConfig) return null;

  const { auth_method, auth_params } = authConfig;

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Connect to <span className="capitalize">{integration_name}</span>
      </h2>



      {(auth_method === 'oauth2+fields' || auth_method === 'credentials') && (
        <div className="space-y-4">
          {auth_params.map(({ id, label, type, required }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input
                id={id}
                name={id}
                type={type || 'text'}
                value={formData[id] || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 
        ${fieldErrors[id] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                aria-invalid={fieldErrors[id] ? "true" : "false"}
                aria-describedby={fieldErrors[id] ? `${id}-error` : undefined}
              />
              {fieldErrors[id] && (
                <p id={`${id}-error`} className="text-red-600 text-sm mt-1">
                  {fieldErrors[id]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Button onClick={handleSubmit} className='text-sm px-3 py-1.5'>

        {auth_method?.startsWith('oauth2') ? 'Connect with OAuth' : 'Connect'}
      </Button>

    </div>
  );
}
