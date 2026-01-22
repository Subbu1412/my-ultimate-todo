"use client";
import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
// 1. IMPORT IMAGE COMPONENT
import Image from "next/image";

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
        // --- CRITICAL FIX: Check for existing account ---
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
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9ff] p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-blue-100">
        
        {/* --- 2. NEW LOGO SECTION START --- */}
        <div className="flex flex-col items-center justify-center mb-6">
          <Image 
            src="/favicon.ico" 
            alt="GoalGrid Logo" 
            width={120} 
            height={120} 
            className="drop-shadow-sm mb-2"
          />
          <h1 className="text-2xl font-black text-[#0369a1] text-center italic">Track you goals!</h1>
        </div>
        {/* --- NEW LOGO SECTION END --- */}
        
        {/* Sign In / Sign Up Toggle Tabs */}
        <div className="flex bg-blue-50 p-1 rounded-xl mb-8">
          <button 
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400'}`}
          >Sign In</button>
          <button 
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400'}`}
          >Sign Up</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              required
              placeholder="Display Name"
              className="w-full p-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}
          <input
            type="email"
            required
            placeholder="Email Address"
            className="w-full p-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full p-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

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
            className="w-full bg-blue-600 text-white font-bold p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
