import { create } from "zustand";
import {
  createVisitReport,
  customerDetailsAPI,
  getListVisited,
  listAllCustomerAPI,
  updateVisitReport,
  VisitDetailsAPI,
} from "../api/api";
import {
  ResCustomerDetails,
  ResListAllCustomer,
  ResListVisited,
  ResUpdateVisit,
  ResVisitDetail,
  UpdateVisitRequest,
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
  // เปลี่ยนชื่อและเพิ่ม mode parameter
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
}
export const useSalesVisitorStore = create<SalesVisitorStore>((set) => ({
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

  // ปรับ function ให้รับ mode parameter
  saveVisitReport: async (
    requestBody: UpdateVisitRequest,
    mode: "create" | "update"
  ) => {
    set({ saveLoading: true, saveError: null, saveResponse: null });

    try {
      // เลือก API function ตาม mode
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
}));
