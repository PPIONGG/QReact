import React, { useEffect, useState } from 'react';
import { getOCRHistory } from '../services/api';
import { Icons } from './Icon';

interface OCRPageProps {
    onToggleSidebar: () => void;
}

export const OCRPage: React.FC<OCRPageProps> = ({ onToggleSidebar }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const res = await getOCRHistory();
            setHistory(res.items || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-auto bg-white rounded-2xl dark:bg-[#000C17] p-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <Icons.Menu className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-bold text-[#B30000]">OCR History</h1>
            </div>
            <p className="text-slate-500 mb-6 pl-12">Review past document extractions</p>

            {error && (
                <div className="p-4 mb-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full text-center py-10">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="col-span-full text-center p-10 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                        No OCR history found. Use the Chat OCR mode to extract data.
                    </div>
                ) : (
                    history.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        {item.extraction_type}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-medium truncate mb-1" title={item.source_filename}>
                                {item.source_filename}
                            </h3>
                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Confidence: {(item.confidence_score * 100).toFixed(0)}%
                            </div>

                            {/* Preview of data */}
                            <div className="bg-slate-50 dark:bg-black/20 p-3 rounded text-xs font-mono overflow-hidden h-24 text-slate-600 dark:text-slate-400">
                                {JSON.stringify(item.extracted_data, null, 2)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
