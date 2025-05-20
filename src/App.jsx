import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { useState } from 'react';
import { fetchOptions } from './utils';

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

// Button component
function Button({ children, className = "", variant = "default", onClick }) {
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
  return (
    <QueryClientProvider client={queryClient}>
      <div className="pl-4 max-w-4xl">
        <InfoSelection />
        <Authorization />
        <ListEntities />
        <ObjectsList />
        <Actions />
      </div>
    </QueryClientProvider>
  )
}

function InfoSelection() {
    const [selectedValue, setSelectedValue] = useState('');

    // Use TanStack Query to fetch the options
    const {data, isLoading, error} = useQuery({
        queryKey: ['selectOptions'], 
        queryFn: fetchOptions
    });

    const handleChange = (e) => {
        setSelectedValue(e.target.value);
    };

    if (isLoading) return <p>Loading options...</p>;
    if (error) return <p>Error loading options: {error.message}</p>;

    return (
        <div className="py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Info</h2>
            <div className="w-full max-w-xs mb-4">
                <label htmlFor="options" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Select an option:
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
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
            {selectedValue && (
                <IntegrationDetail integration_name={selectedValue}/>
            )}
        </div>
    )
}

function IntegrationDetail({integration_name}) {
    return (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-white dark:bg-slate-800 max-w-sm">
            <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-lg">
                    🔌
                </div>
                <div>
                    <div className="font-medium">Integration: {integration_name}</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connected successfully</p>
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

function ListEntities() {
  return (
    <div className="py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold mb-2">Entities</h2>
      <div className="w-full max-w-xs mb-4">
        <Select defaultValue="company">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Company, Deal, etc.</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
              </SelectContent>
            </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-2 py-1 text-left text-sm">id</th>
              <th className="border border-gray-300 px-2 py-1 text-left text-sm">label</th>
              <th className="border border-gray-300 px-2 py-1 text-left text-sm">custom</th>
              <th className="border border-gray-300 px-2 py-1 text-left text-sm">dataType</th>
              <th className="border border-gray-300 px-2 py-1 text-left text-sm">options</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">dealname</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Deal Name</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">false</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">string</td>
              <td className="border border-gray-300 px-2 py-1 text-sm"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">amount</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Amount</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">false</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
              <td className="border border-gray-300 px-2 py-1 text-sm"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">dealstage</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Deal Stage</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">false</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">
                Appointment scheduled | Qualified to buy | Presentation scheduled | Decision maker bought-in |
                Contract sent | Closed won | Closed lost
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">pipeline</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Pipeline</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">false</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">
                Sales Pipeline | Onboarding Pipeline | Renewals Pipeline
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">close_date</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Close Date</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">false</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">date</td>
              <td className="border border-gray-300 px-2 py-1 text-sm"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">create_date</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Create Date</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">false</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">datetime</td>
              <td className="border border-gray-300 px-2 py-1 text-sm"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">dealtype</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Deal Type</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">false</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">New Business | Existing Business</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">hubspot_owner_id</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Deal Owner</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">false</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">string</td>
              <td className="border border-gray-300 px-2 py-1 text-sm"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">custom_priority_level</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Priority Level</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">true</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">High | Medium | Low</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">custom_discount_applied</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Discount Applied</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">true</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">boolean</td>
              <td className="border border-gray-300 px-2 py-1 text-sm"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">custom_use_case</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Use Case</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">true</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">string</td>
              <td className="border border-gray-300 px-2 py-1 text-sm"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">custom_industry</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Industry</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">true</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">
                SaaS | E-commerce | Healthcare | Finance | Education
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">custom_contract_duration</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Contract Duration (Months)</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">true</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
              <td className="border border-gray-300 px-2 py-1 text-sm"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">custom_product_interest</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Product Interest</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">true</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">enumeration</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Basic | Pro | Enterprise</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm">custom_expected_revenue</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">Expected Revenue</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">true</td>
              <td className="border border-gray-300 px-2 py-1 text-sm">number</td>
              <td className="border border-gray-300 px-2 py-1 text-sm"></td>
            </tr>
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
          <Input placeholder="Deal XYZ" className="pl-8" />
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
                <td className="border border-gray-300 px-2 py-1 text-sm">Website Overhaul + SEO Optimization</td>
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