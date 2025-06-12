import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IntegrationCard } from './integration_card';
import { SkeletonList } from './skeleton_list';
import { ErrorMessage } from './error_message';
import { fetchIntegrations } from '../../utils';
import { useEffect } from 'react';

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

  if (isLoading) return <SkeletonList count={6} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.key} summary={integration} />
      ))}
    </div>
  );
}
