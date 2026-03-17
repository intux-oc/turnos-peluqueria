'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { User } from '@supabase/supabase-js'
import { Scissors, ShieldCheck } from 'lucide-react'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { CTASection } from '@/components/landing/CTASection'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setRole(profile?.role || 'cliente')
      }
      setLoading(false)
    }
    checkUser()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <Toaster theme="dark" position="bottom-right" />
      
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full px-6 py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white flex items-center justify-center">
              <Scissors className="w-4 h-4 text-black" />
            </div>
            <span className="text-xl font-light tracking-widest uppercase">Intux Oc</span>
          </div>
          <div className="flex items-center gap-8">
            <Button 
              variant="ghost" 
              className="hidden md:flex text-[10px] tracking-widest uppercase font-light text-gray-500 hover:text-white"
              onClick={() => router.push('/login')}
            >
              Ingresar
            </Button>
            <Button 
              className="bg-white text-black hover:bg-gray-200 rounded-none text-[10px] tracking-widest uppercase font-light px-6"
              onClick={() => {
                if (!user) {
                  router.push('/planes')
                } else if (role === 'superadmin') {
                  router.push('/super-admin')
                } else {
                  router.push('/admin')
                }
              }}
            >
              {user ? (role === 'superadmin' ? 'Dashboard Global' : 'Mi Dashboard') : 'Registrar mi Negocio'}
            </Button>
          </div>
        </div>
      </nav>

      <HeroSection user={user} />
      <FeaturesSection />
      <CTASection />

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-zinc-950 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-6 h-6 bg-white flex items-center justify-center">
                <Scissors className="w-3 h-3 text-black" />
              </div>
              <span className="text-md font-light tracking-widest uppercase">Intux Oc</span>
            </div>
            <p className="text-gray-600 font-light text-sm max-w-sm leading-relaxed">
              La plataforma SaaS líder para la gestión de servicios de belleza y cuidado personal en Latinoamérica.
            </p>
          </div>
          <div>
            <h5 className="text-[10px] tracking-widest uppercase text-white mb-8 font-light">Plataforma</h5>
            <div className="flex flex-col gap-4 text-xs font-light text-gray-500">
              <span className="hover:text-white cursor-pointer transition-colors">Características</span>
              <span className="hover:text-white cursor-pointer transition-colors">Precios</span>
              <span className="hover:text-white cursor-pointer transition-colors">Seguridad</span>
            </div>
          </div>
          <div>
            <h5 className="text-[10px] tracking-widest uppercase text-white mb-8 font-light">Legal</h5>
            <div className="flex flex-col gap-4 text-xs font-light text-gray-500">
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.push('/privacidad')}>Privacidad</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.push('/terminos')}>Términos</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] text-gray-600 tracking-widest uppercase">
            &copy; {new Date().getFullYear()} INTUX OC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
             {/* Social placeholders */}
             <div className="w-4 h-4 border border-white/10 rounded-full" />
             <div className="w-4 h-4 border border-white/10 rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  )
}
