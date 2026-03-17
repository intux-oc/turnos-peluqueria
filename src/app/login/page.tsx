'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast, Toaster } from 'sonner'
import { Sparkles, Mail, Lock, User, ArrowRight, Chrome, Apple } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
        if (error) throw error
        toast.success('¡Cuenta creada!', {
          description: 'Revisa tu email para confirmar.',
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('Sesión iniciada', {
          description: '¡Qué bueno verte de nuevo!',
        })
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      toast.error('Ocurrió un error', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <Toaster theme="dark" />
      
      {/* Navigation (simplified for login) */}
      <nav className="absolute top-0 w-full z-50 px-6 py-8">
        <div className="text-2xl font-light tracking-widest uppercase text-center cursor-pointer hover:text-gray-300 transition-colors" onClick={() => router.push('/')}>
          Peluquería
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Side - Image Placeholder */}
        <div className="hidden md:flex w-1/2 bg-zinc-900 border-r border-white/10 relative overflow-hidden">
           <div className="absolute inset-0 bg-linear-to-tr from-black/90 via-black/40 to-transparent z-10" />
           <div className="absolute bottom-20 left-20 z-20 max-w-md">
             <h2 className="text-5xl font-light tracking-tighter mb-6 leading-tight">
               YOUR STYLE,<br />PERFECTED.
             </h2>
             <p className="text-gray-400 font-light leading-relaxed">
               Join our exclusive community to book appointments, manage your profile, and experience premium grooming.
             </p>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-20 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/2 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="mb-12 text-center md:text-left">
              <h1 className="text-3xl font-light tracking-wide mb-3">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-gray-500 font-light text-sm tracking-wide">
                {isSignUp ? 'Enter your details to get started' : 'Enter your credentials to continue'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={`space-y-6 transition-all duration-500 ${isSignUp ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden m-0'}`}>
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-xs tracking-widest uppercase text-gray-400 font-light">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={isSignUp}
                      placeholder="John Doe"
                      className="pl-12 bg-transparent border-white/20 focus:border-white text-white h-14 rounded-none font-light placeholder:text-gray-600 transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-xs tracking-widest uppercase text-gray-400 font-light">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="pl-12 bg-transparent border-white/20 focus:border-white text-white h-14 rounded-none font-light placeholder:text-gray-600 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs tracking-widest uppercase text-gray-400 font-light">Password</Label>
                  {!isSignUp && (
                    <span className="text-xs font-light text-gray-500 hover:text-white cursor-pointer transition-colors">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pl-12 bg-transparent border-white/20 focus:border-white text-white h-14 rounded-none font-light placeholder:text-gray-600 transition-colors"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-sm tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 transition-all mt-8 rounded-none flex items-center justify-center gap-3 group" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3 text-black">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
            
            {/* Social Logins */}
            <div className="mt-8">
               <div className="relative flex items-center py-5">
                  <div className="w-full border-t border-white/10"></div>
                  <span className="bg-black px-4 text-xs tracking-widest uppercase text-gray-600 font-light">Or continue with</span>
                  <div className="w-full border-t border-white/10"></div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 mt-2">
                 <Button variant="outline" className="h-12 border-white/20 hover:bg-white/5 hover:text-white rounded-none font-light text-gray-400 text-xs tracking-widest uppercase flex items-center gap-2">
                   <Chrome className="w-4 h-4" /> Google
                 </Button>
                 <Button variant="outline" className="h-12 border-white/20 hover:bg-white/5 hover:text-white rounded-none font-light text-gray-400 text-xs tracking-widest uppercase flex items-center gap-2">
                   <Apple className="w-4 h-4" /> Apple
                 </Button>
               </div>
            </div>

            <div className="mt-12 text-center text-sm text-gray-500 font-light">
              {isSignUp ? 'Already have an account?' : 'New to Peluquería?'}
              <button
                type="button"
                className="ml-2 font-medium text-white hover:text-gray-300 transition-colors uppercase tracking-widest text-xs"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
