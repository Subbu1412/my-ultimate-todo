"use client";
import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import Image from "next/image";
import { CheckCircle2, Zap, Layout, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<any>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!captchaToken) {
      alert("Please complete the security check.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data: userExists } = await supabase
          .from('profiles') 
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle();

        if (userExists) {
          alert("This email is already registered. Please Sign In.");
          setIsSignUp(false);
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName }, captchaToken },
        });
        if (error) throw error;
        alert("Success! Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken },
        });
        if (error) throw error;
        router.push("/"); 
      }
    } catch (error: any) {
      alert(error.message);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* --- LEFT SIDE: BRANDING (Visible on Desktop) --- */}
      <div className="hidden lg:flex w-1/2 bg-[#0369a1] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Background Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="z-10">
          <div className="flex items-center gap-3 mb-12">
             <Image 
                src="/favicon.ico" 
                alt="GoalGrid Logo" 
                width={120} 
                height={120} 
                className="rounded-full bg-white/10 p-1"
             />
             <h1 className="text-3xl font-bold tracking-tight">GoalGrid</h1>
          </div>

          <h2 className="text-4xl font-extrabold mb-6 leading-tight">
            Stop dreaming. <br/>Start doing.
          </h2>
          <p className="text-blue-100 text-lg mb-12 max-w-md">
            The simplest way to get things done. No complex menus, just focus.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
               <div className="bg-blue-500/30 p-2 rounded-lg"><Zap className="w-6 h-6 text-yellow-300" /></div>
               <div>
                 {/* SIMPLIFIED TEXT 1 */}
                 <h3 className="font-bold text-lg">Works Everywhere</h3>
                 <p className="text-blue-200 text-sm">Open on your phone or laptop. It just works.</p>
               </div>
            </div>
            <div className="flex items-start gap-4">
               <div className="bg-blue-500/30 p-2 rounded-lg"><Layout className="w-6 h-6 text-cyan-300" /></div>
               <div>
                 {/* SIMPLIFIED TEXT 2 */}
                 <h3 className="font-bold text-lg">Drag & Drop</h3>
                 <p className="text-blue-200 text-sm">Move tasks around easily. Organize your way.</p>
               </div>
            </div>
            <div className="flex items-start gap-4">
               <div className="bg-blue-500/30 p-2 rounded-lg"><ShieldCheck className="w-6 h-6 text-green-300" /></div>
               <div>
                 {/* SIMPLIFIED TEXT 3 */}
                 <h3 className="font-bold text-lg">Safe & Private</h3>
                 <p className="text-blue-200 text-sm">Your data is yours. We keep it safe.</p>
               </div>
            </div>
          </div>
        </div>

        <div className="z-10 text-sm text-blue-300">
          © 2026 GoalGrid Inc.
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-blue-50/30">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
          
          {/* Logo for Mobile */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Image 
              src="/favicon.ico" 
              alt="GoalGrid Logo" 
              width={60} 
              height={60} 
            />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {isSignUp ? "Start organizing your life today." : "Enter your details to organize your self."}
            </p>
          </div>
          
          {/* Toggle Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >Sign In</button>
            <button 
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >Sign Up</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-500 ml-1">Display Name</label>
                 <input
                  type="text"
                  required
                  placeholder="e.g. Alex Maker"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 ml-1">Email</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 ml-1">Password</label>
               <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-center py-2">
              <Turnstile
                ref={turnstileRef}
                siteKey="0x4AAAAAACN1TiTvFpqP1lk0" 
                onSuccess={(token) => setCaptchaToken(token)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0369a1] text-white font-bold p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? "Please wait..." : isSignUp ? "Sign up" : "Sign In to Workspace"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-500">
              Need help? or Forgot Password {' '}
              <a href="mailto:vibe.todo14@gmail.com" className="font-semibold text-blue-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
