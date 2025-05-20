import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from '@tanstack/react-query'
import {useState} from 'react';
import {fetchOptions, fetchDataCollections, fetchEntityDetails} from './utils';

// Import the Select components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./components/ui/select";

// Import the Input component
import {Input} from "./components/ui/input";

// Import the Checkbox component
import {Checkbox} from "./components/ui/checkbox";

// Button component
function Button({children, className = "", variant = "default", onClick}) {
    const baseStyles = "px-4 py-2 rounded-md font-medium text-white transition-colors";
    const variantStyles = {
        default: "bg-blue-500 hover:bg-blue-600",
        destructive: "bg-red-500 hover:bg-red-600",
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

const queryClient = new QueryClient() // check cache ttl

export default function App() {
    const [selectedConnectionId, setSelectedConnectionId] = useState('');
    
    return (
        <QueryClientProvider client={queryClient}>
            <div className="pl-8 pr-4 max-w-7xl w-full">
                <InfoSelection onSelectConnection={setSelectedConnectionId} />
                <Authorization/>
                <ListEntities connectionId={selectedConnectionId} />
                <ObjectsList/>
                <Actions/>
            </div>
        </QueryClientProvider>
    )
}

function InfoSelection({ onSelectConnection }) {
    const [selectedValue, setSelectedValue] = useState('');

    // Use TanStack Query to fetch the options
    const {data, isLoading, error} = useQuery({
        queryKey: ['selectOptions'],
        queryFn: fetchOptions
    });

    const handleChange = (e) => {
        const value = e.target.value;
        setSelectedValue(value);
        onSelectConnection(value);
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
                    Select an connection:
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
    const integrationName = selectedIntegration?.integration?.name || '';
    const logoUrl = selectedIntegration?.integration?.logoUri || '';
    const dataCollectionsCount = selectedIntegration?.integration?.dataCollectionsCount || 0;

    return (
        <div className="mt-6 p-5 border border-gray-200 rounded-md bg-white dark:bg-slate-800 max-w-sm shadow-sm">
            <div className="flex items-start gap-5">
                <div className="size-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-lg overflow-hidden shrink-0">
                    {logoUrl ? (
                        <img src={logoUrl} alt="" className="size-full object-cover" />
                    ) : (
                        <span role="img" aria-label="plugin" className="text-gray-400">🔌</span>
                    )}
                </div>
                <div className="space-y-2">
                    <div className="font-medium text-base">
                        {integrationName ? `Integration: ${integrationName}` : "No integration selected"}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {integrationName ? "Connected successfully" : "Please select an integration from the dropdown"}
                    </p>
                    {integrationName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <span className="font-medium">Data Collections:</span> 
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                {dataCollectionsCount}
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

function Authorization() {
    const [connected, setConnected] = useState(false);

    return (
        <div className="py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Authenticate</h2>
            <div className="flex gap-2">
                <Button
                    className={`${connected ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"}`}
                    onClick={() => setConnected(true)}
                >
                    Connect
                </Button>
                <Button variant="destructive" onClick={() => setConnected(false)}>
                    Disconnect
                </Button>
            </div>
        </div>
    )
}

function ListEntities({ connectionId }) {
    const [selectedEntity, setSelectedEntity] = useState('');

    // Use TanStack Query to fetch the entity options using the connectionId
    const {data, isLoading, error} = useQuery({
        queryKey: ['entityOptions', connectionId],
        queryFn: () => fetchDataCollections(connectionId),
        // Only fetch when we have a connectionId
        enabled: !!connectionId
    });

    // Fetch entity details when an entity is selected
    const {data: entityDetails, isLoading: isLoadingDetails, error: detailsError} = useQuery({
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

function ObjectsList() {
    return (
        <div className="py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Objects</h2>
            <div className="w-full max-w-xs mb-4 relative">
                <Input placeholder="Deal XYZ" className="pl-8"/>
                <div className="absolute left-2 top-2.5 text-gray-400">🔍</div>
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
                        <td className="border border-gray-300 px-2 py-1 text-sm">ACME Corp Website Redesign</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">amount</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Amount</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">55000</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">dealstage</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Deal Stage</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Presentation scheduled</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">pipeline</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Pipeline</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Sales Pipeline</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">close_date</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Close Date</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">date</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">2025-06-15</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">create_date</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Create Date</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">datetime</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">2025-05-01T10:23:00</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">dealtype</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Deal Type</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">New Business</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">hubspot_owner_id</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Deal Owner</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">string</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">jane.doe@company.com</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_priority_level</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Priority Level</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">High</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_discount_applied</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Discount Applied</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">boolean</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">true</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_use_case</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Use Case</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">string</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Website Overhaul + SEO Optimization
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_industry</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Industry</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">E-commerce</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_contract_duration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Contract Duration (Months)</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">12</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_product_interest</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Product Interest</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Pro</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_expected_revenue</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Expected Revenue</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">27000</td>
                    </tr>
                    </tbody>
                </table>
            </div>
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
                        <SelectValue placeholder="Select action"/>
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
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">amount</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Amount</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">dealstage</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Deal Stage</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">pipeline</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Pipeline</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">close_date</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Close Date</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">date</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">create_date</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Create Date</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">datetime</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">dealtype</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Deal Type</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">hubspot_owner_id</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Deal Owner</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">string</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_priority_level</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Priority Level</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_discount_applied</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Discount Applied</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">boolean</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Checkbox/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_use_case</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Use Case</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">string</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_industry</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Industry</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_contract_duration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Contract Duration (Months)</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_product_interest</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Product Interest</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1 text-sm">custom_expected_revenue</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">Expected Revenue</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            <Input className="h-7 text-sm"/>
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