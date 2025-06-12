import { useQuery } from '@tanstack/react-query';
import { IntegrationCard } from './integration_card';
import { SkeletonList } from './skeleton_list';
import { ErrorMessage } from './error_message';
import { fetchIntegrations } from '../../utils';

export function IntegrationList() {
  const {
    data: integrations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['integration-summaries'],
    queryFn: fetchIntegrations,
    select: (res) => res.response.items,
  });

  if (isLoading) return <SkeletonList count={6} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="grid gap-4">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.id} summary={integration} />
      ))}
    </div>
  );
}