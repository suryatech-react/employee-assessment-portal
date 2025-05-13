import { create } from 'zustand';

const useAssessmentStore = create((set) => ({
  data: [],
  headers: [],
  loading: false,
  error: null,
  hasData: false,
  showCharts: false,


  setData: (newData) => set({ data: newData }),
  setHeaders: (newHeaders) => set({ headers: newHeaders }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setHasData: (hasData) => set({ hasData }),
  clearData: () => set({ data: [], headers: [], hasData: false, showCharts: false }),
  toggleView: () => set((state) => ({ showCharts: !state.showCharts })),
}));

export default useAssessmentStore;
