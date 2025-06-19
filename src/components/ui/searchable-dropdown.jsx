'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * A dropdown component with search functionality
 * @param {Object} props - Component props
 * @param {Array} props.options - Array of options with value and label properties
 * @param {string|Array} props.value - Currently selected value(s)
 * @param {Function} props.onChange - Callback when value changes
 * @param {string} props.placeholder - Placeholder for the input
 * @param {boolean} props.required - Whether the field is required
 * @param {boolean} props.multiSelect - Whether multiple options can be selected
 * @param {number} props.maxSelections - Maximum number of selections (only used if multiSelect is true)
 */
const SearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Search...", 
  required = false,
  disabled = false,
  name = "",
  id = "",
  multiSelect = false,
  maxSelections = 5
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  
  // Convert value to array if multiSelect is true
  const selectedValues = multiSelect ? (Array.isArray(value) ? value : []) : (value ? [value] : []);
  
  // Find the selected options
  const selectedOptions = options.filter(option => selectedValues.includes(option.value));
  
  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchTerm("");
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    if (multiSelect) {
      // For multi-select
      const newValues = [...selectedValues];
      const optionIndex = newValues.indexOf(option.value);
      
      if (optionIndex === -1) {
        // Add option if not selected and under max limit
        if (newValues.length < maxSelections) {
          newValues.push(option.value);
          onChange({ target: { name, value: newValues } });
        }
      } else {
        // Remove option if already selected
        newValues.splice(optionIndex, 1);
        onChange({ target: { name, value: newValues } });
      }
      
      // Clear search but keep dropdown open for multi-select
      setSearchTerm("");
      // Focus back on input after selection
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    } else {
      // For single select
      onChange({ target: { name, value: option.value } });
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const removeOption = (optionValue, e) => {
    e.stopPropagation(); // Prevent dropdown from opening
    
    if (multiSelect) {
      const newValues = selectedValues.filter(v => v !== optionValue);
      onChange({ target: { name, value: newValues } });
    } else {
      onChange({ target: { name, value: "" } });
    }
  };

  const toggleDropdown = (e) => {
    // Don't toggle if clicking on a chip or its remove button
    if (e?.target?.closest('.chip-container')) {
      return;
    }
    
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && inputRef.current) {
        // Focus the input when opening dropdown
        setTimeout(() => inputRef.current.focus(), 0);
      }
    }
  };

  // Display text for the input
  const getDisplayValue = () => {
    if (isOpen) {
      return searchTerm;
    }
    
    if (multiSelect) {
      return ""; // Input shows empty when chips are displayed
    } else {
      return selectedOptions[0]?.label || "";
    }
  };

  // Check if maximum selections reached
  const isMaxReached = multiSelect && selectedValues.length >= maxSelections;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className={`flex flex-wrap items-center w-full rounded-md border border-input bg-background ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
        onClick={toggleDropdown}
      >
        {/* Selected chips for multi-select */}
        {multiSelect && selectedOptions.map(option => (
          <div 
            key={option.value}
            className="chip-container flex items-center m-1 px-2 py-1 rounded bg-primary text-primary-foreground text-sm"
          >
            <span className="mr-1">{option.label}</span>
            <button
              type="button"
              onClick={(e) => removeOption(option.value, e)}
              className="text-primary-foreground/70 hover:text-primary-foreground focus:outline-none ml-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        <Input
          ref={inputRef}
          type="text"
          value={getDisplayValue()}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={multiSelect && selectedValues.length > 0 ? "Search more..." : placeholder}
          className="flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[120px]"
          required={required && selectedValues.length === 0}
          disabled={disabled}
          name={name}
          id={id}
          onFocus={() => setIsOpen(true)}
          aria-expanded={isOpen}
          role="combobox"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="px-3 flex-shrink-0 flex items-center gap-2">
          {/* Clear all button for multi-select */}
          {/* {multiSelect && selectedValues.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ target: { name, value: [] } });
              }}
              className="text-muted-foreground hover:text-foreground text-xs"
              title="Clear all"
            >
              Clear
            </button>
          )} */}
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
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-popover shadow-lg max-h-60 overflow-y-auto">
          {multiSelect && (
            <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border bg-muted/50">
              {selectedValues.length} of {maxSelections} selected
              {isMaxReached && <span className="text-amber-500 ml-2">Maximum reached</span>}
            </div>
          )}
          <div className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                const isDisabled = multiSelect && isMaxReached && !isSelected;
                
                return (
                  <div
                    key={option.value}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                      isSelected ? 'bg-accent text-accent-foreground font-medium' : ''
                    } ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => !isDisabled && handleSelect(option)}
                  >
                    {multiSelect && (
                      <span className="mr-2 inline-block w-4">
                        {isSelected ? '✓' : ''}
                      </span>
                    )}
                    {option.label}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
