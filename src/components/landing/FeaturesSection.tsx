import { Calendar, ShieldCheck, Palette, Users, Zap, BarChart3 } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Gestión Multi-Turno",
      desc: "Agenda inteligente con vista diaria y semanal. Olvídate de los cuadernos y los errores humanos."
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Double Booking Zero",
      desc: "Nuestra tecnología de base de datos impide físicamente que dos personas reserven el mismo horario exacto."
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Branding Personalizado",
      desc: "Carga tu logo y elige tus colores. Tu página de reserva será una extensión de tu marca."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Control de Empleados",
      desc: "Cada profesional tiene su propio calendario y acceso. Monitorea el rendimiento de tu equipo."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Reserva SaaS Rápida",
      desc: "Url única para tu negocio (ej: /b/tu-salon). Tus clientes reservan en menos de 30 segundos."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Reportes en Vivo",
      desc: "Visualiza tus ingresos diarios y estadísticas de servicios más pedidos en tiempo real."
    }
  ]

  return (
    <section id="features" className="py-32 bg-zinc-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-28">
          <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-6 uppercase">Potencia tu Salón</h2>
          <div className="h-0.5 w-24 bg-white mx-auto mb-8" />
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Hemos diseñado cada funcionalidad pensando en los retos diarios de los dueños de peluquerías modernas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {features.map((f, i) => (
            <div key={i} className="bg-black p-12 hover:bg-zinc-900/50 transition-colors duration-500 group">
              <div className="mb-8 text-gray-600 group-hover:text-white transition-colors duration-500">
                {f.icon}
              </div>
              <h3 className="text-xl font-light mb-4 tracking-widest uppercase">{f.title}</h3>
              <p className="text-gray-500 font-light leading-relaxed text-sm">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
