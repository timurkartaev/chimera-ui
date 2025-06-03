export function FormInput({ id, label, type, value, onChange, required, error }) {
  const handleTextChange = (e) => {
    onChange(id, e.target.value);
  };

  const handleCheckboxChange = (e) => {
    const val = e.target.value;
    onChange(id, val === '' ? null : val === 'true');
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {type === 'boolean' ? (
        <select
          id={id}
          name={id}
          value={value === null || value === undefined ? '' : value.toString()}
          onChange={handleCheckboxChange}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        >
          <option value="">-- Select --</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      ) : (
        <input
          type="text"
          id={id}
          name={id}
          value={value || ''}
          onChange={handleTextChange}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
      )}

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
