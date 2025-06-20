import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEntityObjects, fetchEntities, fetchEntitySchema, fetchEntityObject } from '../../utils'; // adjust this import
import SchemaTable from './schema_table';


function flattenField(key, value) {
    if (value === null || value === undefined) {
        return { key, value: 'N/A', type: 'null' };
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
        return { key, value: value, type: 'object' };
    }

    if (Array.isArray(value)) {
        return { key, value: value, type: 'array' };
    }
    return { key, value: value, type: typeof value };
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


export function IntegrationWorkspace({ integrations, selectedIntegration, onBack }) {
    const [integrationKey, setSelectedIntegrationKey] = useState(selectedIntegration?.key || '');
    const [selectedEntity, setSelectedEntity] = useState('');
    const [currentIntegration, setCurrentIntegration] = useState(selectedIntegration || null);

    // Update current integration when selectedIntegration changes
    useEffect(() => {
        if (selectedIntegration) {
            setSelectedIntegrationKey(selectedIntegration.key);
            setCurrentIntegration(selectedIntegration);
        }
    }, [selectedIntegration]);

    const { data: entitiesData, isLoading: isLoadingEntities } = useQuery({
        queryKey: ["entityOptions", integrationKey],
        queryFn: () => fetchEntities(integrationKey),
        enabled: !!integrationKey,
    });

    const handleIntegrationChange = (e) => {
        const value = e.target.value;
        const selected = integrations?.find(item => item.key === value);
        setSelectedIntegrationKey(value);
        setCurrentIntegration(selected || null);
        setSelectedEntity(''); // Reset entity selection when integration changes
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Navigation Bar */}
            <div className="bg-white border-b border-gray-200">
                {/* Header with Back Button */}
                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Integration Workspace</h2>
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Connectors
                    </button>
                </div>

                {/* Main Selectors */}
                <div className="px-6 py-4">
                    <div className="flex items-center gap-6">
                        {/* Integration Selector */}
                        <div className="flex-1">
                            <label htmlFor="integration" className="block text-sm font-medium text-gray-700 mb-1">
                                Connection
                            </label>
                            <select
                                id="integration"
                                value={integrationKey}
                                onChange={handleIntegrationChange}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            >
                                <option value="">-- Select Connection --</option>
                                {integrations?.map(option => (
                                    <option key={option.key} value={option.key}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Entity Selector */}
                        <div className="flex-1">
                            <label htmlFor="entities" className="block text-sm font-medium text-gray-700 mb-1">
                                Entity
                            </label>
                            <select
                                id="entities"
                                value={selectedEntity}
                                onChange={(e) => setSelectedEntity(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!integrationKey || isLoadingEntities}
                            >
                                <option value="">
                                    {isLoadingEntities
                                        ? "Loading entities..."
                                        : "-- Select Entity --"
                                    }
                                </option>
                                {entitiesData?.entities?.map(entity => (
                                    <option key={entity.key} value={entity.key}>
                                        {entity.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Integration Details Bar */}
                {currentIntegration && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                {currentIntegration.logo ? (
                                    <img src={currentIntegration.logo} alt="" className="size-full object-cover" />
                                ) : (
                                    <span role="img" aria-label="plugin" className="text-gray-400 text-lg">🔌</span>
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">
                                    {currentIntegration.name}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>Version: {currentIntegration.version || 'N/A'}</span>
                                    <span>•</span>
                                    <span className="capitalize">Auth: {currentIntegration.auth_type}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0 flex flex-col bg-gray-50">
                {/* Entity Schema Panel */}
                <div className="flex-1 min-h-0 bg-white border-b border-gray-200">
                    <EntitySchemaPanel
                        integrationKey={integrationKey}
                        selectedEntity={selectedEntity}
                    />
                </div>

                {/* Objects Panel */}
                <div className="flex-1 min-h-0 bg-white">
                    <ObjectsPanel
                        integrationKey={integrationKey}
                        entityKey={selectedEntity}
                    />
                </div>
            </div>
        </div>
    );
}

function EntitySchemaPanel({ integrationKey, selectedEntity }) {
    const [isSchemaCollapsed, setIsSchemaCollapsed] = useState(true);

    const {
        data: entityDetails,
        isLoading: isLoadingDetails,
        error: detailsError
    } = useQuery({
        queryKey: ["entityDetails", integrationKey, selectedEntity],
        queryFn: () => fetchEntitySchema(integrationKey, selectedEntity),
        enabled: !!(integrationKey && selectedEntity)
    });

    if (!selectedEntity) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Please select an entity to view its schema</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
                <h2 className="text-base font-medium text-gray-900">Entity Schema</h2>
                {entityDetails?.entity_schema && (
                    <button
                        onClick={() => setIsSchemaCollapsed(!isSchemaCollapsed)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <span className={`transform transition-transform ${isSchemaCollapsed ? 'rotate-0' : 'rotate-90'}`}>
                            ▶
                        </span>
                        {isSchemaCollapsed ? 'Show Schema' : 'Hide Schema'}
                    </button>
                )}
            </div>

            <div className="flex-1 min-h-0">
                {isLoadingDetails ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="flex items-center justify-center p-4">
                            <p className="text-gray-500">Loading entity details...</p>
                        </div>
                    </div>
                ) : detailsError ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600">Error: {detailsError.message}</p>
                        </div>
                    </div>
                ) : entityDetails?.entity_schema && !isSchemaCollapsed ? (
                    <div className="h-full overflow-auto">
                        <SchemaTable entity={entityDetails.entity_schema} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function ObjectsPanel({ integrationKey, entityKey }) {
    const [selectedObjectKey, setSelectedObjectKey] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['searchObjects', integrationKey, entityKey],
        queryFn: () => fetchEntityObjects(integrationKey, entityKey),
        enabled: !!integrationKey && !!entityKey,
        refetchOnWindowFocus: false,
        staleTime: 30000,
    });

    const records = data?.objects || [];

    const { data: objectDetails, isLoading: isLoadingDetails, error: detailsError } = useQuery({
        queryKey: ['objectDetails', integrationKey, entityKey, selectedObjectKey],
        queryFn: () => fetchEntityObject(integrationKey, entityKey, selectedObjectKey),
        enabled: !!integrationKey && !!entityKey && !!selectedObjectKey,
        select: (data) => data.object,
    });

    useEffect(() => {
        console.log("objectDetails:", objectDetails);
    }, [objectDetails]);

    // Early return for no entity selected
    if (!entityKey) {
        return (
            <div className="h-full bg-white flex items-center justify-center">
                <p className="text-gray-500">Please select an entity to view its objects</p>
            </div>
        );
    }

    // Render loading state
    if (isLoading) {
        return (
            <div className="h-full bg-white flex items-center justify-center">
                <p className="text-gray-500">Loading objects...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="h-full bg-white flex items-center justify-center">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600">Error: {error.message}</p>
                </div>
            </div>
        );
    }

    // Render empty state
    if (records.length === 0) {
        return (
            <div className="h-full bg-white flex items-center justify-center">
                <p className="text-gray-500">No objects found</p>
            </div>
        );
    }
    return (
        <div className="h-full bg-white flex flex-col">
            <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-base font-medium text-gray-900">Objects</h2>
                <div className="w-96">
                    <select
                        value={selectedObjectKey}
                        onChange={(e) => setSelectedObjectKey(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                    >
                        <option value="">-- Select Object --</option>
                        {records.map(obj => (
                            <option key={obj.key} value={obj.key}>
                                {obj.name || `Object #${obj.key}`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 min-h-0 p-6">
                {!selectedObjectKey ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">Select an object to view its details</p>
                    </div>
                ) : (
                    <div className="h-full overflow-auto">
                        {isLoadingDetails ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500">Loading object details...</p>
                            </div>
                        ) : detailsError ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-600">Error: {detailsError.message}</p>
                                </div>
                            </div>
                        ) : objectDetails ? (
                            <ObjectDetailsTable objectDetails={objectDetails} />
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}

// Extracted component for better organization
function ObjectDetailsTable({ objectDetails }) {
    const flattenedFields = getFlattenedFields(objectDetails);

    const renderValue = (value, type) => {
        // Handle null/undefined values
        if (type === 'null') {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
                    Null
                </span>
            );
        }

        // Handle empty strings
        if (type === 'string' && value === '') {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
                    Empty
                </span>
            );
        }

        // Handle boolean values
        if (type === 'boolean') {
            return (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${value ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                    {value ? 'True' : 'False'}
                </span>
            );
        }

        // Handle numbers with formatting
        if (type === 'number') {
            const isInteger = Number.isInteger(value);
            const formattedValue = isInteger
                ? value.toLocaleString()
                : value.toFixed(2);

            return (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-mono bg-blue-50 text-blue-700 border border-blue-200">
                    {formattedValue}
                    {!isInteger && <span className="ml-1 text-xs text-blue-500">float</span>}
                </span>
            );
        }

        // Handle dates (ISO strings that look like dates)
        if (type === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return (
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-900">
                            {date.toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                            {date.toLocaleTimeString()}
                        </span>
                    </div>
                );
            }
        }

        // Handle URLs
        if (type === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
            return (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                    {value}
                </a>
            );
        }

        // Handle email addresses
        if (type === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return (
                <a
                    href={`mailto:${value}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    {value}
                </a>
            );
        }

        // Handle long strings
        if (type === 'string' && value.length > 100) {
            return (
                <div className="max-w-md">
                    <div className="text-sm text-gray-900 mb-2">
                        {value.substring(0, 100)}...
                    </div>
                    <button
                        onClick={() => {
                            const fullText = document.createElement('textarea');
                            fullText.value = value;
                            document.body.appendChild(fullText);
                            fullText.select();
                            document.execCommand('copy');
                            document.body.removeChild(fullText);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                        Copy full text
                    </button>
                </div>
            );
        }

        // Handle objects with JSON formatting
        if (type === 'object' && typeof value === 'object' && value !== null) {
            return (
                <div className="relative group">
                    <pre className="text-sm bg-gray-50 p-3 rounded border overflow-auto max-h-64">
                        {JSON.stringify(value, null, 2)}
                    </pre>
                    <button
                        onClick={() => {
                            const jsonText = document.createElement('textarea');
                            jsonText.value = JSON.stringify(value, null, 2);
                            document.body.appendChild(jsonText);
                            jsonText.select();
                            document.execCommand('copy');
                            document.body.removeChild(jsonText);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    >
                        Copy
                    </button>
                </div>
            );
        }

        // Handle arrays with enhanced display
        if (type === 'array' && Array.isArray(value)) {
            return (
                <div className="relative group">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-500">
                            Array ({value.length} items)
                        </span>
                    </div>
                    <pre className="text-sm bg-gray-50 p-3 rounded border overflow-auto max-h-64">
                        {JSON.stringify(value, null, 2)}
                    </pre>
                    <button
                        onClick={() => {
                            const jsonText = document.createElement('textarea');
                            jsonText.value = JSON.stringify(value, null, 2);
                            document.body.appendChild(jsonText);
                            jsonText.select();
                            document.execCommand('copy');
                            document.body.removeChild(jsonText);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    >
                        Copy
                    </button>
                </div>
            );
        }

        // Default string rendering
        return (
            <span className="text-sm text-gray-900 break-words">
                {String(value)}
            </span>
        );
    };

    return (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    {objectDetails.name}
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Field
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Value
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {flattenedFields.map((field, index) => (
                            <tr key={`${field.key}-${index}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {field.key}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {renderValue(field.value, field.type)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {field.type}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

