import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';
import { OCRExtractionResponse } from '../types';

interface OCREditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Record<string, any>, isEdited: boolean) => void;
    extractionResult: OCRExtractionResponse | null;
}

export const OCREditorModal: React.FC<OCREditorModalProps> = ({
    isOpen,
    onClose,
    onSave,
    extractionResult
}) => {
    const [jsonContent, setJsonContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (extractionResult && isOpen) {
            setJsonContent(JSON.stringify(extractionResult.extracted_data, null, 2));
            setError(null);
        }
    }, [extractionResult, isOpen]);

    if (!isOpen || !extractionResult) return null;

    const handleSave = (useEdited: boolean) => {
        if (useEdited) {
            try {
                const parsed = JSON.parse(jsonContent);
                onSave(parsed, true);
            } catch (e) {
                setError("Invalid JSON format. Please fix errors before saving.");
            }
        } else {
            // Save original
            onSave(extractionResult.extracted_data, false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Extraction</h2>
                        <p className="text-sm text-slate-500">Document Type: {extractionResult.document_type} • Confidence: {(extractionResult.confidence_score * 100).toFixed(0)}%</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <Icons.X className="h-6 w-6 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor only */}
                    <div className="w-full p-4 flex flex-col bg-white dark:bg-slate-900">
                        <div className="mb-2 flex justify-between items-center text-sm font-medium text-slate-500">
                            <span>Extracted Data (JSON)</span>
                            {error && <span className="text-red-500">{error}</span>}
                        </div>
                        <textarea
                            value={jsonContent}
                            onChange={(e) => setJsonContent(e.target.value)}
                            className="flex-1 w-full font-mono text-sm p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            spellCheck={false}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleSave(false)}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                    >
                        Save with Source
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        className="px-4 py-2 rounded-lg bg-[#B30000] text-white hover:bg-[#8a0000] font-medium shadow-sm transition-colors"
                    >
                        Save with Edited
                    </button>
                </div>
            </div>
        </div>
    );
};
