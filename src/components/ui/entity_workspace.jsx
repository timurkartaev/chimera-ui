import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchEntityObjects, fetchEntities, fetchEntitySchema } from '../../utils'; // adjust this import
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './select';

function ListEntities({ integrationKey, selectedEntity, onSelectEntity }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["entityOptions", integrationKey],
        queryFn: () => fetchEntities(integrationKey),
        enabled: !!integrationKey,
    });

    const {
        data: entityDetails,
        isLoading: isLoadingDetails,
        error: detailsError
    } = useQuery({
        queryKey: ["entityDetails", integrationKey, selectedEntity],
        queryFn: () => fetchEntitySchema(integrationKey, selectedEntity),
        enabled: !!(integrationKey && selectedEntity)
    });

    const handleChange = (e) => {
        onSelectEntity(e.target.value);
    };

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
                    className="w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                    <option value="">-- Select Entity --</option>
                    {data?.entities?.map(entity => (
                        <option key={entity.key} value={entity.key}>
                            {entity.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedEntity && (
                <div>
                    {isLoadingDetails && <p className="text-gray-500">Loading entity details...</p>}
                    {detailsError && <p className="text-red-500">Error: {detailsError.message}</p>}
                    {entityDetails?.entity_schema && <SchemaTable entity={entityDetails.entity_schema} />}
                </div>
            )}
        </div>
    );
}


function flattenField(key, value) {
    if (value === null || value === undefined) {
        return { key, value: 'N/A', type: 'null' };
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
        const displayValue = value.name || value.title || (value.id !== undefined ? `ID: ${value.id}` : JSON.stringify(value));
        return { key, value: displayValue, type: 'object' };
    }

    if (Array.isArray(value)) {
        return { key, value: value.length ? value.join(', ') : 'Empty', type: 'array' };
    }

    return { key, value: String(value), type: typeof value };
}

function getFlattenedFields(record) {
    const fields = record.fields || {};
    const result = [];

    for (const [key, value] of Object.entries(fields)) {
        if (['user', 'person', 'organization'].includes(key)) continue;
        result.push(flattenField(key, value));
    }

    return result;
}

function ObjectsList({ integrationKey, entityKey }) {
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['searchObjects', searchTerm, integrationKey, entityKey],
        queryFn: () => searchEntityObjects(searchTerm, integrationKey, entityKey),
        enabled: !!searchTerm && !!integrationKey && !!entityKey,
        refetchOnWindowFocus: false,
        staleTime: 30000,
    });

    const records = data?.response?.records || [];
    const selectedObject = records.find(obj => obj.id === selectedObjectId);

    return (
        <div className="py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Objects</h2>

            {!integrationKey || !entityKey ? (
                <p className="text-gray-500">Please select an integration and entity first</p>
            ) : isLoading ? (
                <p className="text-gray-500">Loading objects...</p>
            ) : error ? (
                <p className="text-red-500">Error: {error.message}</p>
            ) : records.length === 0 ? (
                <p className="text-gray-500">No objects found</p>
            ) : (
                <>
                    <Select value={selectedObjectId} onValueChange={setSelectedObjectId}>
                        <SelectTrigger className="w-full max-w-md mb-4">
                            <SelectValue placeholder="Select an object" />
                        </SelectTrigger>
                        <SelectContent>
                            {records.map(obj => (
                                <SelectItem key={obj.id} value={obj.id}>
                                    {obj.name || `Object #${obj.id}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedObject && (
                        <div className="mt-4">
                            <h3 className="text-md font-medium mb-2">{selectedObject.name}</h3>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/4">Field</th>
                                        <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/4">Value</th>
                                        <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/4">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFlattenedFields(selectedObject).map((field, index) => (
                                        <tr key={index}>
                                            <td className="border border-gray-300 px-2 py-1 text-sm">{field.key}</td>
                                            <td className="border border-gray-300 px-2 py-1 text-sm">{field.value}</td>
                                            <td className="border border-gray-300 px-2 py-1 text-sm">{field.type}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
function IntegrationDetail({ selectedIntegration }) {
    if (!selectedIntegration) {
        return (
            <div className="mt-6 p-5 border border-gray-200 rounded-md bg-white dark:bg-slate-800 shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">No connection selected. Please select a connection from the dropdown above.</p>
            </div>
        );
    }

    const integration = selectedIntegration;

    // Extract integration details
    const integrationName = integration?.name || '';
    const integrationKey = integration?.key || '';
    const logoUrl = integration?.logo || '';
    const authType = integration?.auth_type || 'unknown';
    const version = integration?.version || 'N/A';

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
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Selected
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
                    </div>
                </div>
            </div>
        </div>
    )
}
function InfoSelection({ onSelectConnection, integrations }) {
    const [selectedValue, setSelectedValue] = useState('');

    // Use TanStack Query to fetch the options

    const handleChange = (e) => {
        const value = e.target.value;
        setSelectedValue(value);

        // Find selected connection to get both connectionId and integrationKey
        const selectedConnection = integrations?.find(item => item.id === value);
        if (selectedConnection) {
            // Pass both the connectionId and the integrationKey
            onSelectConnection(value, selectedConnection.integration.key);
        } else {
            onSelectConnection('', '');
        }
    };

    // Find the selected integration
    const selectedIntegration = integrations?.find(item => item.key === selectedValue);
    console.log(integrations);
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
                    {integrations?.map(option => (
                        <option key={option.key} value={option.key}>
                            {option.name}
                        </option>   
                    ))}
                </select>
            </div>

            {/* Render IntegrationDetail as a child */}
            <IntegrationDetail selectedIntegration={selectedIntegration} />
        </div>
    )
}

export function IntegrationWorkspace({integrations}) {
    const [integrationKey, setSelectedIntegrationKey] = useState('');
    const [selectedEntity, setSelectedEntity] = useState('');
    return (
        <>
            <InfoSelection
                integrations={integrations}
                onSelectConnection={(integrationKey) => {
                    setSelectedIntegrationKey(integrationKey);
                }}
            />

            <ListEntities
                integrationKey={integrationKey}
                selectedEntity={selectedEntity}
                onSelectEntity={setSelectedEntity}
            />

            <ObjectsList
                integrationKey={integrationKey}
                entityKey={selectedEntity}
            />
        </>
    );
}
