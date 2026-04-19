"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
  icon?: any;
  description?: string;
}

interface CustomSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  className,
  disabled
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-1.5 w-full relative", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all outline-none text-left cursor-pointer select-none",
          isOpen ? "ring-4 ring-indigo-50 border-indigo-400 shadow-sm" : "hover:border-slate-300",
          disabled && "opacity-50 cursor-not-allowed bg-slate-50"
        )}
      >
        <div className="flex items-center gap-3 truncate">
          {selectedOption?.icon && (
            <selectedOption.icon className="h-4 w-4 text-indigo-500 shrink-0" />
          ) || (
             selectedOption ? null : <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-300",
            isOpen && "rotate-180 text-indigo-500"
          )} 
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute z-50 top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top"
          style={{ width: "100%" }}
        >
          <div className="p-1.5 max-h-[300px] overflow-y-auto scrollbar-none">
            {options.map((option) => {
              const isSelected = option.value === value;
              const Icon = option.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group/opt relative",
                    isSelected 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                    isSelected ? "bg-white text-indigo-600 shadow-sm" : "bg-slate-50 text-slate-400 group-hover/opt:bg-white group-hover/opt:text-slate-600"
                  )}>
                    {Icon ? <Icon className="h-4 w-4" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate leading-none mb-1">{option.label}</p>
                    {option.description && (
                       <p className="text-[10px] text-slate-400 font-medium truncate italic">{option.description}</p>
                    )}
                  </div>

                  {isSelected && (
                    <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white animate-in zoom-in duration-300">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
