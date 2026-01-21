'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default function TaskInput({ workspaceId }: { workspaceId: string }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date>()
  const [priority, setPriority] = useState('Medium')
  const [category, setCategory] = useState('Personal')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const addTask = async () => {
    if (!title.trim()) return
    setLoading(true)

    // 1. Get the current user to verify identity
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("You must be logged in to add tasks")
      setLoading(false)
      return
    }
    
    // 2. Insert the task with the creator_id attached
    const { error } = await supabase.from('tasks').insert({
      title,
      workspace_id: workspaceId,
      status: 'todo',
      priority,
      category, 
      creator_id: user.id, // <--- This fixes the permission error
      due_date: date ? date.toISOString() : new Date().toISOString()
    })

    if (error) {
      console.error("Supabase Error:", error)
      alert(`Error adding task: ${error.message}`)
    } else {
      // Success! Reset the form
      setTitle('')
      setPriority('Medium')
      setCategory('Personal')
      setDate(undefined)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
      <Input 
        placeholder="What needs to be done?" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addTask()}
        className="text-lg border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-slate-400"
      />
      
      <div className="flex items-center gap-2">
        {/* DATE PICKER */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={!date ? "text-slate-500" : ""}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>

        {/* PRIORITY SELECTOR */}
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-[110px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>

        {/* CATEGORY SELECTOR */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Work">Work</SelectItem>
            <SelectItem value="Learning">Learning</SelectItem>
            <SelectItem value="Fitness">Fitness</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1"></div>
        
        <Button onClick={addTask} disabled={loading} size="sm">
          {loading ? 'Adding...' : <><Plus className="mr-1 h-4 w-4" /> Add Task</>}
        </Button>
      </div>
    </div>
  )
}