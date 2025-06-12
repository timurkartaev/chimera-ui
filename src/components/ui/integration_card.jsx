import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useModal } from '../../context/modal_context';
import { fetchIntegrationDetails, archiveConnection } from '../../utils';
import { AuthModal } from '../auth/auth_modal';
import { ToggleButton } from './toggle_button';
import { Badge } from './badge';

export function IntegrationCard({ summary }) {
    const queryClient = useQueryClient();
    const { showModal, closeModal } = useModal();

    const { data: details } = useQuery({
        queryKey: ['integration-details', summary.id],
        queryFn: () => fetchIntegrationDetails(summary.id),
        enabled: false,
    });

    const integration = { ...summary, ...details };

    const mutation = useMutation({
        mutationFn: archiveConnection,
        onSuccess: () => {
            queryClient.invalidateQueries(['integration-details', integration.id]);
            queryClient.setQueryData(['integration-summaries'], old =>
                old?.map(item =>
                    item.id === integration.id ? { ...item, state: 'READY', connection: null } : item
                )
            );
        },
    });

    const handleToggle = (on) => {
        if (on) {
            showModal(
                <AuthModal
                    integration_name={integration.key}
                    integration_logo={integration.logoUri}
                    onClose={(refresh) => {
                        closeModal();
                        if (refresh) {
                            queryClient.invalidateQueries(['integration-details', integration.id]);
                        }
                    }}
                />
            );
        } else {
            mutation.mutate(integration.connection.id);
        }
    };
    const connected = Boolean(integration.connection && !integration.connection.disconnected);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden mb-2">
                    {integration.logoUri ? (
                        <img src={integration.logoUri} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <span role="img" aria-label="plug" className="text-xl">🔌</span>
                    )}
                </div>
                <h3 className="text-md font-semibold text-center">{integration.name}</h3>
            </div>

            <div className="px-4 py-2 text-sm text-gray-700 grid grid-cols-2 gap-2">
                <div><strong>Auth:</strong> {integration.authType || 'N/A'}</div>
                <div><strong>Version:</strong> {integration.connectorVersion || 'N/A'}</div>
            </div>
            <div className="mt-auto px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    {integration?.connection?.lastActiveAt && (
                        <span>
                            Last active: <time dateTime={integration.connection.lastActiveAt}>
                                {new Date(integration.connection.lastActiveAt).toLocaleDateString()}
                            </time>
                        </span>
                    )}
                </div>
                <div className="ml-4">
                    <ToggleButton connected={connected} onToggle={handleToggle} />
                </div>
            </div>
        </div>
    );
}
