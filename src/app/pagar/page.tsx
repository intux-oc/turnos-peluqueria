'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Check, Building2, CreditCard, Lock } from 'lucide-react'

const PLAN_DETAILS = {
  mensual: { label: 'Plan Mensual', price: 4999, period: 'mes' },
  anual:   { label: 'Plan Anual',   price: 3999, period: 'mes · facturado anualmente' },
}

function PagarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const planId = (searchParams.get('plan') ?? 'mensual') as 'mensual' | 'anual'
  const plan = PLAN_DETAILS[planId] ?? PLAN_DETAILS.mensual

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    barbershopName: '',
    slug: '',
    address: '',
    phone: '',
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Debés iniciar sesión primero')
        router.push('/login')
        return
      }
      setLoading(false)
    }
    checkAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSlugChange = (value: string) => {
    // Auto-sanitize slug
    const clean = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    setForm(f => ({ ...f, slug: clean }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // 1. Create barbershop
      const { data: shop, error: shopError } = await supabase
        .from('barbershops')
        .insert({
          owner_id: user.id,
          name: form.barbershopName,
          slug: form.slug,
          address: form.address || null,
          phone: form.phone || null,
        })
        .select()
        .single()

      if (shopError) throw shopError

      // 2. Create subscription record (simulated payment)
      const now = new Date()
      const periodEnd = new Date()
      periodEnd.setDate(periodEnd.getDate() + (planId === 'anual' ? 365 : 30))

      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          barbershop_id: shop.id,
          plan: planId,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          amount: plan.price,
        })

      if (subError) throw subError

      // 3. Update profile role to admin
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)

      toast.success('Peluquería creada correctamente!')
      router.push(`/admin`)
      router.refresh()

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Verificando sesión...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pb-20">


      <main className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-12 mt-12">
        {/* Form Section */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-8">Configura tu peluquería</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-400">Nombre de la peluquería</Label>
              <Input 
                placeholder="Ej: Blackbeard Barbers"
                value={form.barbershopName}
                onChange={(e) => setForm(f => ({ ...f, barbershopName: e.target.value }))}
                className="bg-gray-900 border-gray-800 focus:border-white transition-all h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Slug personalizado (stitch.pro/tu-nombre)</Label>
              <Input 
                placeholder="tu-peluqueria" 
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="bg-gray-900 border-gray-800 focus:border-white transition-all h-12"
                required
              />
              <p className="text-xs text-gray-500">Este será el link que compartirás con tus clientes.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Dirección</Label>
              <Input 
                placeholder="Calle Falsa 123" 
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                className="bg-gray-900 border-gray-800 focus:border-white transition-all h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Teléfono de contacto</Label>
              <Input 
                placeholder="+54 9 11 ..." 
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                className="bg-gray-900 border-gray-800 focus:border-white transition-all h-12"
              />
            </div>

            <div className="pt-4 border-t border-gray-900">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">Pago seguro procesado por Intux Oc</span>
              </div>
              <Button 
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black hover:bg-gray-200 h-14 font-bold text-lg rounded-full"
              >
                {submitting ? 'Creando...' : 'Pagar y crear peluquería'}
              </Button>
            </div>
          </form>
        </section>

        {/* Order Summary */}
        <aside>
          <Card className="bg-gray-900 border-white/10 overflow-hidden sticky top-24">
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Resumen de orden</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Suscripción SaaS Profesional</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Plan seleccionado</span>
                  <span className="font-medium text-white">{plan.label}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Periodo</span>
                  <span className="font-medium text-white">30 días</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Monto del abono</span>
                  <span className="font-medium text-white">${plan.price.toLocaleString()} ARS</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-white">Total hoy</span>
                  <span className="text-2xl font-bold text-white">${plan.price.toLocaleString()} ARS</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider">
                  Al confirmar, aceptas que Intux Oc realice el cargo mensual de ${plan.price.toLocaleString()}. Podes cancelar en cualquier momento de forma instantánea.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                {[
                  'Agenda online ilimitada',
                  'Gestión de múltiples peluqueros',
                  'Panel de administración profesional',
                  'Soporte prioritario'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-400">
                    <Check className="w-3 h-3 text-white" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}

export default function PagarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Cargando...</div>
      </div>
    }>
      <PagarContent />
    </Suspense>
  )
}
