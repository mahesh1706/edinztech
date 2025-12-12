import { useState } from 'react';

export default function Tabs({ tabs, className = '' }) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className={className}>
            <div className="flex border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === index
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-light hover:text-text hover:border-gray-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="py-6">
                {tabs[activeTab].content}
            </div>
        </div>
    );
}
