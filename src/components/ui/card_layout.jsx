export function CardLayout({ logo, name, metaLeft, metaRight, footerLeft, footerRight }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden mb-2">
                    {logo}
                </div>
                <h3 className="text-md font-semibold text-center">{name}</h3>
            </div>

            <div className="px-4 py-2 text-sm text-gray-700 grid grid-cols-2 gap-2">
                <div>{metaLeft}</div>
                <div>{metaRight}</div>
            </div>

            <div className="mt-auto px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">{footerLeft}</div>
                <div className="ml-4">{footerRight}</div>
            </div>
        </div>
    );
}
