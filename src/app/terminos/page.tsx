'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <nav className="fixed top-0 z-50 w-full px-6 py-8 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="text-[10px] tracking-widest uppercase font-light text-gray-500 hover:text-white flex items-center gap-2"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-3 h-3" /> Volver
          </Button>
          <span className="text-xl font-light tracking-widest uppercase">INTUX OC</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl font-light tracking-tight uppercase mb-16">Términos y Condiciones</h1>
        
        <div className="space-y-12 text-gray-400 font-light leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-white text-xs tracking-widest uppercase">01. Introducción</h2>
            <p>
              Bienvenido a INTUX OC. Al utilizar nuestra plataforma, usted acepta cumplir con estos términos y condiciones. Por favor, léalos detenidamente antes de utilizar el servicio.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-white text-xs tracking-widest uppercase">02. Obligaciones del Usuario</h2>
            <p>
              Como usuario de nuestra plataforma SaaS, usted se compromete a proporcionar información veraz y mantener la seguridad de su cuenta. Es responsable de todas las actividades que ocurran bajo sus credenciales.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-white text-xs tracking-widest uppercase">03. Pagos y Suscripciones</h2>
            <p>
              Los servicios se ofrecen bajo modelos de suscripción mensual o anual. Los pagos se procesan de forma segura. La falta de pago resultará en la suspensión temporal del acceso al panel administrativo.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-white text-xs tracking-widest uppercase">04. Cancelaciones</h2>
            <p>
              Los turnos reservados pueden cancelarse según la política establecida por cada peluquería individual. INTUX OC facilita la gestión, pero no es responsable por las políticas de cancelación de terceros.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-white text-xs tracking-widest uppercase">05. Propiedad Intelectual</h2>
            <p>
              Todo el contenido, diseño y software de INTUX OC es propiedad exclusiva de sus creadores y está protegido por leyes de propiedad intelectual internacionales.
            </p>
          </section>
        </div>

        <div className="mt-24 pt-12 border-t border-white/5 text-[10px] text-gray-600 tracking-widest uppercase">
          Última actualización: 17 de Marzo, 2026
        </div>
      </main>
    </div>
  )
}
