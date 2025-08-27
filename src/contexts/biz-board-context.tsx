"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import type { Revenue, Expense, Appointment } from "@/types"

interface BizBoardContextType {
  revenue: Revenue[]
  expenses: Expense[]
  appointments: Appointment[]
  addRevenue: (item: Omit<Revenue, "id">) => void
  addExpense: (item: Omit<Expense, "id">) => void
  addAppointment: (item: Omit<Appointment, "id">) => void
}

const BizBoardContext = createContext<BizBoardContextType | undefined>(undefined)

// Sample data to make the app look populated
const initialRevenue: Revenue[] = [
  { id: "1", description: "Website Development Project", amount: 2500, date: new Date("2024-05-10") },
  { id: "2", description: "Logo Design", amount: 800, date: new Date("2024-05-15") },
  { id: "3", description: "Consulting Services", amount: 1200, date: new Date("2024-06-02") },
]

const initialExpenses: Expense[] = [
  { id: "1", description: "Software Subscription", amount: 49.99, category: "Software", date: new Date("2024-05-01") },
  { id: "2", description: "Lunch with client", amount: 75.5, category: "Business Development", date: new Date("2024-05-20") },
  { id: "3", description: "Office Supplies", amount: 120, category: "Office Expenses", date: new Date("2024-06-05") },
]

const initialAppointments: Appointment[] = [
  { id: "1", title: "Meeting with John Doe", date: new Date() },
  { id: "2", title: "Project Kickoff", date: new Date(new Date().setDate(new Date().getDate() + 2)) },
]


export const BizBoardProvider = ({ children }: { children: ReactNode }) => {
  const [revenue, setRevenue] = useState<Revenue[]>(initialRevenue)
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)

  const addRevenue = (item: Omit<Revenue, "id">) => {
    setRevenue((prev) => [...prev, { ...item, id: Date.now().toString() }])
  }

  const addExpense = (item: Omit<Expense, "id">) => {
    setExpenses((prev) => [...prev, { ...item, id: Date.now().toString() }])
  }

  const addAppointment = (item: Omit<Appointment, "id">) => {
    setAppointments((prev) => [...prev, { ...item, id: Date.now().toString() }])
  }

  return (
    <BizBoardContext.Provider
      value={{ revenue, expenses, appointments, addRevenue, addExpense, addAppointment }}
    >
      {children}
    </BizBoardContext.Provider>
  )
}

export const useBizBoard = () => {
  const context = useContext(BizBoardContext)
  if (context === undefined) {
    throw new Error("useBizBoard must be used within a BizBoardProvider")
  }
  return context
}
