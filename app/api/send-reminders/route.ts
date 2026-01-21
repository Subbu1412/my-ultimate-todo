import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // 1. Calculate Current Time in IST
    const nowUtc = new Date()
    // Convert UTC to IST (Add 5 hours 30 mins)
    // We use 'Asia/Kolkata' timezone to be precise
    const options: Intl.DateTimeFormatOptions = { 
      timeZone: 'Asia/Kolkata', 
      hour: 'numeric', 
      hour12: false 
    }
    const formatter = new Intl.DateTimeFormat('en-US', options)
    const currentHourIST = parseInt(formatter.format(nowUtc))

    console.log(`Checking reminders for: ${currentHourIST}:00 IST`)

    // 2. Setup the Gmail Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, 
      },
    })

    // 3. Get ALL users (we need to filter them manually by their setting)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) throw userError

    const emailResults = []

    for (const user of users) {
      // Get user's preferred hour (Default to '9' if not set)
      const userPreferredHour = parseInt(user.user_metadata?.reminder_hour || '9')

      // ONLY send if the current IST hour matches their preferred hour
      if (userPreferredHour === currentHourIST) {
        
        console.log(`Processing user: ${user.email} (Prefers ${userPreferredHour} IST)`)

        // Check for tasks due TODAY
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('creator_id', user.id) // Only their tasks
          .gte('due_date', today.toISOString())
          .lt('due_date', tomorrow.toISOString())
          .neq('status', 'done')

        if (tasks && tasks.length > 0) {
           // Send the email
           try {
            const info = await transporter.sendMail({
              from: `"My Ultimate Todo" <${process.env.GMAIL_USER}>`,
              to: user.email,
              subject: `You have ${tasks.length} tasks due today! 📅`,
              html: `
                <h1>Good Morning, ${user.user_metadata?.display_name || 'there'}! ☀️</h1>
                <p>Here is your plan for today (IST):</p>
                <ul>
                  ${tasks.map(t => `<li><strong>${t.title}</strong> (${t.priority})</li>`).join('')}
                </ul>
                <p><a href="https://my-ultimate-todo.vercel.app">Go to Dashboard</a></p>
              `,
            })
            emailResults.push({ user: user.email, status: 'sent' })
           } catch (err: any) {
             console.error(`Failed to email ${user.email}:`, err)
           }
        }
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