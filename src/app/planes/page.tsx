'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Zap, Crown } from 'lucide-react'

const PLANS = [
  {
    id: 'mensual',
    icon: <Zap className="w-5 h-5" />,
    title: 'Mensual',
    price: '4.999',
    period: '/mes',
    description: 'Ideal para empezar. Sin compromiso de permanencia.',
    features: [
      'Dashboard propio de tu peluquería',
      'Gestión de servicios y horarios',
      'Link público para tus clientes',
      'Hasta 200 turnos al mes',
      'Soporte por email',
    ],
  },
  {
    id: 'anual',
    icon: <Crown className="w-5 h-5" />,
    title: 'Anual',
    price: '3.999',
    period: '/mes · facturado anualmente',
    badge: '2 meses gratis',
    description: 'La opción más eficiente. Ahorrá $12.000 al año.',
    features: [
      'Todo lo del plan Mensual',
      'Turnos ilimitados',
      'Notificaciones WhatsApp (próximamente)',
      'Reportes avanzados',
      'Soporte prioritario',
    ],
  },
]

export default function PlanesPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full px-6 py-5 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div
          className="text-xl font-light tracking-widest uppercase cursor-pointer hover:text-gray-300 transition-colors"
          onClick={() => router.push('/')}
        >
          Peluquería
        </div>
        <Button
          variant="ghost"
          className="text-xs tracking-widest uppercase font-light hover:text-white hover:bg-white/5"
          onClick={() => router.push('/login')}
        >
          Iniciar Sesión
        </Button>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-20 md:py-32 animate-in fade-in duration-700">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-widest uppercase font-light text-gray-500 mb-4">Planes y Precios</p>
          <h1 className="text-5xl font-light tracking-wide uppercase mb-6">
            Elegí tu plan
          </h1>
          <p className="text-gray-400 font-light max-w-md mx-auto leading-relaxed">
            Registrá tu peluquería y comenzá a recibir turnos online en minutos.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`bg-zinc-900/40 border-white/10 rounded-none overflow-hidden relative group transition-all duration-500 hover:border-white/30 hover:bg-zinc-900/60 ${plan.id === 'anual' ? 'ring-1 ring-white/20' : ''}`}
            >
              {plan.badge && (
                <div className="absolute top-5 right-5 bg-white text-black text-[10px] tracking-widest uppercase font-light px-3 py-1">
                  {plan.badge}
                </div>
              )}
              <CardContent className="p-8">
                {/* Plan Header */}
                <div className="p-3 bg-black border border-white/5 group-hover:border-white/20 transition-colors inline-flex mb-6">
                  {plan.icon}
                </div>

                <h3 className="text-2xl font-light tracking-widest uppercase mb-2">{plan.title}</h3>
                <p className="text-gray-500 font-light text-xs leading-relaxed mb-8">{plan.description}</p>

                {/* Price */}
                <div className="flex items-end gap-2 mb-8">
                  <span className="text-gray-500 text-lg font-light">$</span>
                  <span className="text-5xl font-light tracking-tighter">{plan.price}</span>
                  <span className="text-gray-500 text-xs font-light tracking-wide mb-1">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm font-light text-gray-300">
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className="w-full bg-white text-black hover:bg-gray-200 text-xs tracking-widest uppercase font-light h-12 rounded-none transition-all shadow-lg"
                  onClick={() => router.push(`/pagar?plan=${plan.id}`)}
                >
                  Comenzar con {plan.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-600 font-light text-xs tracking-wide mt-12">
          Sin permanencia. Podés cancelar cuando quieras. Los precios son en ARS e incluyen IVA.
        </p>
      </main>
    </div>
  )
}
