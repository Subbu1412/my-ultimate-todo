import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic' // Important for Vercel

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Needs Service Role to see all users
)

export async function GET() {
  try {
    // 1. Calculate Current Time in IST
    const nowUtc = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      timeZone: 'Asia/Kolkata', 
      hour: 'numeric', 
      hour12: false 
    }
    const formatter = new Intl.DateTimeFormat('en-US', options)
    const currentHourIST = parseInt(formatter.format(nowUtc))

    console.log(`Checking reminders for: ${currentHourIST}:00 IST`)

    // 2. Setup Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, 
      },
    })

    // 3. Get ALL users
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) throw userError

    const emailResults = []

    for (const user of users) {
      // Get user's preferred hour (Default to '9' if not set)
      const userPreferredHour = parseInt(user.user_metadata?.reminder_hour || '9')
      
      console.log(`User: ${user.email} | Prefers: ${userPreferredHour} | Current: ${currentHourIST}`)

      // MATCH CHECK: Is it their time?
      if (userPreferredHour === currentHourIST) {
        
        // Check for tasks due TODAY
        const today = new Date()
        const dateString = today.toISOString().split('T')[0] // YYYY-MM-DD

        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('creator_id', user.id)
          .neq('status', 'done')
          // Check if due_date starts with today's date
          .gte('due_date', `${dateString}T00:00:00`)
          .lt('due_date', `${dateString}T23:59:59`)

        if (tasks && tasks.length > 0) {
           console.log(`-> Sending email to ${user.email} with ${tasks.length} tasks.`)
           
           // Send the email
           try {
            await transporter.sendMail({
              from: `"GoalGrid Bot" <${process.env.GMAIL_USER}>`,
              to: user.email,
              subject: `You have ${tasks.length} tasks due today! 📅`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                  <h1 style="color: #2563eb;">GoalGrid Daily Briefing 🌊</h1>
                  <p>Hi ${user.user_metadata?.display_name || 'there'}, here is your focus for today:</p>
                  <ul style="padding-left: 20px;">
                    ${tasks.map(t => `<li style="margin-bottom: 10px;"><strong>${t.title}</strong> <span style="color: #666; font-size: 12px;">(${t.priority})</span></li>`).join('')}
                  </ul>
                  <a href="https://my-ultimate-todo.vercel.app" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Open Dashboard</a>
                </div>
              `,
            })
            emailResults.push({ user: user.email, status: 'sent', task_count: tasks.length })
           } catch (err: any) {
             console.error(`Failed to email ${user.email}:`, err)
             emailResults.push({ user: user.email, status: 'failed', error: err.message })
           }
        } else {
            console.log(`-> User ${user.email} has no tasks due today.`)
            emailResults.push({ user: user.email, status: 'skipped_no_tasks' })
        }
      } else {
          emailResults.push({ user: user.email, status: 'skipped_wrong_time', preferred: userPreferredHour })
      }
    }

    return NextResponse.json({ 
      success: true, 
      current_time_ist: `${currentHourIST}:00`,
      results: emailResults 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}