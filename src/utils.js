// Define a common base URL for all API calls
const BASE_URL = 'https://chimera-vercel.vercel.app';

const fetchOptions = async () => {
  const response = await fetch(`${BASE_URL}/list-connections`);
  if (!response.ok) {
    throw new Error('Failed to fetch options');
  }
  return response.json();
};

// New function to fetch integrations
const fetchIntegrations = async () => {
  const response = await fetch(`${BASE_URL}/list-integrations`);
  if (!response.ok) {
    throw new Error('Failed to fetch integrations');
  }
  return response.json();
};

// Function to archive/disconnect a connection
const archiveConnection = async (connectionId) => {
  if (!connectionId) {
    throw new Error('Connection ID is required');
  }
  
  const response = await fetch(`${BASE_URL}/archive-connection/${connectionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to archive connection');
  }
  
  return true; // Return true if the operation was successful
};

const fetchDataCollections = async (connectionId) => {
  // Add connectionId as a query parameter if it exists
  const url = connectionId 
    ? `${BASE_URL}/list-data-collections?connection_id=${encodeURIComponent(connectionId)}`
    : `${BASE_URL}/list-data-collections`;
    
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data collections');
  }
  return response.json();
};

const fetchEntityDetails = async (connectionId, entityKey) => {
  if (!connectionId || !entityKey) {
    throw new Error('Connection ID and Entity Key are required');
  }
  
  const url = `${BASE_URL}/get-data-collection-schema?connection_id=${encodeURIComponent(connectionId)}&entity_key=${encodeURIComponent(entityKey)}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch entity details');
  }
  return response.json();
};

const searchEntityObjects = async (query, integrationName) => {
  if (!query) {
    return { records: [] }; // Return empty records if no query
  }
  
  if (!integrationName) {
    throw new Error('Integration name is required');
  }
  
  const url = `${BASE_URL}/run-action/${integrationName}?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to search objects');
  }
  return response.json();
};

export { fetchOptions, fetchIntegrations, archiveConnection, fetchDataCollections, fetchEntityDetails, searchEntityObjects };