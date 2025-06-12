import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IntegrationCard } from './integration_card';
import { SkeletonCard } from './skeleton_card';
import { ErrorMessage } from './error_message';
import { fetchIntegrations } from '../../utils';
import { useEffect } from 'react';

function SkeletonList({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

export function IntegrationList() {
  const queryClient = useQueryClient();

  const {
    data: integrations,
    isLoading,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ['integration-summaries'],
    queryFn: fetchIntegrations,
    select: (res) => res.response.items,
  });

  useEffect(() => {
    if (isSuccess && integrations) {
      integrations.forEach((integration) => {
        queryClient.setQueryData(['integration-details', integration.key], { integration: integration });
      });
    }
  }, [isSuccess, integrations, queryClient]);

  if (isLoading) return <SkeletonList count={20} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.key} summary={integration} />
      ))}
    </div>
  );
}
