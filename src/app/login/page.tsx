'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react'

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
    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 border border-primary/20 text-primary mb-2 shadow-inner">
            <Sparkles className="h-7 w-7" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            {isSignUp ? 'Crear tu Cuenta' : 'Bienvenido'}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            {isSignUp ? 'Ingresa tus datos para empezar' : 'Ingresa tus credenciales para continuar'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className={`space-y-5 transition-all duration-500 ${isSignUp ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden m-0'}`}>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground/80 font-medium ml-1">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                    placeholder="Ej. Juan Pérez"
                    className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-foreground h-12 transition-all hover:bg-black/30"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 font-medium ml-1">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-foreground h-12 transition-all hover:bg-black/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-foreground/80 font-medium">Contraseña</Label>
                {!isSignUp && (
                  <span className="text-xs font-semibold text-primary/80 hover:text-primary cursor-pointer transition-colors">
                    ¿Olvidaste tu clave?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-foreground h-12 transition-all hover:bg-black/30"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] mt-2 group" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>{isSignUp ? 'Registrarme' : 'Iniciar Sesión'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {isSignUp ? '¿Ya tenés una cuenta?' : '¿Todavía no tenés cuenta?'}
            <button
              type="button"
              className="ml-2 font-semibold text-primary hover:text-primary/80 transition-colors"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Ingresar ahora' : 'Crear nueva cuenta'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
