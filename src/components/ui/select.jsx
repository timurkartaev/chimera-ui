import * as React from "react";

const SelectContext = React.createContext({
  value: "",
  setValue: () => {},
  open: false,
  setOpen: () => {},
});

const Select = React.forwardRef(({ children, defaultValue, ...props }, ref) => {
  const [value, setValue] = React.useState(defaultValue || "");
  const [open, setOpen] = React.useState(false);
  
  return (
    <SelectContext.Provider value={{ value, setValue, open, setOpen }}>
      <div ref={ref} className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef(({ children, className = "", ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext);
  
  return (
    <button
      ref={ref}
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`ml-2 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef(({ placeholder, ...props }, ref) => {
  const { value } = React.useContext(SelectContext);
  
  return (
    <span ref={ref} {...props}>
      {value || placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef(({ className = "", ...props }, ref) => {
  const { open, setOpen, setValue } = React.useContext(SelectContext);
  
  // If not open, don't render anything
  if (!open) return null;
  
  // Handle clicking outside to close the dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setOpen]);
  
  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-1 max-h-60 min-w-[8rem] w-full overflow-hidden rounded-md border border-gray-200 bg-white text-sm shadow-md ${className}`}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(props.children, child => {
          return React.isValidElement(child)
            ? React.cloneElement(child, {
                onSelect: (value) => {
                  setValue(value);
                  setOpen(false); // Close dropdown after selection
                }
              })
            : child;
        })}
      </div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ children, value, className = "", onSelect, ...props }, ref) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(value);
    }
  };
  
  return (
    <div
      ref={ref}
      className={`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 ${className}`}
      onClick={handleClick}
      {...props}
    >
      <span>{children}</span>
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }; 