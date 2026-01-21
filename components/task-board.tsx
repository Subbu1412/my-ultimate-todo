'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-white border-slate-200 shadow-sm' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 border-blue-100 shadow-inner' },
  { id: 'done', title: 'Done', color: 'bg-emerald-50 border-emerald-100 shadow-inner' }
]

export default function TaskBoard({ tasks, onUpdateStatus, onEdit }: { tasks: any[], onUpdateStatus: any, onEdit: any }) {

  // This function runs when you drop a card
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result

    // If dropped outside a column, do nothing
    if (!destination) return

    // If dropped in the same place, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Call the parent function to update Supabase
    const newStatus = destination.droppableId
    onUpdateStatus(draggableId, newStatus)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {COLUMNS.map(column => {
          // Filter tasks for this column
          const columnTasks = tasks.filter(t => t.status === column.id)

          return (
            <div key={column.id} className={`flex flex-col h-full rounded-xl border-2 ${column.color} p-4`}>
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-700">{column.title}</h3>
                <Badge variant="secondary" className="bg-white/50">{columnTasks.length}</Badge>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 space-y-3 min-h-[200px]" // Min-height ensures you can drop into an empty column
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style }} // Essential for smooth dragging
                          >
                            <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                              <CardContent className="p-4 space-y-3">
                                {/* Title and Edit Button */}
                                <div className="flex justify-between items-start gap-2">
                                  <span className="font-medium text-slate-900 leading-tight">{task.title}</span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onEdit(task)}>
                                    <Pencil className="h-3 w-3 text-slate-400" />
                                  </Button>
                                </div>
                                
                                {/* Meta Data: Date, Category, Priority */}
                                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                  </div>
                                  
                                  <div className="flex gap-1">
                                    {/* CATEGORY BADGE */}
                                    <Badge variant="outline" className="text-slate-600 border-slate-300">
                                      {task.category || 'Personal'}
                                    </Badge>

                                    {/* PRIORITY BADGE */}
                                    <Badge className={
                                      task.priority === 'High' ? 'bg-red-100 text-red-700 hover:bg-red-100 border-none' :
                                      task.priority === 'Medium' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-none' :
                                      'bg-slate-100 text-slate-700 hover:bg-slate-100 border-none'
                                    }>
                                      {task.priority}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}