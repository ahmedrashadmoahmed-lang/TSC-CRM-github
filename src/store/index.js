// Zustand Store for Global State
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Example: Global UI State
export const useUIStore = create(
  devtools(
    persist(
      (set) => ({
        sidebarCollapsed: false,
        theme: 'light',
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
);

// Example: Cart State (for e-commerce features)
export const useCartStore = create(
  devtools((set) => ({
    items: [],
    addItem: (item) =>
      set((state) => ({
        items: [...state.items, item],
      })),
    removeItem: (id) =>
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
    clearCart: () => set({ items: [] }),
    total: () => {
      const state = useCartStore.getState();
      return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
  }))
);
