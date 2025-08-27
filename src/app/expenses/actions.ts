"use server"

import { categorizeExpense } from "@/ai/flows/categorize-expense"

export async function getExpenseCategory(description: string): Promise<string> {
  if (!description.trim()) {
    return ""
  }
  try {
    const result = await categorizeExpense({ description })
    return result.category
  } catch (error) {
    console.error("Error categorizing expense:", error)
    // In a real app, you might want more specific error handling or logging.
    return "Uncategorized"
  }
}
