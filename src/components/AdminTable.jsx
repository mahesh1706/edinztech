export default function AdminTable({ headers, children }) {
    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        {headers.map((header, index) => (
                            <th key={index} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {children}
                </tbody>
            </table>
        </div>
    );
}
