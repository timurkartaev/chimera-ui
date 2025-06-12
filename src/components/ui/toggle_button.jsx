export function ToggleButton({ connected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!connected)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        connected ? 'bg-blue-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          connected ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
