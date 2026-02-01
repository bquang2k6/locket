import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const WeekPicker = ({ currentWeek, currentYear, isOpen, onClose, onSelect }) => {
    const [selectedYear, setSelectedYear] = useState(currentYear || 2026);
    // We initialize selectedWeek with the prop value.
    // When the modal opens, it will highlight this value.
    const [tempSelectedWeek, setTempSelectedWeek] = useState(currentWeek || 1);

    useEffect(() => {
        if (isOpen) {
            setSelectedYear(currentYear || 2026);
            setTempSelectedWeek(currentWeek || 1);
        }
    }, [isOpen, currentYear, currentWeek]);

    if (!isOpen) return null;

    const weekOptions = Array.from({ length: 52 }, (_, i) => i + 1);
    const yearOptions = [2025, 2026];

    const handleWeekClick = (week) => {
        setTempSelectedWeek(week);
        onSelect({ data: { week_of_year: week, year: selectedYear } });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm px-4">
            <div
                className="w-full max-w-xl bg-base-100 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-base-content/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-base-content">
                            Chọn tuần
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-base-200 rounded-full transition-all text-base-content/50 hover:text-base-content"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Year Selector */}
                <div className="flex gap-2 mb-6 p-1 bg-base-200 rounded-2xl">
                    {yearOptions.map((year) => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${selectedYear === year
                                ? "bg-base-100 text-primary shadow-sm"
                                : "text-base-content/40 hover:text-base-content/70 hover:bg-base-100/50"
                                }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>

                {/* Week Grid */}
                <div className="max-h-[50vh] overflow-y-auto overflow-x-hidden scrollbar-hide pr-1">
                    <div className="grid grid-cols-5 gap-3 pb-2">
                        {weekOptions.map((week) => (
                            <button
                                key={week}
                                onClick={() => handleWeekClick(week)}
                                className={`
                                    aspect-square flex items-center justify-center rounded-2xl text-sm font-bold transition-all duration-300
                                    ${tempSelectedWeek === week
                                        ? "bg-primary text-primary-content shadow-lg shadow-primary/20 scale-105"
                                        : "bg-base-200 text-base-content/60 hover:bg-primary/10 hover:text-primary hover:scale-110 active:scale-95"
                                    }
                                `}
                            >
                                {week}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-base-200 flex items-center justify-between px-2">
                    <p className="text-xs font-medium text-base-content/30 uppercase tracking-wider">
                        Trạng thái
                    </p>
                    <p className="text-sm font-bold text-primary">
                        Tuần {tempSelectedWeek}, {selectedYear}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WeekPicker;
