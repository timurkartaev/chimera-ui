import { useEffect, useState } from 'react';
import * as utils from '../utils';

export function useAuthConfig(integration_name, onSuccess) {
  const [authConfig, setAuthConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthConfig = async () => {
      try {
        const config = await utils.fetchAuthConfig(integration_name);
        const url = new URL(config.base_connection_url);
        config.requestId = url.searchParams.get('requestId');
        setAuthConfig(config);
      } catch (err) {
        setError('Failed to fetch authorization config.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthConfig();
  }, [integration_name]);

  return { authConfig, loading, error };
}
