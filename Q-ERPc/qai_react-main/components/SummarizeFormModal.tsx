import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';

export interface SummarizeFormData {
    productionType?: 'Finished product' | 'Work in process';
    timeFormat: 'Year' | 'Year and month';
    startDay: number;
    endDay: number;
    startMonth: number;
    endMonth: number;
    startYear: number;
    endYear: number;
}

interface SummarizeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: SummarizeFormData) => void;
    topic?: string;
}

export const SummarizeFormModal: React.FC<SummarizeFormModalProps> = ({ isOpen, onClose, onConfirm, topic }) => {
    const [productionType, setProductionType] = useState<'Finished product' | 'Work in process'>('Finished product');
    const [timeFormat, setTimeFormat] = useState<'Year' | 'Year and month'>('Year');

    // Default to current date in Buddhist Era (AD + 543)
    const now = new Date();
    const currentYearBE = now.getFullYear() + 543;

    // Independent State for From/To
    const [startDay, setStartDay] = useState<number | ''>(1);
    const [startMonth, setStartMonth] = useState(1);
    const [startYear, setStartYear] = useState<number | ''>(currentYearBE);

    const [endDay, setEndDay] = useState<number | ''>(31);
    const [endMonth, setEndMonth] = useState(12);
    const [endYear, setEndYear] = useState<number | ''>(currentYearBE);

    // Reset form when opened
    useEffect(() => {
        if (isOpen) {
            setProductionType('Finished product');
            setTimeFormat('Year');

            const n = new Date();
            setStartDay(1);
            setStartMonth(1);
            setStartYear(n.getFullYear() + 543);

            setEndDay(n.getDate());
            setEndMonth(n.getMonth() + 1);
            setEndYear(n.getFullYear() + 543);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm({
            productionType: topic === 'Production' ? productionType : undefined,
            timeFormat,
            startDay: Number(startDay) || 1,
            endDay: Number(endDay) || 1,
            startMonth,
            endMonth,
            startYear: Number(startYear) || currentYearBE,
            endYear: Number(endYear) || currentYearBE
        });
    };

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-[#001529] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 transform transition-all scale-100">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Summarize Settings
                        {topic && <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">({topic})</span>}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <Icons.X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">

                    {/* Production Type (Conditional) */}
                    {topic === 'Production' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Production Type</label>
                            <div className="relative">
                                <select
                                    value={productionType}
                                    onChange={(e) => setProductionType(e.target.value as any)}
                                    className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B30000] focus:border-transparent outline-none transition-all"
                                >
                                    <option value="Finished product">Finished product</option>
                                    <option value="Work in process">Work in process</option>
                                </select>
                                <Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Time Period */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Period (B.E.)</label>

                        {/* From Date */}
                        <div className="space-y-1">
                            <span className="text-xs text-slate-500">From</span>
                            <div className="grid grid-cols-3 gap-2">
                                {/* Day */}
                                <input
                                    type="number"
                                    min={1} max={31}
                                    value={startDay}
                                    onChange={(e) => setStartDay(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="DD"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B30000] outline-none text-center"
                                />
                                {/* Month */}
                                <div className="relative">
                                    <select
                                        value={startMonth}
                                        onChange={(e) => setStartMonth(Number(e.target.value))}
                                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B30000] outline-none"
                                    >
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </div>
                                {/* Year */}
                                <input
                                    type="number"
                                    value={startYear}
                                    onChange={(e) => setStartYear(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="YYYY"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B30000] outline-none text-center"
                                />
                            </div>
                        </div>

                        {/* To Date */}
                        <div className="space-y-1">
                            <span className="text-xs text-slate-500">To</span>
                            <div className="grid grid-cols-3 gap-2">
                                {/* Day */}
                                <input
                                    type="number"
                                    min={1} max={31}
                                    value={endDay}
                                    onChange={(e) => setEndDay(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="DD"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B30000] outline-none text-center"
                                />
                                {/* Month */}
                                <div className="relative">
                                    <select
                                        value={endMonth}
                                        onChange={(e) => setEndMonth(Number(e.target.value))}
                                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B30000] outline-none"
                                    >
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </div>
                                {/* Year */}
                                <input
                                    type="number"
                                    value={endYear}
                                    onChange={(e) => setEndYear(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="YYYY"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B30000] outline-none text-center"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Time Format (Renamed from Timeframe) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Format</label>
                        <div className="relative">
                            <select
                                value={timeFormat}
                                onChange={(e) => setTimeFormat(e.target.value as any)}
                                className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B30000] focus:border-transparent outline-none transition-all"
                            >
                                <option value="Year">Year</option>
                                <option value="Year and month">Year and month</option>
                            </select>
                            <Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2 rounded-lg bg-[#B30000] text-white hover:bg-[#8a0000] transition-colors font-medium shadow-sm"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
