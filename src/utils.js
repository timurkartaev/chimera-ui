// Define a common base URL for all API calls
const BASE_URL = import.meta.env.VITE_API_URL || 'https://chimera-vercel.vercel.app';


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

const fetchAuthConfig = async (integrationName) => {
  if (!integrationName) {
    throw new Error('Integration name is required');
  }

  const response = await fetch(`${BASE_URL}/auth/${integrationName}/begin`);

  if (!response.ok) {
    throw new Error('Failed to fetch authorization config');
  }

  return response.json();
}

const listenForStatus = (onmessage, onerror) => {
  const events = new EventSource(`${BASE_URL}/events?channel=status`);
  events.onmessage = onmessage
  events.onerror = onerror
  return events;
}

const fetchAuthStatus = async (integrationName, requestId) => {
  const response = await fetch(`${BASE_URL}/auth/${integrationName}/status/${requestId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch authentication status');
  }
  return response.json();
}

const fetchIntegrationDetails = async (integrationName) => {
  const response = await fetch(`${BASE_URL}/info/${integrationName}`);
  if (!response.ok) {
    throw new Error('Failed to fetch integration details');
  }
  return response.json();
}

const fetchIntegrationConnection = async (integrationName) => {
  const response = await fetch(`${BASE_URL}/auth/${integrationName}/connection`);
  if (!response.ok) {
    throw new Error('Failed to fetch integration connection');
  }
  return response.json();
}

const disconnectConnection = async (integrationName, connectionId) => {
  const response = await fetch(`${BASE_URL}/auth/${integrationName}/connection/${connectionId}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error('Failed to disconnect connection');
  }
  return response.json();
}

const fetchEntities = async (integrationKey) => {
  const response = await fetch(`${BASE_URL}/entity/${integrationKey}`);
  if (!response.ok) {
    throw new Error('Failed to fetch list of entities');
  }
  return response.json();
}

const fetchEntitySchema = async (integrationKey, entityKey) => {
  const response = await fetch(`${BASE_URL}/entity/${integrationKey}/${entityKey}`);
  if (!response.ok) {
    throw new Error('Failed to fetch entity schema');
  }
  const data = await response.json();
  return {
    entity_schema: data.schema
  }
}

const fetchEntityObjects = async (integrationKey, entityKey) => {
  const response = await fetch(`${BASE_URL}/object/${integrationKey}/${entityKey}`);
  if (!response.ok) {
    throw new Error('Failed to fetch entity objects');
  }
  return response.json();
}

const fetchEntityObject = async (integrationKey, entityKey, objectKey) => {
  const response = await fetch(`${BASE_URL}/object/${integrationKey}/${entityKey}/${objectKey}`);
  if (!response.ok) {
    throw new Error('Failed to fetch entity object');
  }
  return response.json();
}

export {
  fetchOptions,
  fetchIntegrations,
  archiveConnection,
  fetchDataCollections,
  fetchEntityDetails,
  searchEntityObjects,
  fetchAuthConfig,
  listenForStatus,
  fetchAuthStatus,
  fetchIntegrationDetails,
  fetchIntegrationConnection,
  disconnectConnection,
  fetchEntities,
  fetchEntitySchema,
  fetchEntityObjects,
  fetchEntityObject
};
