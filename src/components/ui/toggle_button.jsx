export function ToggleButton({ connected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${connected ? 'bg-blue-500' : 'bg-gray-300'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${connected ? 'translate-x-5' : 'translate-x-1'
          }`}
      />
    </button>
  );
}
