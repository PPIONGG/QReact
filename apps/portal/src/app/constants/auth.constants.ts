// ตัวแปรคงที่สำหรับการจัดการการยืนยันตัวตนในแอปพลิเคชัน 8 ชั่วโมง
export const SESSION_DURATION = 8 * 60 * 60 * 1000;

// ระยะเวลาในการตรวจสอบเซสชัน (5 นาที)
export const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

// Login Types
export const LOGIN_TYPES = {
  Q: 'Q',
  DB: 'DB',
} as const;

// Auth Storage Keys
export const AUTH_STORAGE_KEY = 'auth-storage';

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/Login',
} as const;