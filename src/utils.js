// Define a common base URL for all API calls
const BASE_URL = 'https://chimera-vercel.vercel.app';

const fetchOptions = async () => {
  const response = await fetch(`${BASE_URL}/list-connections`);
  if (!response.ok) {
    throw new Error('Failed to fetch options');
  }
  return response.json();
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

export { fetchOptions, fetchDataCollections, fetchEntityDetails };