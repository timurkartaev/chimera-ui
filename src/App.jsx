import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { useState } from 'react';
import { IntegrationList } from './components/ui/integration_list';
import { Input } from "./components/ui/input";
import { Checkbox } from "./components/ui/checkbox";
import { Button } from "./components/ui/button";
import { IntegrationWorkspace } from './components/ui/entity_workspace';



const queryClient = new QueryClient() // check cache ttl

export default function App() {
    const [showInfoPage, setShowInfoPage] = useState(false);
    const [integrations, setIntegrations] = useState([]);

    return (
        <QueryClientProvider client={queryClient}>
            <div className="px-8 w-full">
                {!showInfoPage ? (
                    /* Connectors List Page */
                    <div className="py-4">
                        <h2 className="text-lg font-semibold mb-4">Available Connectors</h2>

                        {/* List of connectors with status */}
                        <div className="grid gap-4 mb-6">
                            <IntegrationList onIntegrationsLoaded={setIntegrations} />
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

                        <IntegrationWorkspace
                            integrations={integrations}
                        />
                        {/*<Actions/>*/}
                    </>
                )}
            </div>
        </QueryClientProvider>
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