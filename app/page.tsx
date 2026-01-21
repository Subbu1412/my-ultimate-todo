'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import TaskInput from '@/components/task-input'
import TaskList from '@/components/task-list'
import TaskBoard from '@/components/task-board'
import TaskCalendar from '@/components/task-calendar'
import EditTaskDialog from '@/components/edit-task-dialog'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutList, KanbanSquare, CalendarDays, Settings } from 'lucide-react' // Added Settings Icon
import Link from 'next/link' // Added Link for navigation

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
  
  // State for editing
  const [editingTask, setEditingTask] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: workspaces } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).single()
        if (workspaces) setWorkspaceId(workspaces.id)
      } else {
        router.push('/login')
      }
    }
    checkUser()
  }, [router])

  const fetchTasks = async () => {
    if (!workspaceId) return
    const { data } = await supabase.from('tasks').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false })
    if (data) setTasks(data)
  }

  useEffect(() => {
    if (!workspaceId) return
    fetchTasks()
    const channel = supabase.channel('realtime-tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [workspaceId])

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
  }

  // Function to open edit modal
  const handleEditTask = (task: any) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  if (!user) return <div className="p-10 flex justify-center text-slate-500">Loading...</div>

  return (
    <main className="max-w-6xl mx-auto p-4">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border shadow-sm">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">My Ultimate Todo</h1>
           <p className="text-slate-500 text-sm mt-1">
             Welcome back, <span className="font-semibold text-indigo-600">{user.user_metadata?.display_name || user.email}</span>
           </p>
        </div>

        <div className="flex items-center gap-2">
          {/* NEW: Settings Button */}
          <Link href="/settings">
            <Button variant="ghost" size="icon" title="Settings">
              <Settings className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>

          {/* Sign Out Button */}
          <Button 
            variant="outline" 
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {workspaceId ? (
        <div className="space-y-6">
           <TaskInput workspaceId={workspaceId} />

           <Tabs defaultValue="list" className="w-full">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-semibold text-slate-700">My Tasks</h2>
               <TabsList>
                 <TabsTrigger value="list" className="flex gap-2"><LayoutList className="h-4 w-4"/> List</TabsTrigger>
                 <TabsTrigger value="board" className="flex gap-2"><KanbanSquare className="h-4 w-4"/> Board</TabsTrigger>
                 <TabsTrigger value="calendar" className="flex gap-2"><CalendarDays className="h-4 w-4"/> Calendar</TabsTrigger>
               </TabsList>
             </div>

             <TabsContent value="list">
               <TaskList workspaceId={workspaceId} onEdit={handleEditTask} /> 
             </TabsContent>
             
             <TabsContent value="board">
               <TaskBoard tasks={tasks} onUpdateStatus={updateTaskStatus} onEdit={handleEditTask} />
             </TabsContent>

             <TabsContent value="calendar">
               <TaskCalendar tasks={tasks} />
             </TabsContent>
           </Tabs>

           {/* Popup Dialog */}
           {editingTask && (
             <EditTaskDialog 
               task={editingTask} 
               open={isDialogOpen} 
               onOpenChange={setIsDialogOpen} 
             />
           )}
        </div>
      ) : (
        <div className="text-center p-10 text-slate-500">Loading workspace...</div>
      )}
    </main>
  )
}