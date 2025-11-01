import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      onboardingStep: 1,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearUser: () => set({ user: null, isAuthenticated: false, onboardingStep: 1 }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      updateUser: (updates) => set((state) => ({ 
        user: state.user ? { ...state.user, ...updates } : null 
      })),
    }),
    {
      name: 'habit-auth-storage',
    }
  )
);

// Onboarding form state with persistence
export const useOnboardingStore = create((set) => {
  // Try to load from localStorage
  const savedData = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('habit-onboarding') || '{}')
    : {};

  const initialFormData = {
    role: null,
    name: '',
    bio: '',
    profileImage: null,
    skills: [],
    experienceLevel: '',
    projectName: '',
    projectDescription: '',
    needs: [],
    fundName: '',
    investmentFocus: '',
    portfolioLink: '',
    twitter: '',
    linkedin: '',
    website: '',
    github: '',
    farcaster: '',
    dailyHabit: '',
    purpose: '',
  };

  return {
    formData: { ...initialFormData, ...savedData },
    
    updateFormData: (data) => set((state) => {
      const newFormData = { ...state.formData, ...data };
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('habit-onboarding', JSON.stringify(newFormData));
      }
      return { formData: newFormData };
    }),
    
    resetFormData: () => set(() => {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('habit-onboarding');
      }
      return { formData: initialFormData };
    }),
  };
});

export const useDiscoverStore = create((set) => ({
  users: [],
  currentIndex: 0,
  filters: {
    role: null,
    skills: [],
  },
  
  setUsers: (users) => set({ users, currentIndex: 0 }),
  nextUser: () => set((state) => ({ 
    currentIndex: Math.min(state.currentIndex + 1, state.users.length - 1) 
  })),
  prevUser: () => set((state) => ({ 
    currentIndex: Math.max(state.currentIndex - 1, 0) 
  })),
  setFilters: (filters) => set({ filters }),
}));

export const useChatStore = create((set) => ({
  activeChat: null,
  chats: [],
  messages: {},
  
  setActiveChat: (chatId) => set({ activeChat: chatId }),
  setChats: (chats) => set({ chats }),
  addMessage: (chatId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: [...(state.messages[chatId] || []), message],
    },
  })),
  setMessages: (chatId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: messages,
    },
  })),
}));
