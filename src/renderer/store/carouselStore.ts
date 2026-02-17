import { create } from 'zustand'
import { MediaFile } from '../types'

interface CarouselState {
  currentIndex: number
  media: MediaFile[]
  isFullscreen: boolean
  isPlaying: boolean

  // Actions
  setMedia: (media: MediaFile[]) => void
  setCurrentIndex: (index: number) => void
  nextSlide: () => void
  previousSlide: () => void
  goToSlide: (index: number) => void
  toggleFullscreen: () => void
  setFullscreen: (isFullscreen: boolean) => void
  setPlaying: (isPlaying: boolean) => void
  reset: () => void
}

export const useCarouselStore = create<CarouselState>((set, get) => ({
  currentIndex: 0,
  media: [],
  isFullscreen: false,
  isPlaying: false,

  setMedia: (media) => {
    set({
      media,
      currentIndex: 0,
      isFullscreen: false,
      isPlaying: false
    })
  },

  setCurrentIndex: (index) => {
    set({ currentIndex: index })
  },

  nextSlide: () => {
    const { currentIndex, media } = get()
    if (currentIndex < media.length - 1) {
      set({ currentIndex: currentIndex + 1 })
    }
  },

  previousSlide: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 })
    }
  },

  goToSlide: (index) => {
    const { media } = get()
    if (index >= 0 && index < media.length) {
      set({ currentIndex: index })
    }
  },

  toggleFullscreen: () => {
    set((state) => ({ isFullscreen: !state.isFullscreen }))
  },

  setFullscreen: (isFullscreen) => {
    set({ isFullscreen })
  },

  setPlaying: (isPlaying) => {
    set({ isPlaying })
  },

  reset: () => {
    set({
      currentIndex: 0,
      media: [],
      isFullscreen: false,
      isPlaying: false
    })
  }
}))
