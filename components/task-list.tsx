'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2, Calendar as CalendarIcon, Flag } from 'lucide-react' 
import { format } from 'date-fns'

type Task = {
  id: string
  title: string
  is_completed: boolean
  priority: string
  due_date: string | null
  description?: string
  status: string
}

const priorityColors: Record<string, string> = {
  low: 'text-slate-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-600 font-bold'
}

export default function TaskList({ workspaceId, onEdit }: { workspaceId: string, onEdit?: (task: Task) => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const supabase = createClient()

  // 1. Fetching tasks and setting up Realtime
  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    if (data) setTasks(data)
  }

  useEffect(() => {
    fetchTasks()

    // Listening for ANY changes (update, delete, insert) to keep List, Board, and Calendar in sync
    const channel = supabase
      .channel('realtime-tasks-list')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks',
        filter: `workspace_id=eq.${workspaceId}` 
      }, () => {
        fetchTasks() // Force refresh all views when database changes
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [workspaceId])

  // 2. Fixed Toggle Logic (Syncs is_completed and status)
  const toggleTask = async (task: Task) => {
    const newCompletedStatus = !task.is_completed
    // Map is_completed to the status the Board uses
    const newStatus = newCompletedStatus ? 'done' : 'todo'

    // Optimistic Update for instant UI feel
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, is_completed: newCompletedStatus, status: newStatus } : t
    ))

    const { error } = await supabase
      .from('tasks')
      .update({ 
        is_completed: newCompletedStatus,
        status: newStatus 
      })
      .eq('id', task.id)

    if (error) {
      console.error("Sync error:", error)
      fetchTasks() // Rollback on error
    }
  }

  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await supabase.from('tasks').delete().eq('id', taskId)
  }

  if (tasks.length === 0) return <div className="text-center p-8 text-slate-400">No tasks yet.</div>

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className={`group flex items-start gap-3 p-4 border rounded-lg bg-white shadow-sm transition-all hover:border-slate-400 cursor-pointer ${task.is_completed ? 'opacity-60 bg-slate-50' : ''}`}
          onClick={() => onEdit && onEdit(task)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox 
              className="mt-1"
              checked={task.is_completed}
              onCheckedChange={() => toggleTask(task)} 
            />
          </div>
          
          <div className="flex-1 space-y-1">
            <p className={`font-medium transition-all ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
              {task.title}
            </p>
            
            <div className="flex gap-4 text-xs text-slate-500">
              {task.due_date && (
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {format(new Date(task.due_date), "MMM d")}
                </span>
              )}
              <span className={`flex items-center gap-1 uppercase tracking-wider ${priorityColors[task.priority] || 'text-slate-500'}`}>
                <Flag className="h-3 w-3" />
                {task.priority}
              </span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
            onClick={(e) => {
              e.stopPropagation()
              deleteTask(task.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}