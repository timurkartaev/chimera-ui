export function Button({children, className = "", variant = "default", onClick}) {
    const baseStyles = "px-4 py-2 rounded-md font-medium text-white transition-colors";
    const variantStyles = {
        default: "bg-blue-500 hover:bg-blue-600",
        destructive: "bg-red-500 hover:bg-red-600",
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}