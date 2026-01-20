'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type Task = {
  id: string
  title: string
  description?: string
  priority: string
  due_date: string | null
}

export default function EditTaskDialog({ task, open, onOpenChange }: { task: Task | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Form States (Using the task data if it exists)
  const [title, setTitle] = useState(task?.title || '')
  const [desc, setDesc] = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [date, setDate] = useState<Date | undefined>(task?.due_date ? new Date(task.due_date) : undefined)

  const handleSave = async () => {
    if (!task) return
    setLoading(true)

    const { error } = await supabase.from('tasks').update({
      title,
      description: desc,
      priority,
      due_date: date ? date.toISOString() : null
    }).eq('id', task.id)

    if (!error) {
      onOpenChange(false) // Close modal on success
    }
    setLoading(false)
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Task Title" 
            className="font-semibold"
          />
          
          <Textarea 
            value={desc} 
            onChange={(e) => setDesc(e.target.value)} 
            placeholder="Add a detailed description..." 
            className="min-h-[100px]"
          />

          <div className="flex gap-2">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("flex-1 justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}