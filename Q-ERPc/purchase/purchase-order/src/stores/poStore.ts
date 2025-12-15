import { create } from 'zustand'
import type { DocumentType, POHeader } from '../types'

interface POState {
  // Document types
  documentTypes: DocumentType[]
  selectedDocumentTypeCode: string | undefined
  isLoadingDocTypes: boolean

  // PO List
  poHeaders: POHeader[]
  isLoadingPOHeaders: boolean

  // Search/Filter
  searchText: string

  // Actions
  setDocumentTypes: (types: DocumentType[]) => void
  setSelectedDocumentTypeCode: (code: string | undefined) => void
  setIsLoadingDocTypes: (loading: boolean) => void
  setPOHeaders: (headers: POHeader[]) => void
  setIsLoadingPOHeaders: (loading: boolean) => void
  setSearchText: (text: string) => void
  reset: () => void
}

const initialState = {
  documentTypes: [],
  selectedDocumentTypeCode: undefined,
  isLoadingDocTypes: false,
  poHeaders: [],
  isLoadingPOHeaders: false,
  searchText: '',
}

export const usePOStore = create<POState>((set) => ({
  ...initialState,

  setDocumentTypes: (types) =>
    set((state) => ({
      documentTypes: types,
      // Auto-select first option if none selected
      selectedDocumentTypeCode:
        state.selectedDocumentTypeCode ?? (types.length > 0 ? types[0].documentTypeCode : undefined),
    })),

  setSelectedDocumentTypeCode: (code) =>
    set({ selectedDocumentTypeCode: code }),

  setIsLoadingDocTypes: (loading) =>
    set({ isLoadingDocTypes: loading }),

  setPOHeaders: (headers) =>
    set({ poHeaders: headers }),

  setIsLoadingPOHeaders: (loading) =>
    set({ isLoadingPOHeaders: loading }),

  setSearchText: (text) =>
    set({ searchText: text }),

  reset: () => set(initialState),
}))

// Selector hooks for better performance
// Return raw array, let component memoize the transform
export const useDocumentTypes = () =>
  usePOStore((state) => state.documentTypes)

export const useSelectedDocumentType = () =>
  usePOStore((state) => state.selectedDocumentTypeCode)

export const usePOHeaders = () =>
  usePOStore((state) => state.poHeaders)

export const useSearchText = () =>
  usePOStore((state) => state.searchText)
