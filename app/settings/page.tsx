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
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [reminderHour, setReminderHour] = useState('9') // Default to 9 AM
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
        // Load saved settings
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

  if (!user) return <div className="p-8">Loading settings...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile & Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your identity and notification preferences.</CardDescription>
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

                  {message && <div className="text-green-600 text-sm font-medium">{message}</div>}
                  
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password securely.</CardDescription>
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
                  {message && <div className="text-green-600 text-sm font-medium">{message}</div>}
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}