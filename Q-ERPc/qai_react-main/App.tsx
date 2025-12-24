import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import { SummarizeFormModal, SummarizeFormData } from './components/SummarizeFormModal';
import { SettingsModal } from './components/SettingsModal'; // Keep for now or delete if fully replacing. User said "change setting to setting page", so I assume replace.
import { SettingsPage } from './components/SettingsPage';
import { AdminPage } from './components/AdminPage';
import { KnowledgePage } from './components/KnowledgePage';
import { OCRPage } from './components/OCRPage';
import { OCREditorModal } from './components/OCREditorModal';
import { ChatPage } from './components/ChatPage'; // Import ChatPage
import { Layout } from './components/Layout'; // Import external Layout
import { sendMessage, getProductionSummary, getSalesSummary, createSession, extractDocument, saveOCRExtraction } from './services/api';
import {
  AppMode,
  SubMode,
  Role,
  Message,
  ChatSession,
  UserState,
  OCRExtractionResponse
} from './types';

function App() {
  const navigate = useNavigate();

  // --- State ---
  const [user, setUser] = useState<UserState>(() => {
    const savedUser = localStorage.getItem('qai_user'); // Persist auth
    return savedUser ? JSON.parse(savedUser) : { isAuthenticated: false };
  });
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Initialize sidebar state based on screen width (closed on mobile, open on desktop)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Current Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; mimeType: string; data: string }[]>([]);

  // Config State
  const [mode, setMode] = useState<AppMode>(AppMode.Q_ERP);
  const [subMode, setSubMode] = useState<SubMode>(SubMode.SUMMARIZE); // Default
  const [topic, setTopic] = useState<string | undefined>('Production'); // Default
  const [model, setModel] = useState<string>(() => {
    return localStorage.getItem('current_model') || localStorage.getItem('qai_default_model') || 'alibayram/Qwen3-30B-A3B-Instruct-2507';
  });
  const [language, setLanguage] = useState<'en' | 'th'>('en');

  // Modals
  const [isSummarizeFormOpen, setIsSummarizeFormOpen] = useState(false);

  // OCR State
  const [isOCREditorOpen, setIsOCREditorOpen] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRExtractionResponse | null>(null);
  const [ocrFile, setOcrFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Sync default model from backend
    const fetchConfig = async () => {
      try {
        const { getAppConfig } = await import('./services/api');
        const config = await getAppConfig();

        // Determine system default based on provider
        let systemDefault = config.default_model;
        if (config.llm_provider === 'ollama' && config.ollama_model) {
          systemDefault = config.ollama_model;
        } else if (config.llm_provider === 'vllm' && config.vllm_model) {
          systemDefault = config.vllm_model;
        }

        // Update the system default in local storage
        if (systemDefault) {
          localStorage.setItem('qai_default_model', systemDefault);

          // If we don't have a current user selection, OR checks/logic suggests we should enforce it 
          // (User requirement: "set default model every time i change llm_provider")
          // For now, on APP LOAD, we respect the persistence. 
          // But if the provider changed while app was closed, relying on current_model might be wrong if it belongs to old provider?
          // However, to be safe and simple:
          if (!localStorage.getItem('current_model')) {
            setModel(systemDefault);
          }
        }
      } catch (e) {
        console.error("Failed to fetch app config", e);
      }
    };
    fetchConfig();
  }, [theme]);

  // Persist current model selection
  useEffect(() => {
    if (model) {
      console.log("App: model state updated to:", model);
      localStorage.setItem('current_model', model);
    }
  }, [model]);

  // Persistence Effect: Update session history when messages change
  useEffect(() => {
    if (currentSessionId) {
      setSessions(prev => prev.map(session =>
        session.id === currentSessionId
          ? { ...session, messages }
          : session
      ));
    }
  }, [messages, currentSessionId]);

  // --- Handlers ---

  const handleLogin = (username: string) => {
    const userState = { isAuthenticated: true, username };
    setUser(userState);
    localStorage.setItem('qai_user', JSON.stringify(userState)); // Save to storage

    // Initialize default view without creating a session yet
    resetToHome(AppMode.Q_ERP, SubMode.SUMMARIZE, 'Production');
    navigate('/');
  };

  const handleLogout = () => {
    setUser({ isAuthenticated: false });
    localStorage.removeItem('qai_user'); // Remove from storage
    setSessions([]);
    setMessages([]);
    setCurrentSessionId(null);
    setIsSidebarOpen(false);
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Resets the UI to the initial "Big Input" state without creating a session yet
  const resetToHome = (newMode: AppMode, newSubMode: SubMode, newTopic?: string) => {
    setCurrentSessionId(null);
    setMode(newMode);
    setSubMode(newSubMode); // Start with specific submode if provided, or default
    setTopic(newTopic);
    setMessages([]);
    setAttachments([]);
    setInput('');
    setOcrFile(null);
    setOcrResult(null);
  };

  const handleModeChange = (newMode: AppMode, newSubMode: SubMode, newTopic?: string) => {
    // If switching to Summarize with a topic, open form immediately
    if (newMode === AppMode.Q_ERP && newSubMode === SubMode.SUMMARIZE && newTopic) {
      setMode(newMode);
      setSubMode(newSubMode);
      setTopic(newTopic);
      setIsSummarizeFormOpen(true);
      return;
    }

    if (!currentSessionId) {
      setMode(newMode);
      setSubMode(newSubMode);
      setTopic(newTopic || undefined);
      return;
    }

    resetToHome(newMode, newSubMode, newTopic || undefined);
  };

  const handleSelectSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      setMode(session.mode);
      setSubMode(session.subMode);
      setTopic(session.topic);
      setMessages(session.messages || []);
      navigate('/');
    }
  };

  const generateSession = (overrideTitle?: string): string => {
    const newId = Date.now().toString();
    const title = overrideTitle || (topic ? `${subMode} - ${topic}` : `${mode} Chat`);

    const newSession: ChatSession = {
      id: newId,
      title: title,
      date: new Date(),
      mode: mode,
      subMode: subMode,
      topic: topic,
      messages: []
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    return newId;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Create session immediately upon file upload if one doesn't exist
      if (!currentSessionId) {
        generateSession();
      }

      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setAttachments([{
          name: file.name,
          mimeType: file.type,
          data: base64String
        }]);
      };

      reader.readAsDataURL(file);

      // Keep file for OCR
      if (subMode === SubMode.OCR) {
        setOcrFile(file);
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
    // If we remove the attachment in OCR mode, also remove the ocrFile
    if (subMode === SubMode.OCR) {
      setOcrFile(null);
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    await processSendMessage(input);
  };

  const handleSummarizeConfirm = async (formData: SummarizeFormData) => {
    setIsSummarizeFormOpen(false);
    setIsLoading(true);

    try {
      // 1. Fetch Summary from Backend
      let summaryData;
      let dateFrom = '';
      let dateTo = '';

      // Fix: Convert Buddhist Year (BE) to AD if year > 2400
      const startYearAD = formData.startYear > 2400 ? formData.startYear - 543 : formData.startYear;
      const endYearAD = formData.endYear > 2400 ? formData.endYear - 543 : formData.endYear;

      const sm = formData.startMonth.toString().padStart(2, '0');
      const sd = formData.startDay.toString().padStart(2, '0');
      const em = formData.endMonth.toString().padStart(2, '0');
      const ed = formData.endDay.toString().padStart(2, '0');

      // Use actual datetime in ISO GMT+7 format
      dateFrom = `${startYearAD}-${sm}-${sd}`;
      dateTo = `${endYearAD}-${em}-${ed}`;

      const payload = {
        date_format: formData.timeFormat === 'Year' ? 'year_only' : 'year_month',
        date_from: dateFrom,
        date_to: dateTo,
        language: language
      };

      if (topic === 'Production') {
        summaryData = await getProductionSummary({
          ...payload,
          production_type: formData.productionType === 'Finished product' ? 'Finished' : 'WIP'
        });
      } else {
        // Sales
        summaryData = await getSalesSummary(payload);
      }

      // 2. Create Session with summary_context
      const timeString = `${formData.startDay}/${formData.startMonth}/${formData.startYear} to ${formData.endDay}/${formData.endMonth}/${formData.endYear}`;
      const prodTypePart = formData.productionType ? ` ${formData.productionType}` : '';
      const sessionTitle = `@Agent Summarize ${topic}${prodTypePart} ${timeString}`;

      const newSessionData = await createSession({
        mode: SubMode.SUMMARIZE.toLowerCase(),
        title: sessionTitle,
        summary_context: summaryData.summary_context
      });

      const newSession: ChatSession = {
        id: newSessionData.id,
        title: newSessionData.title,
        date: new Date(newSessionData.created_at),
        mode: AppMode.Q_ERP,
        subMode: SubMode.SUMMARIZE,
        topic: topic,
        messages: []
      };

      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMode(AppMode.Q_ERP);
      setSubMode(SubMode.SUMMARIZE);
      // setTopic is already set

      // 3. Add "System" Message with Truncated Context
      const truncatedContext = summaryData.summary_context.length < 1
        ? summaryData.summary_context.substring(0, 5000) + '...'
        : summaryData.summary_context;

      const systemMessage: Message = {
        id: Date.now().toString(),
        role: Role.MODEL, // Or Role.SYSTEM if available? Using MODEL for now to display as AI response
        text: truncatedContext,
        timestamp: Date.now(),
        feedback: null
      };

      setMessages([systemMessage]);
      navigate('/');

    } catch (error: any) {
      console.error("Failed to start summarize session", error);
      alert(`Error: ${error.message || 'Failed to generate summary'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOCRSave = async (data: Record<string, any>, isEdited: boolean) => {
    if (!ocrResult || !ocrFile) return;

    setIsLoading(true);
    try {
      await saveOCRExtraction({
        extracted_data: data,
        source_filename: ocrFile.name,
        extraction_type: ocrResult.document_type,
        confidence_score: ocrResult.confidence_score
      });

      // Add success message to chat
      const successMsg: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: `Document processed and saved successfully! (${isEdited ? 'Edited' : 'Original'})`,
        timestamp: Date.now(),
        feedback: null
      };
      setMessages(prev => [...prev, successMsg]);

    } catch (error: any) {
      console.error("Failed to save OCR", error);
      alert(`Error saving document: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsOCREditorOpen(false);
      setOcrResult(null);
      setOcrFile(null);
      setAttachments([]); // Clear attachment preview
    }
  };

  // Ref to track latest model state for use in async callbacks
  const modelRef = useRef(model);
  useEffect(() => {
    console.log("App: modelRef updated to:", model);
    modelRef.current = model;
  }, [model]);

  const processSendMessage = async (messageText: string, customSessionTitle?: string) => {
    const currentInput = messageText;
    const currentAttachments = [...attachments];

    // 1. Logic to create session if it's the first message
    let activeSessionId = currentSessionId;

    if (!activeSessionId) {
      activeSessionId = generateSession(customSessionTitle);
    }

    // Clear input immediately
    setInput('');
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: currentInput,
      timestamp: Date.now(),
      attachments: currentAttachments
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // 2. Check for OCR mode specifically
    if (subMode === SubMode.OCR) {
      if (!ocrFile && currentAttachments.length === 0) {
        alert("Please upload a document for OCR.");
        setIsLoading(false);
        return;
      }

      try {
        // Use ocrFile if available
        if (!ocrFile) {
          throw new Error("File object missing for OCR.");
        }

        // Ensure we have a valid backend session ID (UUID)
        let backendSessionId = activeSessionId;
        const isBackendId = backendSessionId && backendSessionId.includes('-');

        if (!isBackendId) {
          const newSession = await createSession({
            mode: subMode.toLowerCase(),
            title: topic ? `${subMode} - ${topic}` : `${mode} Chat`,
            summary_context: ''
          });
          backendSessionId = newSession.id;

          // Update local state early to reflect the new ID
          setCurrentSessionId(backendSessionId);
          setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, id: backendSessionId } : s));
        }

        const result = await extractDocument(
          ocrFile,
          backendSessionId,
          topic || 'Invoice', // Use topic as document type
          language
        );

        setOcrResult(result);
        setIsOCREditorOpen(true);
        setIsLoading(false);
        return; // Stop here, don't add model message yet
      } catch (e: any) {
        console.error("OCR Failed", e);
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: Role.MODEL,
          text: `OCR Failed: ${JSON.stringify(e)}`,
          timestamp: Date.now(),
          feedback: null
        };
        setMessages(prev => [...prev, errMsg]);
        setIsLoading(false);
        return;
      }
    }

    try {
      console.log("Sending message with model:", modelRef.current);
      const response = await sendMessage(
        activeSessionId,
        currentInput,
        currentAttachments,
        mode,
        subMode,
        topic,
        language,
        modelRef.current
      );

      // If backend updated session ID (e.g. created a real session from a local one)
      if (response.sessionId !== activeSessionId) {
        // Update current ID
        setCurrentSessionId(response.sessionId);
        // Also update the ID in the sessions list so it matches
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, id: response.sessionId } : s));
      }

      const newModelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: response.text,
        timestamp: Date.now(),
        feedback: null
      };

      setMessages(prev => [...prev, newModelMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: error.message || "Sorry, I encountered an error processing your request.",
        timestamp: Date.now(),
        feedback: null
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, feedback: msg.feedback === type ? null : type }
        : msg
    ));
    // In real app, send to API
  };


  return (
    <>
      <SummarizeFormModal
        isOpen={isSummarizeFormOpen}
        onClose={() => setIsSummarizeFormOpen(false)}
        onConfirm={handleSummarizeConfirm}
        topic={topic}
      />

      <OCREditorModal
        isOpen={isOCREditorOpen}
        onClose={() => setIsOCREditorOpen(false)}
        onSave={handleOCRSave}
        extractionResult={ocrResult}
      />

      <Routes>
        <Route path="/login" element={!user.isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route element={user.isAuthenticated ? (
          <Layout
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={() => {
              resetToHome(AppMode.Q_ERP, SubMode.SUMMARIZE, 'Production');
              navigate('/');
            }}
            onLogout={handleLogout}
            theme={theme}
            toggleTheme={toggleTheme}
            onOpenSettings={() => navigate('/setting')}
          />
        ) : <Navigate to="/login" />}>
          <Route path="/" element={
            <ChatPage
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              currentSessionId={currentSessionId}
              sessions={sessions}
              messages={messages}
              isLoading={isLoading}
              input={input}
              setInput={setInput}
              attachments={attachments}
              onRemoveAttachment={handleRemoveAttachment}
              onFileUpload={handleFileUpload}
              fileInputRef={fileInputRef}
              mode={mode}
              subMode={subMode}
              topic={topic}
              onModeChange={handleModeChange}
              model={model}
              setModel={setModel}
              language={language}
              setLanguage={setLanguage}
              onSendMessage={handleSendMessage}
              onFeedback={handleFeedback}
            />
          } />
          <Route path="/admin" element={<AdminPage onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />} />
          <Route path="/knowledge" element={<KnowledgePage onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />} />
          <Route path="/ocr" element={<OCRPage onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />} />
          <Route path="/setting" element={<SettingsPage onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;