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

// Added onEdit prop here
export default function TaskList({ workspaceId, onEdit }: { workspaceId: string, onEdit?: (task: Task) => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
      if (data) setTasks(data)
    }

    fetchTasks()

    const channel = supabase
      .channel('realtime-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, workspaceId])

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t))
    await supabase.from('tasks').update({ 
      is_completed: !currentStatus,
      status: !currentStatus ? 'done' : 'todo'
    }).eq('id', taskId)
  }

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId))
    await supabase.from('tasks').delete().eq('id', taskId)
  }

  if (tasks.length === 0) return <div className="text-center p-8 text-slate-400">No tasks yet.</div>

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className={`group flex items-start gap-3 p-4 border rounded-lg bg-white shadow-sm transition-all hover:border-slate-400 cursor-pointer ${task.is_completed ? 'opacity-50 bg-slate-50' : ''}`}
          // Clicking the row opens Edit, unless you click specific buttons
          onClick={() => onEdit && onEdit(task)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox 
              className="mt-1"
              checked={task.is_completed}
              onCheckedChange={() => toggleTask(task.id, task.is_completed)} 
            />
          </div>
          
          <div className="flex-1 space-y-1">
            <p className={`font-medium ${task.is_completed ? 'line-through text-slate-500' : ''}`}>
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
              e.stopPropagation() // Prevent opening edit modal when deleting
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