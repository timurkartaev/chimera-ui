export function Button({children, className = "", variant = "default", onClick}) {
    const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors";
    const variantStyles = {
        default: "bg-blue-500 text-white hover:bg-blue-600",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        // cancel variant text is black with transparent background, when hover it  becomes a little gray
        secondary: "bg-transparent text-black hover:bg-gray-100",
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