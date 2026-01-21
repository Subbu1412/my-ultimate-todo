import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic' // Forces the code to run fresh every time

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    console.log("Attempting to send test email...")

    // 1. Setup the Email Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, 
      },
    })

    // 2. HARDCODED: Send an email directly to yourself
    // (This skips the database check to prove credentials work)
    const myEmail = process.env.GMAIL_USER // Sending to yourself for the test

    const info = await transporter.sendMail({
      from: `"GoalGrid Bot" <${process.env.GMAIL_USER}>`,
      to: myEmail, 
      subject: `It Works! 🚀 Verification Email`,
      html: `
        <h1>Congratulations! 🎉</h1>
        <p>If you are reading this, your GoalGrid email system is <strong>100% working</strong>.</p>
        <p>This email was sent from Vercel.</p>
      `,
    })

    return NextResponse.json({ 
      success: true, 
      message: "Test email sent successfully!", 
      recipient: myEmail,
      messageId: info.messageId 
    })

  } catch (error: any) {
    console.error("Email Failed:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}