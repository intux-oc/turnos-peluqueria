'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'

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
        toast.success('Sesión iniciada')
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

      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Side - Image with B&W aesthetic */}
        <div className="hidden md:flex w-1/2 bg-zinc-900 border-r border-white/10 relative overflow-hidden">
           {/* Image Background */}
           <img 
             src="/background-bw.png" 
             alt="Barbershop Background" 
             className="w-full h-full object-cover grayscale opacity-40"
           />
           <div className="absolute inset-0 bg-linear-to-tr from-black via-black/40 to-transparent z-10" />
           <div className="absolute bottom-20 left-20 z-20 max-w-md">
             <h2 className="text-5xl font-light tracking-tighter mb-6 leading-tight uppercase">
               TU ESTILO,<br />PERFECCIONADO.
             </h2>
             <p className="text-gray-400 font-light leading-relaxed">
               Unite a nuestra comunidad exclusiva para agendar turnos, gestionar tu perfil y vivir una experiencia premium.
             </p>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-20 relative overflow-hidden bg-black">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/2 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12 text-center md:text-left">
              <h1 className="text-3xl font-light tracking-wide mb-3">
                {isSignUp ? 'Crear Cuenta' : 'Bienvenido de Nuevo'}
              </h1>
              <p className="text-gray-500 font-light text-sm tracking-wide">
                {isSignUp ? 'Ingresá tus datos para comenzar' : 'Ingresá tus credenciales para continuar'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-xs tracking-widest uppercase text-gray-400 font-light">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={isSignUp}
                      placeholder="Juan Pérez"
                      className="pl-12 bg-transparent border-white/20 focus:border-white text-white h-14 rounded-none font-light placeholder:text-gray-600 transition-colors"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-xs tracking-widest uppercase text-gray-400 font-light">Dirección de Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ejemplo@email.com"
                    className="pl-12 bg-transparent border-white/20 focus:border-white text-white h-14 rounded-none font-light placeholder:text-gray-600 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs tracking-widest uppercase text-gray-400 font-light">Contraseña</Label>
                  {!isSignUp && (
                    <span className="text-xs font-light text-gray-500 hover:text-white cursor-pointer transition-colors">
                      ¿Olvidaste tu contraseña?
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
                {loading ? 'Procesando...' : (
                  <>
                    <span>{isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-12 text-center text-sm text-gray-500 font-light">
              {isSignUp ? '¿Ya tenés una cuenta?' : '¿Nuevo en Intux Oc?'}
              <button
                type="button"
                className="ml-2 font-medium text-white hover:text-gray-300 transition-colors uppercase tracking-widest text-xs"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
