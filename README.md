GoalGrid is a high-performance, full-stack task management application designed with a focus on speed, security, and a modern "Glassmorphic" aesthetic. It helps users manage their daily goals while providing automated email reminders to keep them on track.

✨ Features
Glassmorphic UI: A modern "Ocean Breeze" themed interface built with Tailwind CSS and Radix UI components.

Secure Authentication: Powered by Supabase Auth with Cloudflare Turnstile CAPTCHA protection to prevent bot abuse.

Real-time Database: Instant task updates and persistent state management using Supabase and Next.js.

Automated Reminders: A custom API endpoint triggered by a cron job to send email notifications via Resend/Nodemailer.

Timezone Intelligence: Smart filtering ensures reminders are sent at the correct local time for every user.

Drag & Drop: Intuitive task organization using @hello-pangea/dnd.

🛠️ Tech Stack
Layer                     Technology
Frontend       Next.js 15, React 19, Tailwind CSS
Backend        Supabase (BaaS), Next.js API Routes
Database       PostgreSQL (via Supabase)
Security       Cloudflare Turnstile CAPTCHA
Mailing        Resend / Nodemailer
Deployment     Vercel

Prerequisites
Node.js 20+

A Supabase Project

A Cloudflare Turnstile Account

Installation

Clone the repository:
git clone https://github.com/Subbu1412/my-ultimate-todo.git
cd my-ultimate-todo

Install dependencies:
npm install
Set up Environment Variables: Create a .env.local file in the root directory and add your keys:

Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_site_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key

Run the development server:
npm run dev

🛡️ Security
This project implements Attack Protection via Supabase. All authentication attempts (Login and Signup) are verified through a Cloudflare Turnstile widget to ensure that only human users can access the system.


<img width="1445" height="748" alt="image" src="https://github.com/user-attachments/assets/454ed34d-772c-47b0-8594-b2fd8c28ed11" />
<img width="738" height="686" alt="image" src="https://github.com/user-attachments/assets/aa21b523-dfb8-42c9-9e65-28aa93852150" />
<img width="1477" height="715" alt="image" src="https://github.com/user-attachments/assets/3f6bae5f-4448-48d0-9202-42b02733f266" />
<img width="1488" height="839" alt="image" src="https://github.com/user-attachments/assets/8b1c4a7c-4084-464e-ac47-7f35486f1bb3" />
<img width="774" height="513" alt="image" src="https://github.com/user-attachments/assets/b7563a74-36d8-4b7d-b82a-b56d9d0fdc89" />


