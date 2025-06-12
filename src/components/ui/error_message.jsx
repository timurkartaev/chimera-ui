export function ErrorMessage({ message }) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-md">
        <strong>Error:</strong> {message}
      </div>
    );
  }