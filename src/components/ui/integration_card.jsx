import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useModal } from '../../context/modal_context';
import { AuthModal } from '../auth/auth_modal';
import { fetchIntegrationDetails, archiveConnection } from '../../utils';
import { SkeletonList } from './skeleton_list';
import { Badge } from './badge';
import { Button } from './button';

export function IntegrationCard({ summary }) {
    const { showModal, closeModal } = useModal();
    const queryClient = useQueryClient();

    const isDetailsLoaded = summary?.dataCollectionsCount !== undefined; // or any other field only available in full details

    const { data: details, isLoading } = useQuery({
        queryKey: ['integration-details', summary.id],
        queryFn: () => fetchIntegrationDetails(summary.id),
        enabled: !isDetailsLoaded, // 🔒 only fetch if details are missing
    });



    const mutation = useMutation({
        mutationFn: archiveConnection,
        onSuccess: () => queryClient.invalidateQueries(['integration-details', summary.id]),
    });

    const onClose = (refresh = false) => {
        closeModal();
        if (refresh) {
            queryClient.invalidateQueries(['integration-details', summary.id]);
            queryClient.setQueryData(['integration-summaries'], old =>
                old?.map(item => item.id === summary.id ? { ...item, state: 'READY' } : item)
            ); // 🔄 update the summary to show the new state
        }
    };

    if (isLoading) return <SkeletonList count={1} />;

    const integration = isDetailsLoaded ? summary : { ...summary, ...details };

    return (
        <div className="p-5 border rounded-lg bg-white flex flex-col">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {integration.logoUri ? (
                            <img src={integration.logoUri} alt="" className="size-full object-cover" />
                        ) : (
                            <span role="img" aria-label="plugin" className="text-gray-400">🔌</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium text-lg">{integration.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className={`size-2 rounded-full ${integration.state === 'READY' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <span className="text-xs text-gray-500">{integration.state}</span>
                        </div>
                    </div>
                </div>
                {integration.connection ? (
                    <div className="flex flex-col items-end">
                        <span className={`text-sm px-2 py-1 rounded-full ${integration.connection.state === 'READY' ? 'bg-green-100 text-green-800' : integration.connection.state === 'ERROR' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {integration.connection.state}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                            Last active: {integration.connection?.lastActiveAt ? new Date(integration.connection.lastActiveAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <Button
                            variant="destructive"
                            className="text-xs px-2 py-1 mt-2"
                            onClick={() => mutation.mutate(integration.connection.id)}
                        >
                            Disconnect
                        </Button>
                    </div>
                ) : (
                    <Button
                        className="text-sm px-3 py-1.5"
                        onClick={() =>
                            showModal(<AuthModal integration_name={integration.key} integration_logo={integration.logoUri} onClose={onClose} />)
                        }
                    >
                        Connect
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 mt-2 text-sm">
                <div><span className="text-gray-500">Auth Type:</span> <span className="font-medium capitalize">{integration.authType || 'Unknown'}</span></div>
                <div><span className="text-gray-500">Version:</span> <span className="font-medium">{integration.connectorVersion || 'N/A'}</span></div>
                <div><span className="text-gray-500">Data Collections:</span> <span className="font-medium">{integration.dataCollectionsCount || 0}</span></div>
                <div><span className="text-gray-500">Operations:</span> <span className="font-medium">{integration.operationsCount || 0}</span></div>
                <div><span className="text-gray-500">Events:</span> <span className="font-medium">{integration.eventsCount || 0}</span></div>
                <div><span className="text-gray-500">ID:</span> <span className="font-medium text-xs text-gray-600">{integration.id}</span></div>
                {integration.connection && <div><span className="text-gray-500">Connection ID:</span> <span className="font-medium text-xs text-gray-600">{integration.connection.id}</span></div>}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
                {integration.hasDocumentation && <Badge color="blue">Documentation</Badge>}
                {integration.hasUdm && <Badge color="purple">UDM</Badge>}
                {integration.hasEvents && <Badge color="amber">Events</Badge>}
                {integration.hasGlobalWebhooks && <Badge color="pink">Webhooks</Badge>}
                {integration.connection && <Badge color="green">Connected</Badge>}
            </div>
        </div>
    );
}