'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'
import { UserCircle, Save, Mail, User as UserIcon, Phone } from 'lucide-react'

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Fetch perfil
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
      }
      setLoading(false)
    }
    checkUser()
  }, [supabase, router])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      toast.success('¡Perfil actualizado!', {
        description: 'Tus datos se guardaron correctamente.',
      })
    } catch (error: any) {
      toast.error('Ocurrió un error', {
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] relative overflow-hidden bg-background py-10 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-2xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex mx-auto justify-center sm:justify-start items-center gap-3">
            <span className="bg-gradient-to-tr from-primary/20 to-primary/5 p-2 rounded-xl border border-primary/20 text-primary shadow-inner">
              <UserCircle className="h-8 w-8" />
            </span>
            Ajustes de Perfil
          </h1>
          <p className="text-muted-foreground mt-3 text-lg leading-relaxed max-w-xl mx-auto sm:mx-0">
            Gestioná tu información personal y datos de contacto para tus próximos turnos.
          </p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <CardHeader className="bg-black/20 border-b border-white/5 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
               <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flexitems-center justify-center text-primary border border-primary/30 shadow-inner flex items-center shrink-0">
                 <UserCircle className="h-10 w-10 mx-auto" />
               </div>
               <div className="pt-2 sm:pt-4">
                  <CardTitle className="text-2xl font-bold">{fullName || 'Tu Perfil'}</CardTitle>
                  <CardDescription className="text-base mt-1">Mantén tus datos actualizados para una mejor experiencia.</CardDescription>
               </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-foreground/80 font-medium ml-1">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <Input 
                    id="email" 
                    value={user.email} 
                    disabled 
                    className="pl-10 bg-black/40 border-white/5 text-muted-foreground h-12 cursor-not-allowed opacity-70"
                  />
                </div>
                <p className="text-xs text-muted-foreground ml-1">El correo electrónico no se puede modificar.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-foreground/80 font-medium ml-1">Nombre Completo</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-foreground h-12 transition-all hover:bg-black/30"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-foreground/80 font-medium ml-1">Teléfono / WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +54 9 11 1234 5678"
                    className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-foreground h-12 transition-all hover:bg-black/30"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row justify-end gap-4 border-t border-white/5">
              <Button 
                onClick={() => router.push('/')} 
                variant="ghost"
                className="h-12 px-6 hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving || !fullName}
                className="h-12 px-8 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] group"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    <span>Guardando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span>Guardar Cambios</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
