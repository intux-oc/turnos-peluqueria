'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Building2, CreditCard, TrendingUp, CheckCircle2, AlertCircle, Clock, XCircle, ArrowRight } from 'lucide-react'

interface BarbershopRow {
  id: string
  name: string
  slug: string
  created_at: string
  owner: { full_name: string | null; email: string | null }
  subscription: {
    status: string
    plan: string
    current_period_end: string | null
    amount: number | null
  } | null
}

interface Stats {
  totalBarbershops: number
  activeSubscriptions: number
  totalClients: number
  mrr: number
}

export default function SuperAdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [barbershops, setBarbershops] = useState<BarbershopRow[]>([])
  const [stats, setStats] = useState<Stats>({ totalBarbershops: 0, activeSubscriptions: 0, totalClients: 0, mrr: 0 })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'superadmin') { router.push('/'); return }

      setAuthorized(true)
      await fetchData()
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch barbershops with owner and subscription
      const { data: shops } = await supabase
        .from('barbershops')
        .select(`
          id, name, slug, created_at,
          owner:profiles!owner_id(full_name, email),
          subscription:subscriptions(status, plan, current_period_end, amount)
        `)
        .order('created_at', { ascending: false })

      // Fetch total clients
      const { count: clientCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'cliente')

      const shopsList = (shops || []).map((s: any) => ({
        ...s,
        subscription: Array.isArray(s.subscription) ? s.subscription[0] ?? null : s.subscription,
      })) as BarbershopRow[]

      const active = shopsList.filter(s => s.subscription?.status === 'active')
      const mrr = active.reduce((acc, s) => acc + (s.subscription?.amount ?? 0), 0)

      setBarbershops(shopsList)
      setStats({
        totalBarbershops: shopsList.length,
        activeSubscriptions: active.length,
        totalClients: clientCount ?? 0,
        mrr,
      })
    } finally {
      setLoading(false)
    }
  }

  const statusIcon = (status: string | undefined) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-white" />
      case 'trialing': return <Clock className="w-4 h-4 text-gray-400" />
      case 'past_due': return <AlertCircle className="w-4 h-4 text-gray-400" />
      case 'canceled': return <XCircle className="w-4 h-4 text-gray-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const statusLabel = (status: string | undefined) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'trialing': return 'Trial'
      case 'past_due': return 'Vencido'
      case 'canceled': return 'Cancelado'
      default: return 'Sin plan'
    }
  }

  if (!authorized || loading) {
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
        <div className="text-xl font-light tracking-widest uppercase cursor-pointer hover:text-gray-300 transition-colors" onClick={() => router.push('/')}>
          Admin de Plataforma
        </div>
        <div className="text-[10px] tracking-widest uppercase font-light text-gray-500">
          Consola de Super-Admin
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-wide uppercase mb-2">Resumen de la Plataforma</h1>
          <p className="text-gray-500 font-light text-sm tracking-wide">
            Vista global de peluquerías, clientes y suscripciones.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Peluquerías', value: stats.totalBarbershops, icon: <Building2 className="w-4 h-4 text-gray-600" /> },
            { label: 'Suscripciones Activas', value: stats.activeSubscriptions, icon: <CheckCircle2 className="w-4 h-4 text-gray-600" /> },
            { label: 'Clientes Totales', value: stats.totalClients, icon: <Users className="w-4 h-4 text-gray-600" /> },
            { label: 'MRR Estimado', value: `$${stats.mrr.toLocaleString('es-AR')}`, icon: <TrendingUp className="w-4 h-4 text-gray-600" /> },
          ].map((stat) => (
            <Card key={stat.label} className="bg-zinc-900/50 border-white/10 rounded-none hover:border-white/30 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">{stat.label}</p>
                  {stat.icon}
                </div>
                <p className="text-3xl font-light">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Barbershops Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-sm tracking-widest uppercase font-light">Peluquerías Registradas</h2>
            <span className="text-[10px] tracking-widest uppercase font-light text-gray-600">{barbershops.length} total</span>
          </div>

          {barbershops.length === 0 ? (
            <div className="py-24 border border-white/10 border-dashed text-center">
              <Building2 className="w-10 h-10 text-gray-700 mx-auto mb-4" />
              <p className="text-sm font-light text-gray-500 tracking-wide">No hay peluquerías registradas aún.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {barbershops.map((shop) => (
                <div key={shop.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/20 transition-all px-2">
                  <div className="flex items-center gap-6">
                    <div className="h-10 w-10 bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-light tracking-wide text-white">{shop.name}</h4>
                      <p className="text-[10px] tracking-widest uppercase font-light text-gray-500 mt-0.5">
                        /b/{shop.slug} · {shop.owner?.email ?? 'Sin email'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 ml-16 md:ml-0">
                    <div className="flex items-center gap-2">
                      {statusIcon(shop.subscription?.status)}
                      <span className="text-[10px] tracking-widest uppercase font-light text-gray-400">
                        {statusLabel(shop.subscription?.status)}
                        {shop.subscription?.plan ? ` · ${shop.subscription.plan}` : ''}
                      </span>
                    </div>
                    {shop.subscription?.amount && (
                      <span className="text-sm font-light text-white">${shop.subscription.amount}/mes</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] tracking-widest uppercase font-light text-gray-600 hover:text-white rounded-none border border-white/5 hover:border-white/20 h-8 px-4"
                      onClick={() => router.push(`/admin?barbershop=${shop.id}`)}
                    >
                      Ver <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
