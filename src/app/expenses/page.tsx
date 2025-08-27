"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle, MoreHorizontal, Sparkles, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBizBoard } from "@/contexts/biz-board-context"
import { useToast } from "@/hooks/use-toast"
import { getExpenseCategory } from "./actions"
import { format } from "date-fns"

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be positive"),
  category: z.string().min(1, "Category is required"),
})

export default function ExpensesPage() {
  const { expenses, addExpense } = useBizBoard()
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [isCategorizing, setIsCategorizing] = React.useState(false)

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "",
    },
  })

  const handleCategorize = async () => {
    const description = form.getValues("description")
    if (!description) {
      toast({
        variant: "destructive",
        title: "No description",
        description: "Please enter a description to categorize.",
      })
      return
    }
    setIsCategorizing(true)
    try {
      const category = await getExpenseCategory(description)
      form.setValue("category", category, { shouldValidate: true })
      toast({
        title: "Category Suggested",
        description: `We've suggested a category for your expense.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Categorization Failed",
        description: "Could not categorize the expense.",
      })
    } finally {
      setIsCategorizing(false)
    }
  }

  function onSubmit(values: z.infer<typeof expenseSchema>) {
    addExpense({ ...values, date: new Date() })
    toast({
      title: "Expense Added",
      description: `Successfully added "${values.description}".`,
    })
    form.reset()
    setOpen(false)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>
                Enter the details of your new expense.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input id="description" {...form.register("description")} className="col-span-3" />
                </div>
                 {form.formState.errors.description && (
                  <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Input id="category" {...form.register("category")} className="flex-1" />
                    <Button type="button" size="icon" variant="outline" onClick={handleCategorize} disabled={isCategorizing}>
                      {isCategorizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span className="sr-only">Categorize with AI</span>
                    </Button>
                  </div>
                </div>
                {form.formState.errors.category && (
                  <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.category.message}</p>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input id="amount" type="number" step="0.01" {...form.register("amount")} className="col-span-3" />
                </div>
                {form.formState.errors.amount && (
                  <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Add Entry</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Entries</CardTitle>
          <CardDescription>A list of all your expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                 <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? (
                expenses
                  .slice()
                  .sort((a,b) => b.date.getTime() - a.date.getTime())
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{format(item.date, "PPP")}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                       <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No expenses yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
