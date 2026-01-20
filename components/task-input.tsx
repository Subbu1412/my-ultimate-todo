'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function TaskInput({ workspaceId }: { workspaceId: string }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date>()
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('tasks').insert({
        title,
        workspace_id: workspaceId,
        creator_id: user.id,
        status: 'todo',
        priority: priority,
        due_date: date ? date.toISOString() : null
      })

      setTitle('')
      setDate(undefined)
      setPriority('medium')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={addTask} className="flex flex-col gap-3 p-4 border rounded-lg bg-white shadow-sm">
      <input
        type="text"
        placeholder="What needs to be done?"
        className="flex-1 p-2 text-lg outline-none"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />
      
      <div className="flex gap-2 items-center">
        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a due date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Priority Dropdown */}
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" className="ml-auto" disabled={loading}>
          {loading ? 'Adding...' : 'Add Task'}
        </Button>
      </div>
    </form>
  )
}