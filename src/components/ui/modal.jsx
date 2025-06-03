export function Modal({ children, onClose }) {
    return (
        <>
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
                aria-label="Close modal"
            >
                ×
            </button>
            {children}
        </>
    );
}
