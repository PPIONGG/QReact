import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icons } from './Icon';
import { Tooltip } from './Tooltip';
import {
    AppMode,
    SubMode,
    Role,
    Message,
    ChatSession,
    OCRType,
    SummarizeTopic
} from '../types';

interface ChatPageProps {
    // Navigation / Layout
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;

    // Session State
    currentSessionId: string | null;
    sessions: ChatSession[];

    // Chat State
    messages: Message[];
    isLoading: boolean;
    input: string;
    setInput: (val: string) => void;

    // Attachments
    attachments: { name: string; mimeType: string; data: string }[];
    onRemoveAttachment: (index: number) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;

    // Config / Modes
    mode: AppMode;
    subMode: SubMode;
    topic: string | undefined;
    onModeChange: (newMode: AppMode, newSubMode: SubMode, newTopic?: string) => void;

    // Model Settings
    model: string;
    setModel: (m: string) => void;
    language: 'en' | 'th';
    setLanguage: (l: 'en' | 'th') => void;

    // Actions
    onSendMessage: () => void;
    onFeedback: (messageId: string, type: 'like' | 'dislike') => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
    isSidebarOpen,
    onToggleSidebar,
    currentSessionId,
    sessions,
    messages,
    isLoading,
    input,
    setInput,
    attachments,
    onRemoveAttachment,
    onFileUpload,
    fileInputRef,
    mode,
    subMode,
    topic,
    onModeChange,
    model,
    setModel,
    language,
    setLanguage,
    onSendMessage,
    onFeedback
}) => {
    const [isModePanelOpen, setIsModePanelOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getModeDescription = (m: AppMode, sm: SubMode, t?: string) => {
        if (m === AppMode.OTHER) {
            return "Ask me anything. I can help with general tasks, writing, and analysis outside the ERP context.";
        } else if (sm === SubMode.SUMMARIZE) {
            return `I will analyze ${t || 'Production'} data using Q-ERP data. Ask for insights, trends, or specific record details.`;
        } else if (sm === SubMode.KNOWLEDGE) {
            return "Ask questions about the Q-ERP User Guide, workflows, and system configuration.";
        } else if (sm === SubMode.OCR) {
            return `Upload an image of a ${t || 'Invoice'}. I will extract key fields and structure the data for you.`;
        }
        return "Select a mode to get started.";
    };

    const renderModeSelector = () => (
        <div className="flex flex-col gap-2 w-full max-w-4xl mx-auto">
            {/* Top Level Modes */}
            <div className="flex flex-wrap gap-2 items-center mb-2">
                <Tooltip content={getModeDescription(AppMode.Q_ERP, SubMode.SUMMARIZE, 'Production')}>
                    <button
                        onClick={() => onModeChange(AppMode.Q_ERP, SubMode.OTHER)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border shadow-sm flex flex-col items-center justify-center gap-2 ${mode === AppMode.Q_ERP
                            ? 'bg-[#B30000] text-white border-[#B30000]'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Icons.Cpu className="w-3.5 h-3.5" />
                            Q-ERP
                        </span>
                    </button>
                </Tooltip>

                <Tooltip content={getModeDescription(AppMode.OTHER, SubMode.OTHER)}>
                    <button
                        onClick={() => onModeChange(AppMode.OTHER, SubMode.OTHER)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border shadow-sm flex flex-col items-center justify-center gap-2 ${mode === AppMode.OTHER
                            ? 'bg-[#B30000] text-white border-[#B30000]'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Icons.MessageSquare className="w-3.5 h-3.5" />
                            Other
                        </span>
                    </button>
                </Tooltip>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsModePanelOpen(!isModePanelOpen)}
                    className={`p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:text-[#B30000] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto sm:ml-0`}
                    title={isModePanelOpen ? "Hide Mode Selection" : "Show Mode Selection"}
                >
                    <Icons.ChevronDown className={`h-5 w-5 transition-transform duration-300 ${!isModePanelOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Collapsible Area (Submodes & Topics) */}
            <div className={`transition-all duration-200 ease-in-out ${isModePanelOpen ? 'max-h-96 opacity-100 mb-4 overflow-visible' : 'max-h-0 opacity-0 mb-0 overflow-hidden'}`}>
                <div className="space-y-2">

                    {/* Sub Modes for Q-ERP */}
                    {mode === AppMode.Q_ERP && (
                        <div className="flex flex-wrap gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-200">
                            <Tooltip content={getModeDescription(AppMode.Q_ERP, SubMode.SUMMARIZE, topic)}>
                                <button
                                    onClick={() => onModeChange(AppMode.Q_ERP, SubMode.SUMMARIZE)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${subMode === SubMode.SUMMARIZE
                                        ? 'bg-[#B30000] text-white border-[#B30000]'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    Summarize
                                </button>
                            </Tooltip>

                            <Tooltip content={getModeDescription(AppMode.Q_ERP, SubMode.KNOWLEDGE)}>
                                <button
                                    onClick={() => onModeChange(AppMode.Q_ERP, SubMode.KNOWLEDGE)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${subMode === SubMode.KNOWLEDGE
                                        ? 'bg-[#B30000] text-white border-[#B30000]'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Icons.Book className="w-3 h-3" />
                                        Knowledge
                                    </span>
                                </button>
                            </Tooltip>

                            <Tooltip content={getModeDescription(AppMode.Q_ERP, SubMode.OCR, topic)}>
                                <button
                                    onClick={() => onModeChange(AppMode.Q_ERP, SubMode.OCR)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${subMode === SubMode.OCR
                                        ? 'bg-[#B30000] text-white border-[#B30000]'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Icons.ScanText className="w-3 h-3" />
                                        OCR
                                    </span>
                                </button>
                            </Tooltip>
                        </div>
                    )}

                    {/* Topics for Summarize */}
                    {mode === AppMode.Q_ERP && subMode === SubMode.SUMMARIZE && (
                        <div className="flex flex-wrap gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-200">
                            {Object.values(SummarizeTopic).map((t) => (
                                <Tooltip key={t} content={getModeDescription(AppMode.Q_ERP, SubMode.SUMMARIZE, t)}>
                                    <button
                                        onClick={() => onModeChange(AppMode.Q_ERP, SubMode.SUMMARIZE, t)}
                                        className={`px-2.5 py-1 rounded-md text-xs transition-colors border ${topic === t
                                            ? 'bg-[#B30000] text-white border-[#B30000]'
                                            : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                    )}

                    {/* Topics for OCR */}
                    {mode === AppMode.Q_ERP && subMode === SubMode.OCR && (
                        <div className="flex flex-wrap gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-200">
                            {Object.values(OCRType).map((t) => (
                                <Tooltip key={t} content={getModeDescription(AppMode.Q_ERP, SubMode.OCR, t)}>
                                    <button
                                        onClick={() => onModeChange(AppMode.Q_ERP, SubMode.OCR, t)}
                                        className={`px-2.5 py-1 rounded-md text-xs transition-colors border ${topic === t
                                            ? 'bg-[#B30000] text-white border-[#B30000]'
                                            : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {t === OCRType.PURCHASE_TAX ? 'Purchase Tax Invoice' : t}
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderInputArea = (isBig: boolean = false) => (
        <div className={`
      w-full mx-auto
      ${isBig ? 'max-w-3xl' : 'max-w-4xl'}
      ${isBig ? 'mt-4' : ''}
    `}>
            {/* Attachment Preview */}
            {attachments.length > 0 && (
                <div className="flex gap-3 mb-3 overflow-x-auto pb-2 pt-4 px-2">
                    {attachments.map((att, idx) => (
                        <div key={idx} className="relative group flex-shrink-0">
                            {att.mimeType === 'application/pdf' ? (
                                <div className="h-24 w-24 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                    <Icons.FileText className="h-10 w-10 text-slate-400" />
                                    <span className="absolute bottom-1 text-[10px] text-slate-500 font-medium px-1 truncate max-w-full">{att.name}</span>
                                </div>
                            ) : (
                                <img src={att.data} alt="preview" className="h-24 w-24 object-cover rounded-md border border-slate-200 dark:border-slate-700" />
                            )}
                            <button
                                onClick={() => onRemoveAttachment(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Icons.X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className={`
        flex items-end gap-2 bg-slate-50 dark:bg-[#001529] p-2 rounded-xl border border-slate-200 dark:border-slate-700
        focus-within:border-[#B30000] dark:focus-within:border-red-500 focus-within:ring-1 focus-within:ring-[#B30000] dark:focus-within:ring-red-500
        transition-all shadow-sm
        ${isBig ? 'p-4 min-h-[80px]' : ''}
      `}>

                {subMode === SubMode.OCR && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*,.pdf"
                            onChange={onFileUpload}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-[#B30000] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors"
                            title="Upload Image"
                        >
                            <Icons.Paperclip className={`h-6 w-6 ${isBig ? 'h-7 w-7' : ''}`} />
                        </label>
                    </>
                )}

                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSendMessage();
                        }
                    }}
                    placeholder={subMode === SubMode.OCR ? "Describe this document or ask for specific fields..." : "Type your message..."}
                    className={`flex-1 max-h-60 sm:max-h-32 min-h-[48px] bg-transparent border-0 px-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 resize-none
            ${isBig ? 'text-lg py-4 min-h-[64px]' : 'text-base py-3'}
          `}
                    rows={1}
                />

                <button
                    onClick={onSendMessage}
                    disabled={(!input.trim() && attachments.length === 0) || isLoading}
                    className={`
            p-2.5 rounded-lg mb-0.5 transition-all duration-200
            ${(!input.trim() && attachments.length === 0) || isLoading
                            ? 'text-slate-300 dark:text-slate-600 bg-transparent cursor-not-allowed'
                            : 'bg-[#B30000] text-white hover:bg-[#8a0000] shadow-md'
                        }
            ${isBig ? 'mb-2' : ''}
          `}
                >
                    <Icons.Send className={`h-6 w-6 ${isBig ? 'h-7 w-7' : ''}`} />
                </button>
            </div>

            {isBig && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        Double-check important info.
                    </p>
                </div>
            )}
        </div>
    );

    const [availableModels, setAvailableModels] = useState<string[]>([]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                // Fetch models
                const { getAvailableModels } = await import('../services/api');
                const models = await getAvailableModels();
                setAvailableModels(models);
            } catch (error) {
                console.error("Failed to fetch models:", error);
            }
        };
        fetchModels();
    }, []);

    // Auto-correct model if the current selection is invalid for the provider
    useEffect(() => {
        if (availableModels.length > 0 && model) {
            const isModelValid = availableModels.includes(model);
            if (!isModelValid) {
                console.log(`ChatPage: Current model '${model}' not in available list. Auto-switching to '${availableModels[0]}'`);
                setModel(availableModels[0]);
            }
        } else if (availableModels.length > 0 && !model) {
            // If no model selected at all, pick first
            setModel(availableModels[0]);
        }
    }, [availableModels, model]);

    const handleModelChange = (newModel: string) => {
        console.log("ChatPage: User selected model:", newModel);
        setModel(newModel);
    }

    return (
        <main className="flex-1 flex flex-col h-full w-full relative min-w-0 bg-white dark:bg-[#000C17] rounded-2xl shadow-sm transition-colors overflow-hidden">
            {/* Header */}
            <header className="flex-none flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 shadow-sm z-30 transition-colors rounded-t-2xl">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 -ml-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <Icons.Menu className="h-6 w-6" />
                    </button>
                    <div className="flex flex-col min-w-0">
                        {currentSessionId && sessions.find(s => s.id === currentSessionId) ? (
                            <Tooltip content={sessions.find(s => s.id === currentSessionId)?.title || ''}>
                                <h1 className="text-lg font-semibold text-black dark:text-white truncate cursor-default">
                                    {sessions.find(s => s.id === currentSessionId)?.title}
                                </h1>
                            </Tooltip>
                        ) : (
                            <h1 className="text-lg font-semibold text-black dark:text-white truncate">
                                Start a Conversation
                            </h1>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="relative">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'en' | 'th')}
                            className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2 pl-3 pr-9 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <option value="en">English</option>
                            <option value="th">Thai</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-600 dark:text-slate-400">
                            <Icons.ChevronDown className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={model}
                            onChange={(e) => handleModelChange(e.target.value)}
                            className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2 pl-3 pr-9 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors max-w-[150px] sm:max-w-none truncate"
                        >
                            {availableModels.length > 0 ? (
                                availableModels.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))
                            ) : (
                                <option value={model}>{model}</option>
                            )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-600 dark:text-slate-400">
                            <Icons.ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            {!currentSessionId ? (
                <div className="flex h-full flex-col items-center justify-center p-4">
                    <h2 className="text-2xl font-bold  text-[#B30000] mb-8">
                        Q-ERP Assistant
                    </h2>
                    {renderModeSelector()}
                    {renderInputArea(true)}
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-6 space-y-6 bg-white dark:bg-[#000C17]">
                        {messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center">
                                <Icons.MessageSquare className="h-16 w-16 text-slate-200" />
                                <p className="text-slate-400 mt-4">Session Started</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[90%] md:max-w-[80%] flex-col ${msg.role === Role.USER ? 'items-end' : 'items-start'}`}>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mb-2 flex flex-wrap gap-2 justify-end">
                                                {msg.attachments.map((att, i) => (
                                                    <img
                                                        key={i}
                                                        src={att.data}
                                                        alt="attachment"
                                                        className="h-40 w-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm object-cover"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <div className="relative rounded-2xl px-5 py-4 shadow-sm text-base bg-white dark:bg-slate-800 text-black dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none">
                                            <div className="whitespace-pre-wrap leading-relaxed">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                                                        li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                                                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
                                                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2" {...props} />,
                                                        h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-2" {...props} />,
                                                        table: ({ node, ...props }) => <div className="overflow-x-auto mb-2"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg" {...props} /></div>,
                                                        thead: ({ node, ...props }) => <thead className="bg-slate-50 dark:bg-slate-800" {...props} />,
                                                        th: ({ node, ...props }) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" {...props} />,
                                                        td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap text-sm border-t border-slate-200 dark:border-slate-700" {...props} />,
                                                        code: ({ node, className, children, ...props }: any) => {
                                                            const match = /language-(\w+)/.exec(className || '')
                                                            const isInline = !match && !className?.includes('language-');
                                                            return isInline ? (
                                                                <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono text-red-500 dark:text-red-400" {...props}>
                                                                    {children}
                                                                </code>
                                                            ) : (
                                                                <div className="bg-slate-900 text-slate-100 rounded-md p-3 mb-2 overflow-x-auto">
                                                                    <code className="text-sm font-mono" {...props}>
                                                                        {children}
                                                                    </code>
                                                                </div>
                                                            )
                                                        }
                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        <div className="mt-1.5 flex items-center space-x-2 px-1">
                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {msg.role === Role.MODEL && (
                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        onClick={() => onFeedback(msg.id, 'like')}
                                                        className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${msg.feedback === 'like' ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}
                                                    >
                                                        <Icons.ThumbsUp className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onFeedback(msg.id, 'dislike')}
                                                        className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${msg.feedback === 'dislike' ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}
                                                    >
                                                        <Icons.ThumbsDown className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex w-full justify-start">
                                <div className="flex items-center space-x-2 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 px-5 py-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex space-x-1.5">
                                        <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500 delay-75"></div>
                                        <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500 delay-150"></div>
                                        <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500 delay-300"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="bg-white dark:bg-[#000C17] px-4 py-4 border-t border-slate-100 dark:border-slate-800 transition-colors rounded-b-2xl">
                        {renderModeSelector()}
                        {renderInputArea(false)}
                        <div className="mt-2 text-center">
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                AI can make mistakes. Double-check important info.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
};
