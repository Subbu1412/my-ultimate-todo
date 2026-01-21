'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react'

export default function EditTaskDialog({ task, open, onOpenChange }: { task: any, open: boolean, onOpenChange: any }) {
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState(task.priority)
  const [subtasks, setSubtasks] = useState<any[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // Load subtasks when the dialog opens
  useEffect(() => {
    if (open && task.id) {
      const fetchSubtasks = async () => {
        const { data } = await supabase
          .from('subtasks')
          .select('*')
          .eq('task_id', task.id)
          .order('created_at', { ascending: true })
        if (data) setSubtasks(data)
      }
      fetchSubtasks()
    }
  }, [open, task.id])

  const handleSave = async () => {
    setLoading(true)
    await supabase.from('tasks').update({ title, priority }).eq('id', task.id)
    setLoading(false)
    onOpenChange(false)
    window.location.reload() // Quick refresh to show changes
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    await supabase.from('tasks').delete().eq('id', task.id)
    onOpenChange(false)
    window.location.reload()
  }

  const addSubtask = async (e: any) => {
    e.preventDefault()
    if (!newSubtask.trim()) return

    const { data, error } = await supabase.from('subtasks').insert({
      task_id: task.id,
      title: newSubtask,
      creator_id: task.creator_id // Ensure ownership matches
    }).select().single()

    if (data) {
      setSubtasks([...subtasks, data])
      setNewSubtask('')
    }
  }

  const toggleSubtask = async (id: string, currentStatus: boolean) => {
    // Optimistic update (update UI immediately)
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, is_completed: !currentStatus } : st))
    
    // Update DB in background
    await supabase.from('subtasks').update({ is_completed: !currentStatus }).eq('id', id)
  }

  const deleteSubtask = async (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id))
    await supabase.from('subtasks').delete().eq('id', id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          
          {/* Main Task Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4"></div>

          {/* Checklist Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">Checklist</h4>
            
            {/* List of Subtasks */}
            <div className="space-y-2">
              {subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 group">
                  <button onClick={() => toggleSubtask(st.id, st.is_completed)}>
                    {st.is_completed ? 
                      <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                      <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                    }
                  </button>
                  <span className={`flex-1 text-sm ${st.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {st.title}
                  </span>
                  <button onClick={() => deleteSubtask(st.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4 text-slate-300 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Subtask Input */}
            <form onSubmit={addSubtask} className="flex gap-2 mt-2">
              <Input 
                placeholder="Add a step (e.g. 'Buy Milk')" 
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="h-8 text-sm"
              />
              <Button type="submit" size="sm" variant="secondary" className="h-8">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete Task
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}