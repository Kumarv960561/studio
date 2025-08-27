export interface Revenue {
  id: string
  description: string
  amount: number
  date: Date
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: Date
}

export interface Appointment {
  id: string
  title: string
  date: Date
}
