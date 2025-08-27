"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react"
import { add, format, isSameDay } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBizBoard } from "@/contexts/biz-board-context"
import { useToast } from "@/hooks/use-toast"

const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
})

export default function CalendarPage() {
  const { appointments, addAppointment } = useBizBoard()
  const { toast } = useToast()
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [open, setOpen] = React.useState(false)

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { title: "" },
  })

  function onSubmit(values: z.infer<typeof appointmentSchema>) {
    if (!date) return
    addAppointment({ ...values, date })
    toast({
      title: "Appointment Added",
      description: `Successfully scheduled "${values.title}".`,
    })
    form.reset()
    setOpen(false)
  }

  const dailyAppointments = React.useMemo(() => {
    return date ? appointments.filter((appt) => isSameDay(appt.date, date)) : []
  }, [date, appointments])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment for {date ? format(date, "PPP") : ""}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input id="title" {...form.register("title")} className="col-span-3" />
                </div>
                {form.formState.errors.title && (
                  <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Schedule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-0"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-4",
                month: "space-y-4 flex-1",
                caption_label: "text-lg font-medium",
                table: "w-full border-collapse space-y-1",
                head_row: "flex justify-around",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2 justify-around",
                cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              }}
              modifiers={{
                hasAppointment: appointments.map(a => a.date)
              }}
              modifiersClassNames={{
                hasAppointment: "bg-accent/50 rounded-full"
              }}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              Appointments for {date ? format(date, "MMMM d, yyyy") : "selected date"}
            </CardTitle>
            <CardDescription>
              You have {dailyAppointments.length} appointment(s) today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dailyAppointments.length > 0 ? (
                dailyAppointments.map((appt) => (
                  <li key={appt.id} className="flex items-center gap-3 rounded-md bg-secondary p-3">
                    <CalendarIcon className="h-5 w-5 text-secondary-foreground" />
                    <span className="font-medium">{appt.title}</span>
                  </li>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No appointments scheduled for this day.
                </p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
