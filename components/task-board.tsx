'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

// 1. Define the Shape of a Task
type Task = {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  description?: string
}

// 2. Define the Props (Inputs) this component accepts
interface TaskBoardProps {
  tasks: Task[]
  onUpdateStatus: (id: string, status: string) => void
  onEdit: (task: Task) => void // <--- New Prop for Editing
}

export default function TaskBoard({ tasks, onUpdateStatus, onEdit }: TaskBoardProps) {
  
  const columns = [
    { id: 'todo', label: 'To Do', color: 'bg-slate-100' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-blue-50' },
    { id: 'done', label: 'Done', color: 'bg-green-50' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full overflow-x-auto">
      {columns.map((col) => (
        <div key={col.id} className={`p-4 rounded-xl ${col.color} min-h-[500px]`}>
          
          {/* Column Header */}
          <h3 className="font-bold text-slate-700 mb-4 flex justify-between items-center">
            {col.label}
            <Badge variant="secondary" className="bg-white">
              {tasks.filter(t => t.status === col.id).length}
            </Badge>
          </h3>

          {/* Task Cards */}
          <div className="space-y-3">
            {tasks.filter(task => task.status === col.id).map(task => (
              <Card 
                key={task.id} 
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-slate-400"
                onClick={() => onEdit(task)} // <--- Clicking the card opens the dialog
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-700' : 
                      task.priority === 'high' ? 'bg-orange-100 text-orange-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span className="text-xs text-slate-400">
                        {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                  
                  <p className="font-medium text-sm mb-3 line-clamp-2">{task.title}</p>

                  <div className="flex justify-between gap-2">
                    {/* Move Left Button */}
                    <Button 
                      variant="ghost" size="sm" className="h-6 px-2 hover:bg-slate-200"
                      disabled={col.id === 'todo'}
                      onClick={(e) => {
                        e.stopPropagation() // <--- Prevents opening the edit dialog
                        onUpdateStatus(task.id, col.id === 'done' ? 'in-progress' : 'todo')
                      }}
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </Button>

                    {/* Move Right Button */}
                    <Button 
                      variant="ghost" size="sm" className="h-6 px-2 hover:bg-slate-200"
                      disabled={col.id === 'done'}
                      onClick={(e) => {
                        e.stopPropagation() // <--- Prevents opening the edit dialog
                        onUpdateStatus(task.id, col.id === 'todo' ? 'in-progress' : 'done')
                      }}
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}