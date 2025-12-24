import React, { useEffect, useState } from 'react';
import { Icons } from './Icon';

interface SettingsPageProps {
    onToggleSidebar: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onToggleSidebar }) => {
    const [backendUrl, setBackendUrl] = useState('');

    // Config State
    const [llmProvider, setLlmProvider] = useState<'ollama' | 'vllm'>('ollama');
    const [ollamaUrl, setOllamaUrl] = useState('');
    const [vllmUrl, setVllmUrl] = useState('');
    const [defaultModel, setDefaultModel] = useState('alibayram/Qwen3-30B-A3B-Instruct-2507');
    const [contextWindow, setContextWindow] = useState('');
    const [maxToken, setMaxToken] = useState('');

    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            // 1. Backend URL: LocalStorage > Env
            const storedBackendUrl = localStorage.getItem('qai_backend_url');
            const envBackendUrl = import.meta.env.VITE_BACKEND_BASE_URL;
            const effectiveBackendUrl = storedBackendUrl || envBackendUrl || '';
            setBackendUrl(effectiveBackendUrl);

            // 2. Fetch Config from Backend
            try {
                const { getAvailableModels, getAppConfig } = await import('../services/api');

                if (effectiveBackendUrl) {
                    const [models, config] = await Promise.all([
                        getAvailableModels().catch(() => []),
                        getAppConfig().catch(() => ({} as any))
                    ]);

                    setAvailableModels(models);

                    if (config.llm_provider) setLlmProvider(config.llm_provider as 'ollama' | 'vllm');
                    if (config.ollama_url) setOllamaUrl(config.ollama_url);
                    if (config.vllm_url) setVllmUrl(config.vllm_url);
                    if (config.default_model) setDefaultModel(config.default_model);
                    // Ensure t hese are converted to strings for the input fields
                    if (config.context_window !== undefined && config.context_window !== null) setContextWindow(String(config.context_window));
                    if (config.max_tokens !== undefined && config.max_tokens !== null) setMaxToken(String(config.max_tokens));
                }
            } catch (error) {
                console.error("Failed to fetch config:", error);
                // Fallback defaults
                if (!defaultModel) setDefaultModel('alibayram/Qwen3-30B-A3B-Instruct-2507');
            }
        };

        fetchConfig();
    }, []);

    const fetchModels = async () => {
        try {
            const { getAvailableModels } = await import('../services/api');
            const models = await getAvailableModels().catch(() => []);
            setAvailableModels(models);
        } catch (error) {
            console.error("Failed to fetch models", error);
        }
    }

    // Ensure defaultModel state matches one of the available options if possible
    useEffect(() => {
        if (availableModels.length > 0) {
            const isCurrentModelValid = availableModels.includes(defaultModel);
            if (!isCurrentModelValid) {
                // If current state (e.g. initial alibayram...) is not in the list,
                // auto-select the first valid model from the list.
                // This prevents saving the hardcoded fallback if the user saves without changing the dropdown.
                setDefaultModel(availableModels[0]);
            }
        }
    }, [availableModels]);

    // Helper to handle Provider change: update backend immediately then fetch models
    const handleProviderChange = async (newProvider: 'ollama' | 'vllm') => {
        setLlmProvider(newProvider);

        try {
            const { updateAppConfig } = await import('../services/api');
            // Update backend with new provider. We assume a partial update or minimal payload is safe sufficient
            // based on the requirement to "fire api to update llm_provider config... to update model available list"
            // We use the current state for others, but critical is the provider.
            // Note: vllmUrl/ollamaUrl might be stale if we don't pass them, but updateAppConfig usually merges or we pass what we have.
            // Ideally we pass the full known config to be safe, similar to handleSave but auto-firing.

            const configPayload: any = {
                llm_provider: newProvider,
                // default_model: defaultModel, // Don't send default_model on provider change as it might refer to the OLD provider's model
                context_window: contextWindow,
                max_tokens: maxToken
            };

            if (newProvider === 'ollama') {
                configPayload.ollama_url = ollamaUrl;
                // configPayload.ollama_model = defaultModel; // Don't save OLD model as new provider model
            } else {
                configPayload.vllm_url = vllmUrl;
                // configPayload.vllm_model = defaultModel;
            }

            await updateAppConfig(configPayload);

            // Now fetch models
            fetchModels();

            // Per user request: "set default model every time i change llm_provider"
            // Since the model state is in App.tsx and prioritized by 'current_model', we need to reset that.
            localStorage.removeItem('current_model');

            // To ensure the App picks up the new default for the new provider immediately, 
            // we probably need to trigger a full re-initialization or ask the user to reload.
            // A simple way to force the new default is to reload the page, 
            // OR we can rely on the fact that we just cleared 'current_model', 
            // so if the user goes back to chat (re-mounts or if App re-renders), it might pick it up?
            // Actually App.tsx only runs stored logic on mount. 
            // For a robust "reset", a hard reload is safest in this architecture without global state management (Context/Redux) updates being wired here.
            window.location.reload();

        } catch (error) {
            console.error("Failed to update provider config:", error);
        }
    };

    // Remove the useEffect that was watching llmProvider to avoid double fetching/race conditions
    // useEffect(() => {
    //    if (backendUrl) {
    //        fetchModels();
    //    }
    // }, [llmProvider]);

    const handleSave = async () => {
        // Save Backend URL to LocalStorage (critical for connection)
        localStorage.setItem('qai_backend_url', backendUrl);

        try {
            const { updateAppConfig } = await import('../services/api');

            // Construct payload: only include the specific URL for the selected provider
            const configPayload: any = {
                llm_provider: llmProvider,
                // default_model: defaultModel, // User requested to NOT save to default_model generic key, but provider specific
                context_window: contextWindow,
                max_tokens: maxToken
            };

            if (llmProvider === 'ollama') {
                configPayload.ollama_url = ollamaUrl;
                configPayload.ollama_model = defaultModel;
            } else {
                configPayload.vllm_url = vllmUrl;
                configPayload.vllm_model = defaultModel;
            }

            await updateAppConfig(configPayload);
            setIsSaved(true);

            // Re-fetch models after save to ensure list is up-to-date with new config
            fetchModels();

        } catch (error) {
            console.error("Failed to save config to backend:", error);
            // Even if backend fails, visual feedback for local save (backendUrl)
            setIsSaved(true);
        }

        setTimeout(() => setIsSaved(false), 3000);
    };

    // Helper to handle Host URL input changes based on selected provider
    const handleHostUrlChange = (value: string) => {
        if (llmProvider === 'ollama') {
            setOllamaUrl(value);
        } else {
            setVllmUrl(value);
        }
    };

    const currentHostUrl = llmProvider === 'ollama' ? ollamaUrl : vllmUrl;

    return (
        <div className="flex-1 overflow-auto bg-white rounded-2xl dark:bg-[#000C17] p-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <Icons.Menu className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-bold text-[#B30000]">Settings</h1>
            </div>

            <div className="max-w-2xl space-y-8">
                {/* Configuration Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">
                        System Configuration
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                                Backend URL
                            </label>
                            <input
                                type="text"
                                value={backendUrl}
                                onChange={(e) => setBackendUrl(e.target.value)}
                                placeholder="http://localhost:8000"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[#B30000] outline-none transition-all"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Base URL for the Q-ERP backend API.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                                LLM Provider
                            </label>
                            <select
                                value={llmProvider}
                                onChange={(e) => handleProviderChange(e.target.value as 'ollama' | 'vllm')}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[#B30000] outline-none transition-all"
                            >
                                <option value="ollama">Ollama</option>
                                <option value="vllm">vLLM</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                                Select the underlying LLM provider.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                                LLM Host URL
                            </label>
                            <input
                                type="text"
                                value={currentHostUrl}
                                onChange={(e) => handleHostUrlChange(e.target.value)}
                                placeholder={llmProvider === 'ollama' ? "http://localhost:11434" : "http://localhost:8000"}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[#B30000] outline-none transition-all"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                URL for the selected LLM provider ({llmProvider}).
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                                Default Model
                            </label>
                            <select
                                value={defaultModel}
                                onChange={(e) => setDefaultModel(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[#B30000] outline-none transition-all"
                            >
                                {availableModels.length > 0 ? (
                                    availableModels.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))
                                ) : (
                                    <option value={defaultModel}>{defaultModel}</option>
                                )}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                                Select the default AI model to be used for new chats.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                                    Context Window
                                </label>
                                <input
                                    type="text"
                                    value={contextWindow}
                                    onChange={(e) => setContextWindow(e.target.value)}
                                    placeholder="e.g. 261000"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[#B30000] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                                    Max Token
                                </label>
                                <input
                                    type="text"
                                    value={maxToken}
                                    onChange={(e) => setMaxToken(e.target.value)}
                                    placeholder="e.g. 32441"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[#B30000] outline-none transition-all"
                                />
                            </div>
                        </div>

                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-[#B30000] text-white font-medium rounded-lg hover:bg-red-800 transition-colors shadow-sm flex items-center gap-2"
                    >
                        {isSaved ? (
                            <>
                                <Icons.Check className="w-4 h-4" />
                                Saved
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
