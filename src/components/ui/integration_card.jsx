import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useModal } from '../../context/modal_context';
import { fetchIntegrationConnection, disconnectConnection } from '../../utils';
import { AuthModal } from '../auth/auth_modal';
import { ToggleButton } from './toggle_button';
import { CardLayout } from './card_layout';
import { fetchAuthConfig } from '../../utils';

export function IntegrationCard({ summary }) {
    const queryClient = useQueryClient();
    const { showModal, closeModal } = useModal();

    const { data: connection, isLoading: isLoadingConnection } = useQuery({
        queryKey: ['integration-connection', summary.key],
        queryFn: () => fetchIntegrationConnection(summary.key),
        select: (data) => {
            return data.connection;
        }
    });

    const integration = { ...summary };

    const mutation = useMutation({
        mutationFn: ({ integrationKey, connectionId }) => disconnectConnection(integrationKey, connectionId),
        onSuccess: () => {
            queryClient.invalidateQueries(['integration-connection', summary.key]);
        },
    });

    const handleToggle = (on) => {
        if (on) {
            showModal(
                async () => {
                    const authConfig = await fetchAuthConfig(integration.key);
                    return (
                        <AuthModal
                            integration_name={integration.key}
                            integration_logo={integration.logo}
                            authConfig={authConfig}
                            onClose={(refresh) => {
                                closeModal();
                                if (refresh) {
                                    queryClient.invalidateQueries(['integration-connection', summary.key]);
                                }
                            }}
                        />
                    )
                }

            );
        } else {
            if (connection?.id) {
                mutation.mutate({
                    integrationKey: integration.key,
                    connectionId: connection.id,
                }); // ✅ Use connection ID
            } else {
                console.warn('No connection found to archive');
            }
        }
    };

    const connected = Boolean(connection && !connection.disconnected);

    return (
        <CardLayout
            logo={
                integration.logo ? (
                    <img src={integration.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                    <span role="img" aria-label="plug" className="text-xl">🔌</span>
                )
            }
            name={integration.name}
            metaLeft={<><strong>Auth:</strong> {integration.auth_type || 'N/A'}</>}
            metaRight={<><strong>Version:</strong> {integration.version || 'N/A'}</>}
            footerLeft={
                isLoadingConnection ? (
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                ) : connection?.last_active_at && (
                    <span className="h-4">
                        Last active:{' '}
                        <time dateTime={connection.last_active_at}>
                            {new Date(connection.last_active_at).toLocaleDateString()}
                        </time>
                    </span>
                )
            }
            footerRight={
                isLoadingConnection ? (
                    <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse" />
                ) : (
                    <ToggleButton connected={connected} onToggle={handleToggle} />
                )
            }
        />
    );
}
