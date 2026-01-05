export enum Role {
  USER = 'user',
  MODEL = 'model',
}



export enum AppMode {
  Q_ERP = 'Q-ERP',
  OTHER = 'Other',
}

export enum SubMode {
  SUMMARIZE = 'summarize',
  KNOWLEDGE = 'knowledge',
  OCR = 'ocr',
  OTHER = 'other',
}

// Specific topics for Summarize mode
export enum SummarizeTopic {
  PRODUCTION = 'Production',
  SALE = 'Sale',
  PURCHASE = 'Purchase',
  INVENTORY = 'Inventory',
  ACCOUNTING = 'Accounting',
}

// Specific topics for Knowledge mode
export enum KnowledgeTopic {
  USER_GUIDE = 'Q-ERP User Guide',
}

// Specific topics for OCR mode
export enum OCRType {
  PURCHASE_TAX = 'Invoice',
  CREDIT_DEBIT = 'CreditDebitNote',
  SALES_ORDER = 'SalesOrder'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  attachments?: {
    name: string;
    mimeType: string;
    data: string; // base64
  }[];
  feedback?: 'like' | 'dislike' | null;
}

export interface ChatSession {
  id: string;
  title: string;
  date: Date;
  mode: AppMode;
  subMode: SubMode;
  topic?: string;
  messages: Message[];
}

export interface UserState {
  isAuthenticated: boolean;
  username?: string;
}

export interface OCRExtractionResponse {
  extraction_successful: boolean;
  document_type: string;
  confidence_score: number;
  extracted_data: Record<string, any>;
  raw_text?: string;
  processing_time?: number;
}

export interface OCRSaveParams {
  extracted_data: Record<string, any>;
  source_filename: string;
  extraction_type: string;
  confidence_score: number;
}
