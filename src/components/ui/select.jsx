import * as React from "react";

const SelectContext = React.createContext({
  value: "",
  setValue: () => {},
  open: false,
  setOpen: () => {},
  onValueChange: () => {},
});

const Select = React.forwardRef(({ children, defaultValue, value, onValueChange, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const [open, setOpen] = React.useState(false);
  
  // Use controlled value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = React.useCallback((newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  }, [value, onValueChange]);
  
  return (
    <SelectContext.Provider value={{ 
      value: currentValue, 
      setValue: handleValueChange, 
      open, 
      setOpen,
      onValueChange 
    }}>
      <div ref={ref} className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef(({ children, className = "", ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext);
  
  const handleKeyDown = React.useCallback((event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(!open);
    }
  }, [open, setOpen]);
  
  return (
    <button
      ref={ref}
      onClick={() => setOpen(!open)}
      onKeyDown={handleKeyDown}
      aria-expanded={open}
      aria-haspopup="listbox"
      className={`flex items-center justify-between w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
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
        aria-hidden="true"
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
    <span ref={ref} className="block truncate" {...props}>
      {value || placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef(({ className = "", ...props }, ref) => {
  const { open, setOpen, setValue } = React.useContext(SelectContext);
  const contentRef = React.useRef(null);
  
  // Use the forwarded ref or create our own
  const finalRef = ref || contentRef;
  
  // Handle clicking outside to close the dropdown
  React.useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (event) => {
      if (finalRef?.current && !finalRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen, finalRef]);
  
  // If not open, don't render anything
  if (!open) return null;
  
  return (
    <div
      ref={finalRef}
      role="listbox"
      className={`absolute z-50 mt-1 max-h-60 min-w-[8rem] w-full overflow-auto rounded-md border border-gray-200 bg-white text-base shadow-lg focus:outline-none dark:bg-slate-700 dark:border-slate-600 ${className}`}
      {...props}
    >
      <div className="py-1">
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
  const { value: selectedValue } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;
  
  const handleClick = React.useCallback(() => {
    if (onSelect) {
      onSelect(value);
    }
  }, [onSelect, value]);
  
  const handleKeyDown = React.useCallback((event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);
  
  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      className={`relative flex w-full cursor-default select-none items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600 ${isSelected ? "bg-blue-50 text-blue-900 dark:bg-slate-600 dark:text-white" : "text-gray-900 dark:text-gray-100"} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...props}
    >
      <span className="block truncate">{children}</span>
      {isSelected && (
        <span className="absolute inset-y-0 right-2 flex items-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };