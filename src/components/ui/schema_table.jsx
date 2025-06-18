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
    // Base colors with different shades
    const baseColors = [
      'blue', 'green', 'yellow', 'purple', 'pink', 'indigo',
      'red', 'orange', 'teal', 'cyan', 'lime', 'emerald',
      'violet', 'fuchsia', 'rose', 'amber', 'sky', 'slate'
    ];
    
    // Generate 50+ color combinations by varying shades
    const shades = ['50', '100', '200'];
    const textShades = ['600', '700', '800'];
    
    const colorIndex = index % baseColors.length;
    const shadeIndex = Math.floor(index / baseColors.length) % shades.length;
    
    const bgColor = `bg-${baseColors[colorIndex]}-${shades[shadeIndex]}`;
    const textColor = `text-${baseColors[colorIndex]}-${textShades[shadeIndex]}`;
    
    return `${bgColor} ${textColor}`;
  };

  return (
    <div className="text-xs">
      <div className="flex flex-wrap gap-1">
        {displayValues.map((value, index) => (
          <span 
            key={index}
            className={`px-1.5 py-0.5 rounded ${getColorClass(index)}`}
          >
            {formatValue(value)}
          </span>
        ))}
        {values.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 hover:text-blue-600"
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

  // Calculate background color based on nesting level
  const bgColor = level % 2 === 0 ? 'bg-blue-50/30' : 'bg-orange-50/30';

  return (
    <>
      <tr className={`border-b relative hover:bg-gray-100/50 transition-colors ${bgColor}`}>
        <td className="p-2 font-mono text-xs">
          <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 1.5}rem` }}>
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}
              >
                ›
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            {requiredFields.has(fullPath) && (
              <span className="text-red-500 font-bold text-sm">*</span>
            )}
            <span>{fieldId}</span>
          </div>
        </td>
        <td className="p-2">{label}</td>
        <td className="p-2">
          <div className="flex items-center gap-1">
            <span>{type}</span>
            {hasChildren && (
              <span className="text-gray-400 text-xs">({isExpanded ? 'expanded' : 'collapsed'})</span>
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
      {isExpanded && isNested && field.properties && 
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
      {isExpanded && isArrayOfObjects && field.items?.properties && 
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
  );
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
              <th className="p-2 bg-gray-100">Possible Values</th>
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
    </div>
  );
}

export default SchemaTable;
