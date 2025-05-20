const fetchOptions = async () => {
  const response = await fetch('http://localhost:8000/empty-response');
  if (!response.ok) {
    throw new Error('Failed to fetch options');
  }
  return response.json();
};

export { fetchOptions };