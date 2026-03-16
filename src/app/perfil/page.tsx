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
import { UserCircle, Save, Mail, User as UserIcon, Phone, LogOut, Settings, History, CalendarDays } from 'lucide-react'
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
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 px-6 py-6 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="text-xl font-light tracking-widest uppercase cursor-pointer hover:text-gray-300 transition-colors" onClick={() => router.push('/')}>
          Peluquería
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-light text-gray-400">Welcome, {fullName || 'User'}</span>
          <Button 
            variant="ghost" 
            className="text-xs tracking-widest uppercase font-light hover:text-white hover:bg-white/5 data-[state=open]:bg-white/5"
            onClick={async () => {
               await supabase.auth.signOut()
               router.push('/')
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center shrink-0">
              <UserIcon className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h1 className="text-4xl font-light tracking-wide mb-2">My Profile</h1>
              <p className="text-gray-500 font-light text-sm tracking-wide">
                Manage your personal information and preferences
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="h-12 border-white/20 hover:bg-white/5 hover:text-white rounded-none font-light text-gray-300 text-xs tracking-widest uppercase flex items-center gap-2"
              onClick={() => router.push('/mis-turnos')}
            >
              <History className="w-4 h-4" /> Appointments
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Quick Stats / Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-zinc-900/50 border-white/10 rounded-none">
              <CardContent className="p-6">
                <h3 className="text-xs tracking-widest uppercase text-gray-400 font-light border-b border-white/10 pb-4 mb-4 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Activity Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light text-gray-500">Total Visits</span>
                    <span className="text-lg font-light">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light text-gray-500">Upcoming</span>
                    <span className="text-lg font-light">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light text-gray-500">Member Since</span>
                    <span className="text-lg font-light">
                       {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-white/10 rounded-none">
              <CardContent className="p-6">
                 <h3 className="text-xs tracking-widest uppercase text-gray-400 font-light border-b border-white/10 pb-4 mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Preferences
                 </h3>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-light text-gray-400">Email Notifications</span>
                     <div className="w-10 h-5 bg-white rounded-full relative cursor-pointer">
                       <div className="w-4 h-4 bg-black rounded-full absolute right-0.5 top-0.5" />
                     </div>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-light text-gray-400">SMS Reminders</span>
                     <div className="w-10 h-5 bg-zinc-700 rounded-full relative cursor-pointer border border-white/20">
                       <div className="w-4 h-4 bg-gray-400 rounded-full absolute left-0.5 top-0.5" />
                     </div>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-2">
            <Card className="bg-transparent border-none">
              <CardContent className="p-0">
                <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                  
                  {/* Personal Info Section */}
                  <div>
                    <h3 className="text-sm tracking-widest uppercase text-white font-light border-b border-white/10 pb-4 mb-6">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="fullName" className="text-xs tracking-widest uppercase text-gray-400 font-light">Full Name</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="pl-12 bg-zinc-900/50 border-white/20 focus:border-white text-white h-14 rounded-none font-light placeholder:text-gray-600 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-xs tracking-widest uppercase text-gray-400 font-light">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="pl-12 bg-zinc-900/50 border-white/20 focus:border-white text-white h-14 rounded-none font-light placeholder:text-gray-600 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Security Section */}
                  <div>
                    <h3 className="text-sm tracking-widest uppercase text-white font-light border-b border-white/10 pb-4 mb-6">
                      Account Security
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-xs tracking-widest uppercase text-gray-400 font-light">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            id="email"
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="pl-12 bg-zinc-900/30 border-white/10 text-gray-500 h-14 rounded-none font-light cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-gray-500 font-light">Email address cannot be changed currently.</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-4">
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="h-14 px-8 text-sm tracking-widest uppercase font-light text-gray-400 hover:text-white hover:bg-white/5 rounded-none transition-colors"
                      onClick={() => router.push('/')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="h-14 px-12 text-sm tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 transition-all rounded-none flex items-center justify-center gap-3"
                      disabled={saving || !fullName}
                    >
                      {saving ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
