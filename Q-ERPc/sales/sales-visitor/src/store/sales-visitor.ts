import { create } from "zustand";
import {
  createVisitReport,
  customerDetailsAPI,
  getListVisited,
  listAllCustomerAPI,
  updateVisitReport,
  VisitDetailsAPI,
  uploadFile, // เพิ่ม import
} from "../api/api";
import {
  ResCustomerDetails,
  ResFileUpload, // เพิ่ม import
  ResListAllCustomer,
  ResListVisited,
  ResUpdateVisit,
  ResVisitDetail,
  UpdateVisitRequest,
  UploadedImage,
} from "../types/api";
import { API_CONFIG } from "../api/config";

export interface SalesVisitorStore {
  ListVisited: ResListVisited | null;
  loading: boolean;
  error: string | null;

  visitDetail: ResVisitDetail | null;
  detailLoading: boolean;
  detailError: string | null;

  saveLoading: boolean;
  saveError: string | null;
  saveResponse: ResUpdateVisit | null;

  listAllCustomer: ResListAllCustomer | null;
  listAllCustomerLoading: boolean;
  listAllCustomerError: string | null;

  customerDetails: ResCustomerDetails | null;
  customerDetailsLoading: boolean;
  customerDetailsError: string | null;

  // File upload states
  uploadLoading: boolean;
  uploadError: string | null;
  uploadedImage: UploadedImage | null; // เก็บรายการรูปที่อัปโหลดแล้ว
  currentUploadProgress: number;

  setLoading: (loading: boolean) => void;
  setListVisited: (ListVisited: ResListVisited) => void;
  fetchListVisited: (salescode: string) => Promise<void>;
  clearListVisited: () => void;
  clearError: () => void;

  setDetailLoading: (loading: boolean) => void;
  setVisitDetail: (visitDetail: ResVisitDetail) => void;
  fetchVisitDetail: (noItem: string) => Promise<void>;
  clearVisitDetail: () => void;
  clearDetailError: () => void;

  setSaveLoading: (loading: boolean) => void;
  saveVisitReport: (
    requestBody: UpdateVisitRequest,
    mode: "create" | "update"
  ) => Promise<ResUpdateVisit>;
  clearSaveError: () => void;
  clearSaveResponse: () => void;

  fetchlistAllCustomerAPI: () => Promise<void>;
  clearListAllCustomer: () => void;

  fetchCustomerDetails: (
    customerCode: string,
    typeInfo: string
  ) => Promise<void>;
  clearCustomerDetails: () => void;

  // File upload functions
  uploadSingleImage: (file: File) => Promise<UploadedImage>;
  removeUploadedImage: () => void;
  clearUploadedImage: () => void;
  getFilenameForSave: () => string | null;// ได้ filename array สำหรับส่งไป API
  clearUploadError: () => void;
  setExistingImageAsUploaded: (imageData: UploadedImage) => void; 
}

export const useSalesVisitorStore = create<SalesVisitorStore>((set, get) => ({
  ListVisited: null,
  loading: false,
  error: null,

  visitDetail: null,
  detailLoading: false,
  detailError: null,

  saveLoading: false,
  saveError: null,
  saveResponse: null,

  listAllCustomer: null,
  listAllCustomerLoading: false,
  listAllCustomerError: null,

  customerDetails: null,
  customerDetailsLoading: false,
  customerDetailsError: null,

  // File upload initial states
  uploadLoading: false,
  uploadError: null,
  uploadedImage: null,
  currentUploadProgress: 0,

  setLoading: (loading: boolean) => set({ loading }),

  setListVisited: (ListVisited: ResListVisited) => set({ ListVisited }),

  fetchListVisited: async (salescode: string) => {
    set({ loading: true, error: null });

    try {
      const data = await getListVisited(API_CONFIG, salescode);
      set({
        ListVisited: data,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "An error occurred",
        ListVisited: null,
      });
    }
  },

  clearListVisited: () => set({ ListVisited: null, error: null }),
  clearError: () => set({ error: null }),

  setDetailLoading: (loading: boolean) => set({ detailLoading: loading }),

  setVisitDetail: (visitDetail: ResVisitDetail) => set({ visitDetail }),

  fetchVisitDetail: async (noItem: string) => {
    set({ detailLoading: true, detailError: null });

    try {
      const data = await VisitDetailsAPI(API_CONFIG, noItem);
      set({
        visitDetail: data,
        detailLoading: false,
        detailError: null,
      });
    } catch (error) {
      set({
        detailLoading: false,
        detailError:
          error instanceof Error ? error.message : "An error occurred",
        visitDetail: null,
      });
    }
  },

  clearVisitDetail: () => set({ visitDetail: null, detailError: null }),
  clearDetailError: () => set({ detailError: null }),

  fetchlistAllCustomerAPI: async () => {
    set({ listAllCustomerLoading: true, listAllCustomerError: null });

    try {
      const data = await listAllCustomerAPI(API_CONFIG);
      set({
        listAllCustomer: data,
        listAllCustomerLoading: false,
        listAllCustomerError: null,
      });
    } catch (error) {
      set({
        listAllCustomerLoading: false,
        listAllCustomerError:
          error instanceof Error ? error.message : "An error occurred",
        listAllCustomer: null,
      });
    }
  },

  clearListAllCustomer: () =>
    set({ listAllCustomer: null, listAllCustomerError: null }),

  setSaveLoading: (loading: boolean) => set({ saveLoading: loading }),

  saveVisitReport: async (
    requestBody: UpdateVisitRequest,
    mode: "create" | "update"
  ) => {
    set({ saveLoading: true, saveError: null, saveResponse: null });

    try {
      const apiFunction =
        mode === "create" ? createVisitReport : updateVisitReport;
      const data = await apiFunction(API_CONFIG, requestBody);

      set({
        saveResponse: data,
        saveLoading: false,
        saveError: null,
      });
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      set({
        saveLoading: false,
        saveError: errorMessage,
        saveResponse: null,
      });
      throw error;
    }
  },

  clearSaveError: () => set({ saveError: null }),
  clearSaveResponse: () => set({ saveResponse: null }),

  fetchCustomerDetails: async (customerCode: string, typeInfo: string) => {
    set({ customerDetailsLoading: true, customerDetailsError: null });

    try {
      const data = await customerDetailsAPI(API_CONFIG, customerCode, typeInfo);
      set({
        customerDetails: data,
        customerDetailsLoading: false,
        customerDetailsError: null,
      });
    } catch (error) {
      set({
        customerDetailsLoading: false,
        customerDetailsError:
          error instanceof Error ? error.message : "An error occurred",
        customerDetails: null,
      });
    }
  },

  clearCustomerDetails: () =>
    set({ customerDetails: null, customerDetailsError: null }),

  // File upload implementations
  uploadSingleImage: async (file: File) => {
    set({ 
      uploadLoading: true, 
      uploadError: null,
      currentUploadProgress: 0 
    });

    try {
      set({ currentUploadProgress: 30 });
      const result = await uploadFile(API_CONFIG, file);
      set({ currentUploadProgress: 70 });
      if (result.filename && result.url) {
        const createFullUrl = (url: string): string => {
          if (url.startsWith('http')) {
            return url;
          }
          return `${API_CONFIG.baseUrl}${url}`;
        };

        const uploadedImage: UploadedImage = {
          filename: result.filename,
          url: createFullUrl(result.url),
          originalName: file.name,
          size: file.size,
        };

        set({
          uploadedImage: uploadedImage, 
          uploadLoading: false,
          uploadError: null,
          currentUploadProgress: 100,
        });

        return uploadedImage;
      } else {
        throw new Error('Invalid response: missing filename or url');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      set({
        uploadLoading: false,
        uploadError: errorMessage,
        currentUploadProgress: 0,
      });
      throw error;
    }
  },

  // แก้ไขฟังก์ชันต่างๆ
  removeUploadedImage: () => {
    set({ uploadedImage: null });
  },

  clearUploadedImage: () => set({ uploadedImage: null }),

  getFilenameForSave: () => {
    const image = get().uploadedImage;
    return image ? image.filename : null;
  },
setExistingImageAsUploaded: (imageData: UploadedImage) => {
  set({ uploadedImage: imageData });
},
  clearUploadError: () => set({ uploadError: null }),
}));
