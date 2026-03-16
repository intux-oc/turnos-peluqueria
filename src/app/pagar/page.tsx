'use client'

import { useEffect, useState } from 'react'
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

export default function PagarPage() {
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

      toast.success('¡Peluquería registrada exitosamente!', {
        description: `Tu link público es: /b/${form.slug}`,
      })

      router.push(`/admin`)
    } catch (error: any) {
      toast.error('Error al procesar el pago', { description: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full px-6 py-5 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div
          className="text-xl font-light tracking-widest uppercase cursor-pointer hover:text-gray-300 transition-colors"
          onClick={() => router.push('/planes')}
        >
          Peluquería
        </div>
        <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase font-light text-gray-500">
          <Lock className="w-3 h-3" /> Pago Seguro
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-16 md:py-24 animate-in fade-in duration-700">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: Form */}
          <div>
            <p className="text-[10px] tracking-widest uppercase font-light text-gray-500 mb-4">Paso final</p>
            <h1 className="text-3xl font-light tracking-wide uppercase mb-2">Activá tu peluquería</h1>
            <p className="text-gray-500 font-light text-sm mb-10">
              Completá los datos de tu peluquería y procesá el pago.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">
                  Nombre de la Peluquería
                </Label>
                <Input
                  required
                  className="bg-zinc-900/50 border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 transition-all font-light"
                  placeholder="Ej. Cortes Urbanos"
                  value={form.barbershopName}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm(f => ({ ...f, barbershopName: val }))
                    // Auto-generate slug if the user hadn't custom-typed one
                    if (!form.slug) {
                      handleSlugChange(val)
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">
                  URL Pública (slug)
                </Label>
                <div className="flex items-center gap-0">
                  <span className="h-12 px-4 flex items-center bg-zinc-900 border border-white/10 border-r-0 text-xs text-gray-600 font-light whitespace-nowrap">
                    /b/
                  </span>
                  <Input
                    required
                    className="bg-zinc-900/50 border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 transition-all font-light"
                    placeholder="cortes-urbanos"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-600 font-light">
                  Tus clientes reservarán en: <span className="text-gray-400">/b/{form.slug || 'tu-peluqueria'}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Dirección</Label>
                  <Input
                    className="bg-zinc-900/50 border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 font-light"
                    placeholder="Av. Corrientes 1234"
                    value={form.address}
                    onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Teléfono</Label>
                  <Input
                    className="bg-zinc-900/50 border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 font-light"
                    placeholder="11-1234-5678"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Simulated payment section */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <span className="text-[10px] tracking-widest uppercase font-light text-gray-500">Datos de pago</span>
                </div>
                <div className="p-5 border border-white/10 bg-zinc-900/30 text-center">
                  <p className="text-xs font-light text-gray-500 tracking-wide">
                    Integración con Mercado Pago / Stripe próximamente.
                  </p>
                  <p className="text-xs font-light text-gray-600 mt-1">
                    Por ahora el pago se registrará como activo de prueba.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black hover:bg-gray-200 text-xs tracking-widest uppercase font-light h-12 rounded-none transition-all shadow-lg"
              >
                {submitting ? 'Procesando...' : 'Activar Peluquería'}
              </Button>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:sticky lg:top-24">
            <Card className="bg-zinc-900/40 border-white/10 rounded-none">
              <CardContent className="p-8">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-6">Resumen</p>

                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-light tracking-wide">{plan.label}</h3>
                    <p className="text-xs text-gray-500 font-light mt-1">Facturación {planId === 'anual' ? 'anual' : 'mensual'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light">${plan.price.toLocaleString('es-AR')}</p>
                    <p className="text-xs text-gray-600 font-light">/{plan.period}</p>
                  </div>
                </div>

                <div className="space-y-3 pb-6 border-b border-white/5">
                  {[
                    'Dashboard propio',
                    'Link público para clientes',
                    'Gestión de turnos',
                    'Servicios y horarios',
                    planId === 'anual' ? 'Soporte prioritario' : 'Soporte por email',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="text-xs font-light text-gray-400">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 flex justify-between items-center">
                  <span className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Total hoy</span>
                  <span className="text-lg font-light">${plan.price.toLocaleString('es-AR')}</span>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-gray-600 font-light text-xs tracking-wide mt-4">
              Podés cancelar en cualquier momento desde tu panel.
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}
