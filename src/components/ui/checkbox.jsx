import * as React from "react";

const Checkbox = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={`h-4 w-4 rounded border border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-blue-500 ${className}`}
        ref={ref}
        {...props}
      />
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox }; 