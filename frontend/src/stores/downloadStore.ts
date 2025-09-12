import { create } from 'zustand'
import axios from 'axios'
import { Download } from '@/types'

interface DownloadState {
  downloads: Download[]
  loading: boolean
  error: string | null
  fetchDownloads: () => Promise<void>
  createDownload: (download: Partial<Download>) => Promise<void>
  pauseDownload: (id: string) => Promise<void>
  resumeDownload: (id: string) => Promise<void>
  cancelDownload: (id: string) => Promise<void>
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  downloads: [],
  loading: false,
  error: null,

  fetchDownloads: async () => {
    try {
      set({ loading: true, error: null })
      const response = await axios.get('/api/v1/downloads')
      set({ downloads: response.data, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch downloads', loading: false })
    }
  },

  createDownload: async (download: Partial<Download>) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.post('/api/v1/downloads', download)
      const newDownload = response.data
      set(state => ({
        downloads: [...state.downloads, newDownload],
        loading: false
      }))
    } catch (error) {
      set({ error: 'Failed to create download', loading: false })
    }
  },

  pauseDownload: async (id: string) => {
    try {
      await axios.put(`/api/v1/downloads/${id}/pause`)
      set(state => ({
        downloads: state.downloads.map(d => 
          d.id === id ? { ...d, status: 'paused' as const } : d
        )
      }))
    } catch (error) {
      set({ error: 'Failed to pause download' })
    }
  },

  resumeDownload: async (id: string) => {
    try {
      await axios.put(`/api/v1/downloads/${id}/resume`)
      set(state => ({
        downloads: state.downloads.map(d => 
          d.id === id ? { ...d, status: 'queued' as const } : d
        )
      }))
    } catch (error) {
      set({ error: 'Failed to resume download' })
    }
  },

  cancelDownload: async (id: string) => {
    try {
      await axios.delete(`/api/v1/downloads/${id}`)
      set(state => ({
        downloads: state.downloads.filter(d => d.id !== id)
      }))
    } catch (error) {
      set({ error: 'Failed to cancel download' })
    }
  },
}))
