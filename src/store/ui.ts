import { create } from 'zustand'

interface UIStore {
  isMobileDrawerOpen: boolean
  setMobileDrawerOpen: (open: boolean) => void
  toggleMobileDrawer: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileDrawerOpen: false,
  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
  toggleMobileDrawer: () => set((state) => ({ isMobileDrawerOpen: !state.isMobileDrawerOpen })),
}))
