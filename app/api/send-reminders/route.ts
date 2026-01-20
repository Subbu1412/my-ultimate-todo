import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 1. Setup the Gmail Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // The 16-char App Password
      },
    })

    // 2. Fetch tasks due today
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('due_date', today.toISOString())
      .lt('due_date', tomorrow.toISOString())
      .neq('status', 'done')

    if (error) throw error

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ message: 'No tasks due today!' })
    }

    const emailResults = []

    for (const task of tasks) {
      // 3. Get the REAL owner
      const { data: { user } } = await supabase.auth.admin.getUserById(task.creator_id)
      
      if (user && user.email) {
        console.log(`Sending email to REAL USER: ${user.email}`)

        // 4. Send using Gmail
        try {
          const info = await transporter.sendMail({
            from: `"My Ultimate Todo" <${process.env.GMAIL_USER}>`,
            to: user.email, // <--- This now works for ANY email!
            subject: `Reminder: ${task.title} is due today!`,
            html: `
              <h1>Task Due Today 🚨</h1>
              <p>Hi there,</p>
              <p>This is a reminder for your task:</p>
              <p><strong>${task.title}</strong> (Priority: ${task.priority})</p>
              <p>Sent from your Personal App.</p>
            `,
          })
          
          emailResults.push({ task: task.title, status: 'sent', id: info.messageId })
        } catch (err: any) {
          console.error("Gmail Error:", err)
          emailResults.push({ task: task.title, status: 'failed', error: err.message })
        }
      }
    }

    return NextResponse.json({ success: true, results: emailResults })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}