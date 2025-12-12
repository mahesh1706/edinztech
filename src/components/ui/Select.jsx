import { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Custom Select Component
 * 
 * Features:
 * - Brand styling (White bg, Dark gray text, Orange/Blue accents)
 * - Custom dropdown with absolute positioning (z-index fix)
 * - Click outside handling
 * - Keyboard navigation
 */
const Select = forwardRef(({
    label,
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    error,
    className = "",
    name
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to handle both string options and object options {label, value}
    const getOptionLabel = (option) => (typeof option === 'object' && option !== null && 'label' in option) ? option.label : option;
    const getOptionValue = (option) => (typeof option === 'object' && option !== null && 'value' in option) ? option.value : option;

    const handleSelect = (option) => {
        onChange(getOptionValue(option));
        setIsOpen(false);
    };

    // Find selected option object to display its label, otherwise show value (backward compat) or placeholder
    const selectedOption = options.find(opt => getOptionValue(opt) === value);
    const displayValue = selectedOption ? getOptionLabel(selectedOption) : (value || placeholder);

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-text mb-1">
                    {label}
                </label>
            )}

            <div
                className={`
                    relative w-full px-4 py-2 bg-white border rounded-lg cursor-pointer
                    flex items-center justify-between transition-colors
                    ${error ? 'border-danger' : isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300 hover:border-primary'}
                `}
                onClick={() => setIsOpen(!isOpen)}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        setIsOpen(!isOpen);
                    }
                }}
            >
                <span className={`block truncate ${!value ? 'text-gray-400' : 'text-text'}`}>
                    {displayValue}
                </span>

                <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-primary' : ''}`}
                />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                        {options.map((option, index) => {
                            const isSelected = getOptionValue(option) === value;
                            return (
                                <div
                                    key={index}
                                    className={`
                                        px-4 py-2 text-sm cursor-pointer transition-colors
                                        ${isSelected
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-text hover:bg-orange-50 hover:text-primary'
                                        }
                                    `}
                                    onClick={() => handleSelect(option)}
                                >
                                    {getOptionLabel(option)}
                                </div>
                            );
                        })}
                        {options.length === 0 && (
                            <div className="px-4 py-2 text-sm text-gray-500 italic">
                                No options available
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Hidden native input for form libraries if needed, though we use Controller */}
            <input
                type="hidden"
                name={name}
                value={value || ''}
                ref={ref}
                readOnly
            />

            {error && <p className="mt-1 text-sm text-danger">{error}</p>}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
