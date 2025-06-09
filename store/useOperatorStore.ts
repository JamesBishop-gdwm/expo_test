import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { create } from 'zustand'

export interface Operators {
  name: string
  id: string
  tasks: TaskItems[]
}

export interface TaskItems {
  taskKey: string
  text: string
}

export interface SelectOption {
  text: string
  value: string | number
}

export interface SelectedUser {
  name: string
  id: string
  task?: string
}

export interface TaskHistory {
  // Define your task history interface based on API response
  id: string
  userId: string
  task: string
  batchNo: string
  comment: string
  dateScanned: string
}

interface OperatorState {
  // State
  operatorItems: Operators[]
  currentUser: SelectedUser
  scannedBarcode: string
  taskHistory: TaskHistory[]
  currentPage: number
  take: number

  // Getters
  getOperatorsAsOptions: () => SelectOption[]
  getCurrentUserTasks: () => TaskItems[]

  // Actions
  selectUserById: (id: string) => void
  selectTask: (task: string) => void
  setUser: () => Promise<void>
  loadUserLocalUser: () => Promise<void>
  loadUsersAndTasks: () => Promise<void>
  loadTaskHistory: () => Promise<void>
  nextPage: () => Promise<void>
  previousPage: () => Promise<void>
  postBarcode: (comment: string) => void
  logOut: () => Promise<void>
}

const pingUrl = 'https://admin-app.gradyjoinery.co.uk/net-api/task'

export const useOperatorStore = create<OperatorState>((set, get) => ({
  // State
  operatorItems: [],
  currentUser: { name: '', id: '', task: '' },
  scannedBarcode: '',
  taskHistory: [],
  currentPage: 1,
  take: 25,

  // Getters
  getOperatorsAsOptions: () => {
    return get().operatorItems.map((o) => ({ text: o.name, value: o.id }))
  },

  getCurrentUserTasks: () => {
    const { currentUser, operatorItems } = get()
    if (!currentUser || !currentUser.id) return []

    const data = operatorItems.find((d) => d.id === currentUser.id)
    if (!data) return []

    return data.tasks
  },

  // Actions
  selectUserById: (id: string) => {
    const name = get().operatorItems.find((d) => d.id === id)?.name ?? ''
    set({ currentUser: { id, name, task: '' } })
  },

  selectTask: (task: string) => {
    set((state) => ({
      currentUser: { ...state.currentUser, task },
    }))
  },

  setUser: async () => {
    await AsyncStorage.setItem('user', JSON.stringify(get().currentUser))
  },

  loadUserLocalUser: async () => {
    try {
      const previouslyLoggedIN = await AsyncStorage.getItem('user')
      if (previouslyLoggedIN) {
        const previousUser = JSON.parse(previouslyLoggedIN)
        set({ currentUser: previousUser })
      }
    } catch (error) {}
  },

  loadUsersAndTasks: async () => {
    try {
      const { data } = await axios.get<Operators[]>(`${pingUrl}`)
      set({ operatorItems: data })
    } catch (error) {}
  },

  loadTaskHistory: async () => {
    const { currentUser, currentPage, take } = get()
    try {
      const { data } = await axios.get<TaskHistory[]>(
        `${pingUrl}/task-history?userId=${currentUser.id}&pageNumber=${currentPage}&itemsPerPage=${take}`
      )
      set({ taskHistory: data })
    } catch (error) {}
  },

  nextPage: async () => {
    set((state) => ({ currentPage: state.currentPage + 1 }))
    await get().loadTaskHistory()
  },

  previousPage: async () => {
    set((state) => {
      if (state.currentPage <= 1) return state
      return { currentPage: state.currentPage - 1 }
    })
    await get().loadTaskHistory()
  },

  postBarcode: (comment: string) => {
    const { currentUser, scannedBarcode } = get()
    axios.post(`${pingUrl}`, {
      userId: currentUser.id,
      task: currentUser.task,
      batchNo: scannedBarcode,
      comment: comment,
    })
    set({ scannedBarcode: '' })
  },

  logOut: async () => {
    await AsyncStorage.removeItem('user')
    set({ currentUser: { name: '', id: '', task: '' } })
  },
}))
