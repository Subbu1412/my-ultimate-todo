'use client'
import Image from 'next/image';
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
import { LayoutList, KanbanSquare, CalendarDays, Settings } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
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

  const handleEditTask = (task: any) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  if (!user) return <div className="h-screen flex items-center justify-center text-blue-400">Loading GoalGrid...</div>

  return (
    // Ocean Breeze Gradient Background
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           {/* Left Side: Logo & Greeting */}
           <div className="flex items-center gap-6">
              {/* Logo Block */}
              <div className="flex items-center gap-3">
                <Image 
                  src="/favicon.ico" 
                  alt="GoalGrid Logo" 
                  width={56}   // INCREASED SIZE HERE (was 32)
                  height={56}  // INCREASED SIZE HERE (was 32)
                  className="drop-shadow-sm"
                />
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">GoalGrid</h1>
              </div>

              {/* Vertical Divider (Hidden on mobile) */}
              <div className="hidden md:block h-10 w-px bg-slate-300"></div>

              {/* Greeting Block */}
              <div className="hidden md:block">
                 <p className="text-slate-500 text-sm font-medium">
                   Welcome back,
                 </p>
                 <p className="text-blue-700 font-bold">
                   {user.user_metadata?.display_name || 'Creator'} 🌊
                 </p>
              </div>
           </div>

           {/* Right Side: Actions */}
           <div className="flex items-center gap-3">
             <Link href="/settings">
               <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                 <Settings className="h-6 w-6" />
               </Button>
             </Link>
             <Button 
               variant="outline" 
               className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-medium"
               onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
             >
               Sign Out
             </Button>
           </div>
        </div>

        {workspaceId ? (
          <div className="space-y-6">
             {/* Task Input Section */}
             <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                <TaskInput workspaceId={workspaceId} />
             </div>

             <Tabs defaultValue="board" className="w-full">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-slate-800">Your Goals</h2>
                 <TabsList className="bg-blue-50/50 border border-blue-100">
                   <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"><LayoutList className="h-4 w-4 mr-2"/> List</TabsTrigger>
                   <TabsTrigger value="board" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"><KanbanSquare className="h-4 w-4 mr-2"/> Board</TabsTrigger>
                   <TabsTrigger value="calendar" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"><CalendarDays className="h-4 w-4 mr-2"/> Calendar</TabsTrigger>
                 </TabsList>
               </div>

               <TabsContent value="list" className="mt-0">
                 <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                    <TaskList workspaceId={workspaceId} onEdit={handleEditTask} /> 
                 </div>
               </TabsContent>
               
               <TabsContent value="board" className="mt-0 h-[600px]">
                 <TaskBoard tasks={tasks} onUpdateStatus={updateTaskStatus} onEdit={handleEditTask} />
               </TabsContent>

               <TabsContent value="calendar" className="mt-0">
                 <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                    <TaskCalendar tasks={tasks} />
                 </div>
               </TabsContent>
             </Tabs>

             {editingTask && (
               <EditTaskDialog 
                 task={editingTask} 
                 open={isDialogOpen} 
                 onOpenChange={setIsDialogOpen} 
               />
             )}
          </div>
        ) : (
          <div className="text-center p-20 text-blue-400">Loading your workspace...</div>
        )}
      </div>
    </main>
  )
}
