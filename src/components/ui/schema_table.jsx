import React, { useState } from "react";

function toTitleCase(str) {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
}

function renderFieldType(field) {
  if (field.type === 'object' && field.properties) {
    return 'object';
  }
  if (field.type === 'array' && field.items) {
    return field.items.type === 'object' ? 'array of objects' : `array of ${field.items.type}`;
  }
  return field.format ? `${field.type} (${field.format})` : field.type;
}

function formatValue(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'object' && value !== null) {
    return value.name || value.title || value.id || JSON.stringify(value);
  }
  return String(value);
}

function PossibleValues({ values }) {
  if (!values || values.length === 0) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const displayValues = isExpanded ? values : values.slice(0, 3);

  const getColorClass = (index) => {
    // Light theme colors
    const baseColors = [
      'blue', 'green', 'indigo', 'purple'
    ];

    // Using lighter shades for better visibility
    const shades = ['100', '200'];
    const textShades = ['600', '700'];

    const colorIndex = index % baseColors.length;
    const shadeIndex = Math.floor(index / baseColors.length) % shades.length;
    const baseColor = baseColors[colorIndex];
    const shade = shades[shadeIndex];
    const textShade = textShades[shadeIndex];

    return {
      bg: `bg-${baseColor}-${shade}`,
      text: `text-${baseColor}-${textShade}`,
      border: `border-${baseColor}-${shade}`
    };
  };

  return (
    <div className="text-xs">
      <div className="flex flex-wrap gap-1">
        {displayValues.map((value, index) => {
          const colorClass = getColorClass(index);
          return (
            <span
              key={index}
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass.bg} ${colorClass.text}`}
            >
              {formatValue(value)}
            </span>
          );
        })}
        {values.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Show less' : `+${values.length - 3} more`}
          </button>
        )}
      </div>
    </div>
  );
}

function SchemaTableRow({
  fieldId,
  field,
  level,
  requiredFields,
  updatableFields,
  parentPath = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const type = renderFieldType(field);
  const label = field.title || toTitleCase(fieldId);
  const isNested = field.type === 'object' && field.properties;
  const isArrayOfObjects = field.type === 'array' && field.items?.type === 'object';
  const fullPath = parentPath ? `${parentPath}.${fieldId}` : fieldId;
  const hasChildren = (isNested && field.properties) || (isArrayOfObjects && field.items?.properties);

  // Light background colors
  const bgColor = level % 2 === 0 ? 'bg-white' : 'bg-gray-50';

  return (
    <>
      <tr className={`border-b border-gray-200 relative hover:bg-gray-100 transition-colors ${bgColor}`}>
        <td className="p-2 font-mono text-xs text-gray-900">
          <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 1.5}rem` }}>
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}
              >
                ▶
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            {requiredFields.has(fullPath) && (
              <span className="text-red-500 font-bold text-sm">*</span>
            )}
            <span>{fieldId}</span>
          </div>
        </td>
        <td className="p-2 text-gray-900">{label}</td>
        <td className="p-2">
          <div className="flex items-center gap-1 text-gray-900">
            <span>{type}</span>
            {hasChildren && (
              <span className="text-gray-500 text-xs">({isExpanded ? 'expanded' : 'collapsed'})</span>
            )}
          </div>
        </td>
        <td className="p-2">
          {updatableFields.has(fullPath) && (
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
        <td className="p-2">
          <PossibleValues values={field.referenceRecords} />
        </td>
      </tr>
      {isExpanded && hasChildren && (
        <>
          {isNested && field.properties &&
            Object.entries(field.properties).map(([childId, childField]) => (
              <SchemaTableRow
                key={`${fullPath}.${childId}`}
                fieldId={childId}
                field={childField}
                level={level + 1}
                requiredFields={requiredFields}
                updatableFields={updatableFields}
                parentPath={fullPath}
              />
            ))}
          {isArrayOfObjects && field.items?.properties &&
            Object.entries(field.items.properties).map(([childId, childField]) => (
              <SchemaTableRow
                key={`${fullPath}.${childId}`}
                fieldId={childId}
                field={childField}
                level={level + 1}
                requiredFields={requiredFields}
                updatableFields={updatableFields}
                parentPath={fullPath}
              />
            ))}
        </>
      )}
    </>
  );
}

function SchemaTable({ entity }) {
  const { fieldsSchema, create, update } = entity;
  const properties = fieldsSchema?.properties || {};
  const requiredFields = new Set(create?.requiredFields || []);
  const updatableFields = new Set(update?.fields || []);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-auto max-h-[600px]">
      <table className="w-full text-left">
        <thead className="sticky top-0 z-20">
          <tr className="bg-white shadow-sm">
            <th className="p-2 text-sm font-medium text-gray-700 bg-white border-b border-gray-200">Field ID</th>
            <th className="p-2 text-sm font-medium text-gray-700 bg-white border-b border-gray-200">Label</th>
            <th className="p-2 text-sm font-medium text-gray-700 bg-white border-b border-gray-200">Type</th>
            <th className="p-2 text-sm font-medium text-gray-700 bg-white border-b border-gray-200">Updatable</th>
            <th className="p-2 text-sm font-medium text-gray-700 bg-white border-b border-gray-200">Readonly</th>
            <th className="p-2 text-sm font-medium text-gray-700 bg-white border-b border-gray-200">Reference</th>
            <th className="p-2 text-sm font-medium text-gray-700 bg-white border-b border-gray-200">Possible Values</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(properties).map(([fieldId, field]) => (
            <SchemaTableRow
              key={fieldId}
              fieldId={fieldId}
              field={field}
              level={0}
              requiredFields={requiredFields}
              updatableFields={updatableFields}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SchemaTable;
