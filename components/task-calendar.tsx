'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, isSameDay, parseISO } from 'date-fns'

type Task = {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
}

export default function TaskCalendar({ tasks }: { tasks: Task[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Filter tasks that match the selected date
  const tasksForDate = tasks.filter(task => 
    task.due_date && date && isSameDay(parseISO(task.due_date), date)
  )

  // Find dates that have tasks (to show markers)
  const daysWithTasks = tasks
    .filter(t => t.due_date)
    .map(t => new Date(t.due_date!))

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4">
      {/* 1. The Calendar Widget */}
      <div className="border rounded-xl p-4 bg-white shadow-sm h-fit">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
          modifiers={{
            hasTask: daysWithTasks // This identifies days with tasks
          }}
          modifiersStyles={{
            hasTask: { 
              fontWeight: 'bold', 
              textDecoration: 'underline',
              color: 'var(--primary)'
            }
          }}
        />
      </div>

      {/* 2. The Tasks for Selected Date */}
      <Card className="flex-1 min-h-[400px]">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{date ? format(date, 'EEEE, MMMM do') : 'Select a date'}</span>
            <Badge variant="outline">{tasksForDate.length} Tasks</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasksForDate.length > 0 ? (
            <div className="space-y-3">
              {tasksForDate.map(task => (
                <div key={task.id} className="p-3 border rounded-lg flex justify-between items-center bg-slate-50">
                  <span className={task.status === 'done' ? 'line-through text-slate-400' : ''}>
                    {task.title}
                  </span>
                  <Badge className={
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                  }>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 mt-10">
              No tasks scheduled for this day.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}