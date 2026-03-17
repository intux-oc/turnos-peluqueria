'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { CreditCard, Check, ShieldCheck, Sparkles, Building2 } from 'lucide-react'
import { Subscription, Barbershop } from '@/types/database'

export default function SubscriptionPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: shop } = await supabase
        .from('barbershops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (shop) {
        setBarbershop(shop)
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('barbershop_id', shop.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (sub) setSubscription(sub as Subscription)
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleSubscribe = async (planId: string) => {
    if (!barbershop) return
    setPaying(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barbershopId: barbershop.id, planId })
      })

      const { init_point, error } = await res.json()
      if (error) throw new Error(error)
      if (init_point) {
        window.location.href = init_point
      }
    } catch (error: any) {
      toast.error('Error al iniciar el pago', { description: error.message })
    } finally {
      setPaying(false)
    }
  }

  if (loading) return null

  const isActive = subscription?.status === 'active' || subscription?.status === 'past_due'
  const isPastDue = subscription?.status === 'past_due'

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-wide mb-2 uppercase flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-500" /> Tu Suscripción
          </h1>
          <p className="text-gray-500 font-light text-sm tracking-wide">
            Gestioná el acceso de tu negocio a la plataforma.
          </p>
        </div>

        {isActive ? (
          <div className={`mb-12 p-8 border ${isPastDue ? 'border-amber-500/30 bg-amber-500/5' : 'border-green-500/30 bg-green-500/5'} rounded-none flex flex-col md:flex-row items-center justify-between gap-6`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${isPastDue ? 'bg-amber-500/20' : 'bg-green-500/20'} flex items-center justify-center`}>
                {isPastDue ? <CreditCard className="w-6 h-6 text-amber-500" /> : <Check className="w-6 h-6 text-green-500" />}
              </div>
              <div>
                <p className={`text-sm tracking-widest uppercase font-light ${isPastDue ? 'text-amber-500' : 'text-green-500'}`}>
                  {isPastDue ? 'Pago Pendiente (Periodo de Gracia)' : 'Suscripción Activa'}
                </p>
                <p className="text-gray-400 font-light text-xs">
                  {isPastDue ? 'Tu último pago falló. Tenés 3 días para regularizar.' : `Vence el: ${subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-widest uppercase text-gray-500 mb-1">Plan contratado</p>
              <p className="text-xl font-light uppercase tracking-widest">{subscription?.plan_id}</p>
            </div>
          </div>
        ) : (
          <div className="mb-12 p-8 border border-amber-500/30 bg-amber-500/5 rounded-none flex items-center gap-4">
            <Building2 className="w-6 h-6 text-amber-500" />
            <div>
              <p className="text-sm tracking-widest uppercase font-light text-amber-500">Sin suscripción activa</p>
              <p className="text-gray-400 font-light text-xs">Tus clientes no podrán agendar turnos hasta que actives un plan.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plan Mensual */}
          <Card className="bg-zinc-900 border-white/10 rounded-none overflow-hidden hover:border-white/30 transition-colors">
            <CardHeader className="border-b border-white/10 pb-6 text-center">
              <CardTitle className="text-xs tracking-widest uppercase font-light text-gray-400 mb-2">Plan Mensual</CardTitle>
              <p className="text-4xl font-light tracking-tighter">$5.000 <span className="text-sm text-gray-500">/mes</span></p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <ul className="space-y-4">
                {[
                  'Turnos ilimitados',
                  'Gestión de equipo',
                  'Panel de administración',
                  'Soporte prioritario'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-light text-gray-400">
                    <Check className="w-4 h-4 text-white" /> {item}
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => handleSubscribe('mensual')}
                disabled={paying}
                className="w-full h-14 bg-white text-black hover:bg-gray-200 rounded-none text-xs tracking-widest uppercase font-light"
              >
                {paying ? 'Procesando...' : 'Contratar Plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Plan Anual */}
          <Card className="bg-zinc-900 border-white/10 rounded-none overflow-hidden hover:border-white/30 transition-colors relative">
            <div className="absolute top-0 right-0 bg-amber-500 text-black px-3 py-1 text-[10px] tracking-widest uppercase font-bold">
              Best Seller
            </div>
            <CardHeader className="border-b border-white/10 pb-6 text-center">
              <CardTitle className="text-xs tracking-widest uppercase font-light text-amber-500 mb-2">Plan Anual</CardTitle>
              <p className="text-4xl font-light tracking-tighter">$50.000 <span className="text-sm text-gray-500">/año</span></p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <ul className="space-y-4">
                {[
                  'Todo lo del plan mensual',
                  '2 meses de regalo',
                  'Prioridad en actualizaciones',
                  'Configuración asistida'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-light text-gray-400">
                    <Check className="w-4 h-4 text-white" /> {item}
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => handleSubscribe('anual')}
                disabled={paying}
                className="w-full h-14 bg-amber-500 text-black hover:bg-amber-600 rounded-none text-xs tracking-widest uppercase font-light"
              >
                {paying ? 'Procesando...' : 'Contratar Plan Anual'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 flex items-center gap-3 p-4 bg-zinc-950 border border-white/5">
          <ShieldCheck className="w-4 h-4 text-gray-600" />
          <p className="text-[10px] text-gray-600 font-light tracking-wider leading-relaxed">
            Los pagos son procesados de forma segura a través de Mercado Pago. Tu suscripción se renovará automáticamente al finalizar el período contratado.
          </p>
        </div>
      </div>
    </div>
  )
}
