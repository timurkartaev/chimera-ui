import { Button } from './button';
import { useModal } from '../../context/modal_context';
import { AuthModal } from '../auth/auth_modal';



export function IntegrationCard({ integration, handleDisconnect, disconnecting, handleModalClose }) {
    const { showModal, closeModal } = useModal();

    const onClose = (refresh = false) => {
        closeModal();
        if (refresh) {
            handleModalClose?.();
        } // Call the optional callback if provided
    }
    return (
        <div
            key={integration.id}
            className="p-5 border rounded-lg bg-white flex flex-col"
        >
            <div className="flex items-start justify-between mb-3">
                {/* Integration header with logo and name */}
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
                        {/* Integration state indicator */}
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className={`size-2 rounded-full ${integration.state === 'READY' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}></span>
                            <span className="text-xs text-gray-500">
                                {integration.state}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Connection status or connect button */}
                {integration.connection ? (
                    <div className="flex flex-col items-end">
                        <span className={`text-sm px-2 py-1 rounded-full ${integration.connection.state === 'READY'
                            ? 'bg-green-100 text-green-800'
                            : integration.connection.state === 'ERROR'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {integration.connection.state}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                            Last active: {integration.connection?.lastActiveAt ? new Date(integration.connection.lastActiveAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <Button
                            variant="destructive"
                            className="text-xs px-2 py-1 mt-2"
                            onClick={() => handleDisconnect(integration.connection.id)}
                            disabled={disconnecting === integration.connection.id}
                        >
                            {disconnecting === integration.connection.id ? "Disconnecting..." : "Disconnect"}
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

            {/* Integration details section */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 mt-2 text-sm">
                <div>
                    <span className="text-gray-500">Auth Type:</span>{' '}
                    <span className="font-medium capitalize">{integration.authType || 'Unknown'}</span>
                </div>
                <div>
                    <span className="text-gray-500">Version:</span>{' '}
                    <span className="font-medium">{integration.connectorVersion || 'N/A'}</span>
                </div>
                <div>
                    <span className="text-gray-500">Data Collections:</span>{' '}
                    <span className="font-medium">{integration.dataCollectionsCount || 0}</span>
                </div>
                <div>
                    <span className="text-gray-500">Operations:</span>{' '}
                    <span className="font-medium">{integration.operationsCount || 0}</span>
                </div>
                <div>
                    <span className="text-gray-500">Events:</span>{' '}
                    <span className="font-medium">{integration.eventsCount || 0}</span>
                </div>
                <div>
                    <span className="text-gray-500">ID:</span>{' '}
                    <span className="font-medium text-xs text-gray-600">{integration.id}</span>
                </div>
                {integration.connection && (
                    <div>
                        <span className="text-gray-500">Connection ID:</span>{' '}
                        <span className="font-medium text-xs text-gray-600">{integration.connection.id}</span>
                    </div>
                )}
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
                {integration.hasDocumentation && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">Documentation</span>
                )}
                {integration.hasUdm && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs">UDM</span>
                )}
                {integration.hasEvents && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs">Events</span>
                )}
                {integration.hasGlobalWebhooks && (
                    <span className="px-2 py-0.5 bg-pink-50 text-pink-700 rounded-full text-xs">Webhooks</span>
                )}
                {integration.connection && (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs">Connected</span>
                )}
            </div>
        </div>
    )
};