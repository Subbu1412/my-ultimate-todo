'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Mail, ShieldCheck, LogOut, ExternalLink } from 'lucide-react' // Added new icons
import Link from 'next/link'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [reminderHour, setReminderHour] = useState('9')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        if (user.user_metadata?.display_name) {
          setName(user.user_metadata.display_name)
        }
        if (user.user_metadata?.reminder_hour) {
          setReminderHour(user.user_metadata.reminder_hour)
        }
      }
    }
    getUser()
  }, [router, supabase])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({
      data: { 
        display_name: name,
        reminder_hour: reminderHour 
      }
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Profile updated successfully!')
      router.refresh()
    }
    setLoading(false)
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Password updated successfully!')
      setPassword('')
    }
    setLoading(false)
  }

  // New Sign Out Function
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return <div className="p-8 text-blue-500">Loading settings...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="bg-white border-slate-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        </div>

        {/* Updated TabsList to have 3 columns */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200 p-1">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* PROFILE TAB (Unchanged) */}
          <TabsContent value="profile" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Profile & Preferences</CardTitle>
                <CardDescription>Manage your identity and notification settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Enter your name" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Daily Reminder Time (UTC)</Label>
                    <Select value={reminderHour} onValueChange={setReminderHour}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6:00 AM IST</SelectItem>
                        <SelectItem value="7">7:00 AM IST</SelectItem>
                        <SelectItem value="8">8:00 AM IST</SelectItem>
                        <SelectItem value="9">9:00 AM IST (Default)</SelectItem>
                        <SelectItem value="10">10:00 AM IST</SelectItem>
                        <SelectItem value="11">11:00 AM IST</SelectItem>
                        <SelectItem value="12">12:00 PM IST</SelectItem>
                        <SelectItem value="18">6:00 PM IST</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">Emails are sent based on IST time.</p>
                  </div>

                  {message && <div className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-100">{message}</div>}
                  
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB (Unchanged) */}
          <TabsContent value="security" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Update your password to keep your account safe.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={updatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Min. 6 characters"
                      required
                    />
                  </div>
                  {message && <div className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-100">{message}</div>}
                  <Button type="submit" disabled={loading} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- NEW SUPPORT TAB --- */}
          <TabsContent value="support" className="mt-6 space-y-6">
            
            {/* Contact Card */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-blue-50/50 pb-4 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Mail className="w-5 h-5" /> Contact Support
                </CardTitle>
                <CardDescription>
                  Need help with your account? We're here for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <a 
                  href="mailto:support@goalgrid.com" 
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group bg-white cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Email Us</p>
                      <p className="text-sm text-slate-500 group-hover:text-blue-600">support@goalgrid.com</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                </a>
              </CardContent>
            </Card>

            {/* Privacy Card (Placeholder) */}
            <Card className="border-slate-200 shadow-sm opacity-75">
               <CardContent className="flex items-center gap-4 py-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div className="flex-1">
                     <p className="font-semibold text-slate-700">Privacy Policy</p>
                     <p className="text-xs text-slate-500">Your data is secure and private.</p>
                  </div>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded">Coming Soon</span>
               </CardContent>
            </Card>

            {/* Sign Out Button */}
            <Button 
              variant="destructive" 
              className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 justify-start h-12"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out of GoalGrid
            </Button>

          </TabsContent>
          {/* --- END SUPPORT TAB --- */}

        </Tabs>
      </div>
    </div>
  )
}
