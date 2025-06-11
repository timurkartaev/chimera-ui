import {
    QueryClient,
    QueryClientProvider,
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import { useState, useEffect } from 'react';
import { fetchOptions, fetchIntegrations, archiveConnection, fetchDataCollections, fetchEntityDetails, searchEntityObjects } from './utils';
import { IntegrationCard } from './components/ui/integration_card';

// Import the Select components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./components/ui/select";

// Import the Input component
import { Input } from "./components/ui/input";

// Import the Checkbox component
import { Checkbox } from "./components/ui/checkbox";
import { Button } from "./components/ui/button";


// Simple component to display connectors
function ConnectorsList() {
    const queryClient = useQueryClient();
    const [disconnecting, setDisconnecting] = useState(null);

    // Query to fetch integrations
    const { data, isLoading, error } = useQuery({
        queryKey: ['integrations'],
        queryFn: fetchIntegrations
    });

    // Mutation to archive/disconnect a connection
    const disconnectMutation = useMutation({
        mutationFn: archiveConnection,
        onMutate: (connectionId) => {
            setDisconnecting(connectionId);
        },
        onSuccess: () => {
            // Invalidate the query to refetch the data
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
        },
        onError: (error) => {
            console.error("Failed to disconnect:", error);
            alert("Failed to disconnect: " + error.message);
        },
        onSettled: () => {
            setDisconnecting(null);
        }
    });

    // Handle disconnect button click
    const handleDisconnect = (connectionId) => {
        if (confirm("Are you sure you want to disconnect this integration?")) {
            disconnectMutation.mutate(connectionId);
        }
    };

    const handleModalClose = () => {
        // Just invalidate queries here or trigger other state changes
        console.log("Modal closed, invalidating queries...");
        queryClient.invalidateQueries(['integrations']);
    };

    if (isLoading) return <p>Loading connectors...</p>;
    if (error) return <p>Error loading connectors: {error.message}</p>;

    // Get integrations from the new response structure
    const integrations = data?.response?.items || [];

    return (
        <>
            {integrations.map(integration => (
                <IntegrationCard key={integration.key} integration={integration} handleDisconnect={handleDisconnect} disconnecting={disconnecting} handleModalClose={handleModalClose} />
            ))}
        </>
    );
}

const queryClient = new QueryClient() // check cache ttl

export default function App() {
    const [showInfoPage, setShowInfoPage] = useState(false);
    const [selectedConnectionId, setSelectedConnectionId] = useState('');
    const [selectedIntegrationKey, setSelectedIntegrationKey] = useState('');

    return (
        <QueryClientProvider client={queryClient}>
            <div className="pl-8 pr-4 max-w-7xl w-full">
                {!showInfoPage ? (
                    /* Connectors List Page */
                    <div className="py-4">
                        <h2 className="text-lg font-semibold mb-4">Available Connectors</h2>

                        {/* List of connectors with status */}
                        <div className="grid gap-4 mb-6">
                            <ConnectorsList />
                        </div>

                        {/* Simple button to show info page */}
                        <Button
                            onClick={() => setShowInfoPage(true)}
                            className="mt-4"
                        >
                            Continue to Info Page
                        </Button>
                    </div>
                ) : (
                    /* Info Page with components */
                    <>
                        <div className="flex justify-between items-center py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">Info Page</h2>
                            <Button onClick={() => setShowInfoPage(false)}>
                                Back to Connectors
                            </Button>
                        </div>

                        <InfoSelection
                            onSelectConnection={(connectionId, integrationKey) => {
                                setSelectedConnectionId(connectionId);
                                setSelectedIntegrationKey(integrationKey);
                            }}
                        />
                        <ListEntities connectionId={selectedConnectionId} />
                        <ObjectsList integrationKey={selectedIntegrationKey} />
                        {/*<Actions/>*/}
                    </>
                )}
            </div>
        </QueryClientProvider>
    )
}

function InfoSelection({ onSelectConnection }) {
    const [selectedValue, setSelectedValue] = useState('');

    // Use TanStack Query to fetch the options
    const { data, isLoading, error } = useQuery({
        queryKey: ['selectOptions'],
        queryFn: fetchOptions
    });

    const handleChange = (e) => {
        const value = e.target.value;
        setSelectedValue(value);

        // Find selected connection to get both connectionId and integrationKey
        const selectedConnection = data?.items?.find(item => item.id === value);
        if (selectedConnection) {
            // Pass both the connectionId and the integrationKey
            onSelectConnection(value, selectedConnection.integration.key);
        } else {
            onSelectConnection('', '');
        }
    };

    // Find the selected integration
    const selectedIntegration = data?.items?.find(item => item.id === selectedValue);

    if (isLoading) return <p>Loading options...</p>;
    if (error) return <p>Error loading options: {error.message}</p>;

    return (
        <div className="py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Info</h2>
            <div className="w-full max-w-xs mb-4">
                <label htmlFor="options" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Select a connection:
                </label>
                <select
                    id="options"
                    value={selectedValue}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                    <option value="">-- Select --</option>
                    {data?.items?.map(option => (
                        <option key={option.id} value={option.id}>
                            {option.integration.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Render IntegrationDetail as a child */}
            <IntegrationDetail selectedIntegration={selectedIntegration} />
        </div>
    )
}

function IntegrationDetail({ selectedIntegration }) {
    if (!selectedIntegration) {
        return (
            <div className="mt-6 p-5 border border-gray-200 rounded-md bg-white dark:bg-slate-800 shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">No connection selected. Please select a connection from the dropdown above.</p>
            </div>
        );
    }

    const integration = selectedIntegration.integration;
    const connection = selectedIntegration.connection;

    // Extract integration details
    const integrationName = integration?.name || '';
    const integrationKey = integration?.key || '';
    const logoUrl = integration?.logoUri || '';
    const dataCollectionsCount = integration?.dataCollectionsCount || 0;
    const operationsCount = integration?.operationsCount || 0;
    const eventsCount = integration?.eventsCount || 0;
    const authType = integration?.authType || 'unknown';
    const version = integration?.connectorVersion || 'N/A';

    // Format dates for better readability
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="mt-6 p-6 border border-gray-200 rounded-md bg-white dark:bg-slate-800 shadow-md">
            {/* Connection Header */}
            <div className="flex items-start gap-5 mb-4">
                <div className="size-14 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-lg overflow-hidden shrink-0">
                    {logoUrl ? (
                        <img src={logoUrl} alt="" className="size-full object-cover" />
                    ) : (
                        <span role="img" aria-label="plugin" className="text-gray-400">🔌</span>
                    )}
                </div>
                <div>
                    <div className="font-semibold text-lg">
                        {integrationName}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${connection?.state === 'READY'
                                ? 'bg-green-100 text-green-800'
                                : connection?.state === 'ERROR'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}>
                            {connection ? connection.state : 'Selected'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {selectedIntegration.id.substring(0, 8)}...
                        </span>
                    </div>
                </div>
            </div>

            {/* Integration Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 mt-3">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-md">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Integration Details</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Key:</span>
                            <span className="font-medium">{integrationKey}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Auth Type:</span>
                            <span className="font-medium capitalize">{authType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Version:</span>
                            <span className="font-medium">{version}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Data Collections:</span>
                            <span className="font-medium">{dataCollectionsCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Operations:</span>
                            <span className="font-medium">{operationsCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Events:</span>
                            <span className="font-medium">{eventsCount}</span>
                        </div>
                    </div>
                </div>

                {/* Connection Details - Show only if connection exists */}
                {connection && (
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-md">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Connection Details</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Connection ID:</span>
                                <span className="font-medium">{connection.id.substring(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">User ID:</span>
                                <span className="font-medium">{connection.userId?.substring(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                <span className="font-medium">{formatDate(connection.createdAt)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                                <span className="font-medium">{formatDate(connection.updatedAt)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Last Active:</span>
                                <span className="font-medium">{connection.lastActiveAt ? formatDate(connection.lastActiveAt) : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                <span className="font-medium">{connection.disconnected ? 'Disconnected' : 'Connected'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Features and capabilities */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-1">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                    {integration.hasData && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">Data</span>
                    )}
                    {integration.hasOperations && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">Operations</span>
                    )}
                    {integration.hasDocumentation && (
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">Documentation</span>
                    )}
                    {integration.hasEvents && (
                        <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs">Events</span>
                    )}
                    {integration.hasGlobalWebhooks && (
                        <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded-full text-xs">Webhooks</span>
                    )}
                    {integration.hasUdm && (
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">UDM</span>
                    )}
                    {connection && (
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">Connected</span>
                    )}
                </div>
            </div>
        </div>
    )
}

function ListEntities({ connectionId }) {
    const [selectedEntity, setSelectedEntity] = useState('');

    // Use TanStack Query to fetch the entity options using the connectionId
    const { data, isLoading, error } = useQuery({
        queryKey: ['entityOptions', connectionId],
        queryFn: () => fetchDataCollections(connectionId),
        // Only fetch when we have a connectionId
        enabled: !!connectionId
    });

    // Fetch entity details when an entity is selected
    const { data: entityDetails, isLoading: isLoadingDetails, error: detailsError } = useQuery({
        queryKey: ['entityDetails', connectionId, selectedEntity],
        queryFn: () => fetchEntityDetails(connectionId, selectedEntity),
        // Only fetch when we have both connectionId and selectedEntity
        enabled: !!(connectionId && selectedEntity)
    });

    console.log(entityDetails)

    const handleChange = (e) => {
        setSelectedEntity(e.target.value);
    };

    if (!connectionId) {
        return (
            <div className="py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold mb-2">Entities</h2>
                <p className="text-gray-500">Please select a connection first to view available entities</p>
            </div>
        );
    }

    if (isLoading) return <p>Loading entities...</p>;
    if (error) return <p>Error loading entities: {error.message}</p>;

    return (
        <div className="py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Entities</h2>
            <div className="w-full mb-4">
                <label htmlFor="entities" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Select an entity:
                </label>
                <select
                    id="entities"
                    value={selectedEntity}
                    onChange={handleChange}
                    className="w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                    <option value="">-- Select Entity --</option>
                    {data?.entities?.map(entity => (
                        <option key={entity.key} value={entity.key}>
                            {entity.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto w-full" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/6">id</th>
                            <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/5">label</th>
                            <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/6">custom</th>
                            <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/6">dataType</th>
                            <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/4">options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* If no entity is selected, show message */}
                        {!selectedEntity && (
                            <tr>
                                <td colSpan="5" className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                                    Please select an entity to view its fields
                                </td>
                            </tr>
                        )}

                        {/* If entity is selected but details are loading */}
                        {selectedEntity && isLoadingDetails && (
                            <tr>
                                <td colSpan="5" className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                                    Loading entity details...
                                </td>
                            </tr>
                        )}

                        {/* If there's an error loading details */}
                        {selectedEntity && detailsError && (
                            <tr>
                                <td colSpan="5" className="border border-gray-300 px-2 py-4 text-center text-red-500">
                                    Error: {detailsError.message}
                                </td>
                            </tr>
                        )}

                        {/* Display entity details if available */}
                        {selectedEntity && entityDetails?.entity_schema && Array.isArray(entityDetails.entity_schema) && entityDetails.entity_schema.map(field => (
                            <tr key={field.id}>
                                <td className="border border-gray-300 px-2 py-1 text-sm w-1/6">{field.id}</td>
                                <td className="border border-gray-300 px-2 py-1 text-sm w-1/5">{field.label}</td>
                                <td className="border border-gray-300 px-2 py-1 text-sm w-1/6">{field.custom ? 'true' : 'false'}</td>
                                <td className="border border-gray-300 px-2 py-1 text-sm w-1/6">{field.dataType}</td>
                                <td className="border border-gray-300 px-2 py-1 text-sm w-1/4">{field.options}</td>
                            </tr>
                        ))}

                        {/* Handle the new schema format with nested fieldsSchema */}
                        {selectedEntity && entityDetails?.entity_schema?.fieldsSchema &&
                            Object.entries(entityDetails.entity_schema.fieldsSchema.properties).map(([key, field]) => (
                                <tr key={key}>
                                    <td className="border border-gray-300 px-2 py-1 text-sm w-1/6">{key}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-sm w-1/5">{field.title || key}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-sm w-1/6">{key.startsWith('custom_') ? 'true' : 'false'}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-sm w-1/6">{field.type}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-sm w-1/4">
                                        {field.referenceCollection ? `References: ${field.referenceCollection.key}` : ''}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function ObjectsList({ integrationKey }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Use TanStack Query to fetch search results
    const { data, isLoading, error } = useQuery({
        queryKey: ['searchObjects', searchTerm, integrationKey],
        queryFn: () => searchEntityObjects(searchTerm, integrationKey),
        // Only run the query if we have a search term and selected integration
        enabled: searchTerm.length > 0 && integrationKey.length > 0,
        // Debounce to avoid excessive API calls
        refetchOnWindowFocus: false,
        staleTime: 30000, // 30 seconds
    });

    // Get records from query results or empty array
    const records = searchTerm.length > 0 ? (data?.response?.records || []) : [];
    console.log(records)

    // Function to flatten objects to display in table
    const flattenField = (key, value) => {
        if (value === null || value === undefined) {
            return { key, value: 'N/A', type: 'null' };
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle nested objects
            const displayValue = value.name ||
                value.title ||
                (value.id !== undefined ? `ID: ${value.id}` :
                    JSON.stringify(value));
            return { key, value: displayValue, type: 'object' };
        }

        if (Array.isArray(value)) {
            // Handle arrays
            return { key, value: value.length ? value.join(', ') : 'Empty', type: 'array' };
        }

        // Handle primitive values
        return { key, value: String(value), type: typeof value };
    };

    // Function to get all flattened fields from a record
    const getFlattenedFields = (record) => {
        const fields = record.fields;
        const result = [];

        // Add basic fields
        for (const [key, value] of Object.entries(fields)) {
            // Skip duplicate keys like 'id' that appear both at top level and in nested objects
            if (['user', 'person', 'organization'].includes(key)) continue;

            result.push(flattenField(key, value));
        }

        return result;
    };

    return (
        <div className="py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Objects</h2>

            {/* Search Input */}
            <div className="w-full max-w-md mb-4 relative">
                <Input
                    placeholder="Search deals..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={!integrationKey}
                />
                <div className="absolute left-2 top-2.5 text-gray-400">🔍</div>
            </div>

            {!integrationKey && (
                <p className="text-gray-500">Please select an integration first</p>
            )}

            {integrationKey && isLoading && searchTerm && (
                <p className="text-gray-500">Loading results...</p>
            )}

            {error && (
                <p className="text-red-500">Error: {error.message}</p>
            )}

            {!isLoading && !error && integrationKey && searchTerm && records.length === 0 && (
                <p className="text-gray-500">No records found</p>
            )}

            {integrationKey && !searchTerm && (
                <p className="text-gray-500">Type to search for objects</p>
            )}

            {records.length > 0 && (
                <div className="overflow-x-auto w-full" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    {records.map(record => (
                        <div key={record.id} className="mb-8">
                            <h3 className="text-md font-medium mb-2">{record.name}</h3>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/4">Field</th>
                                        <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/4">Value</th>
                                        <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/4">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFlattenedFields(record).map((field, index) => (
                                        <tr key={index}>
                                            <td className="border border-gray-300 px-2 py-1 text-sm">{field.key}</td>
                                            <td className="border border-gray-300 px-2 py-1 text-sm">{field.value}</td>
                                            <td className="border border-gray-300 px-2 py-1 text-sm">{field.type}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function Actions() {
    return (
        <div className="py-4">
            <h2 className="text-lg font-semibold mb-2">Actions</h2>
            <div className="w-full max-w-xs mb-4">
                <Select defaultValue="update">
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="update">Update Deal</SelectItem>
                        <SelectItem value="create">Create Deal</SelectItem>
                        <SelectItem value="delete">Delete Deal</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-2 py-1 text-left text-sm">id</th>
                            <th className="border border-gray-300 px-2 py-1 text-left text-sm">label</th>
                            <th className="border border-gray-300 px-2 py-1 text-left text-sm">dataType</th>
                            <th className="border border-gray-300 px-2 py-1 text-left text-sm">value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">dealname</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Deal Name</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">string</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">amount</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Amount</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">dealstage</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Deal Stage</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">pipeline</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Pipeline</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">close_date</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Close Date</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">date</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">create_date</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Create Date</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">datetime</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">dealtype</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Deal Type</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">hubspot_owner_id</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Deal Owner</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">string</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">custom_priority_level</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Priority Level</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">custom_discount_applied</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Discount Applied</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">boolean</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Checkbox />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">custom_use_case</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Use Case</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">string</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">custom_industry</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Industry</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">custom_contract_duration</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Contract Duration (Months)</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">custom_product_interest</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Product Interest</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-2 py-1 text-sm">custom_expected_revenue</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">Expected Revenue</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
                            <td className="border border-gray-300 px-2 py-1 text-sm">
                                <Input className="h-7 text-sm" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <Button>Execute</Button>
            </div>
        </div>
    )
}