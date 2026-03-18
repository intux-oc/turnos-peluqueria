'use client'

import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">


      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl font-light tracking-tight uppercase mb-16">Política de Privacidad</h1>
        
        <div className="space-y-12 text-gray-400 font-light leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-white text-xs tracking-widest uppercase">01. Recolección de Datos</h2>
            <p>
              Recopilamos información necesaria para la gestión de turnos, incluyendo nombre, email y teléfono. Estos datos son proporcionados voluntariamente por el usuario al registrarse o realizar una reserva.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-white text-xs tracking-widest uppercase">02. Uso de la Información</h2>
            <p>
              Utilizamos sus datos exclusivamente para facilitar la comunicación entre el cliente y la peluquería, enviar recordatorios de turnos y mejorar la experiencia del usuario en nuestra plataforma.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-white text-xs tracking-widest uppercase">03. Derechos del Usuario</h2>
            <p>
              Usted tiene derecho a acceder, rectificar o eliminar sus datos personales en cualquier momento a través de la configuración de su perfil o contactando a nuestro soporte técnico.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-white text-xs tracking-widest uppercase">04. Seguridad de la Información</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos contra acceso no autorizado, pérdida o alteración. Utilizamos encriptación de extremo a extremo para transacciones sensibles.
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
