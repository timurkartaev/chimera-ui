import React from "react";

function toTitleCase(str) {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
}

function SchemaTable({ entity }) {
  const { fieldsSchema, create, update } = entity;
  const properties = fieldsSchema?.properties || {};
  const requiredFields = new Set(create?.requiredFields || []);
  const updatableFields = new Set(update?.fields || []);

  return (
    <div className="p-4 border rounded bg-white text-sm">
      <h2 className="text-lg font-semibold mb-4">{entity.name} Schema</h2>
      <div className="relative overflow-auto max-h-[600px]">
        <table className="w-full text-left border">
          <thead className="bg-gray-100 border-b sticky top-0 z-10">
            <tr>
              <th className="p-2 bg-gray-100">Field ID</th>
              <th className="p-2 bg-gray-100">Label</th>
              <th className="p-2 bg-gray-100">Type</th>
              <th className="p-2 bg-gray-100">Updatable</th>
              <th className="p-2 bg-gray-100">Readonly</th>
              <th className="p-2 bg-gray-100">Reference</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(properties).map(([fieldId, field]) => {
              const type = field.format ? `${field.type} (${field.format})` : field.type;
              const label = field.title || toTitleCase(fieldId);
              return (
                <tr key={fieldId} className="border-b">
                  <td className="p-2 font-mono text-xs">
                    <div className="flex items-center gap-1">
                      {requiredFields.has(fieldId) && (
                        <span className="text-red-500 font-bold text-sm">*</span>
                      )}
                      <span>{fieldId}</span>
                    </div>
                  </td>
                  <td className="p-2">{label}</td>
                  <td className="p-2">{type}</td>
                  <td className="p-2">
                    {updatableFields.has(fieldId) && (
                      <span className="text-green-600 font-semibold">true</span>
                    )}
                  </td>
                  <td className="p-2">
                    {field.readOnly && <span className="text-green-600 font-semibold">true</span>}
                  </td>
                  <td className="p-2">
                    {field.referenceCollection?.key && (
                      <span className="text-blue-600">📎 {field.referenceCollection.key}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SchemaTable;
