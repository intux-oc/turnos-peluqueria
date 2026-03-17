'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  BarChart as BarChartIcon, 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Scissors, 
  Calendar as CalendarIcon 
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts'

interface Stats {
  date: string
  recaudacion: number
}

interface ServiceStat {
  name: string
  value: number
}

const COLORS = ['#ffffff', '#a1a1aa', '#71717a', '#52525b', '#3f3f46']

export default function ReportesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<Stats[]>([])
  const [serviceData, setServiceData] = useState<ServiceStat[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalAppointments, setTotalAppointments] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // 1. Get barbershop ID
      const { data: shop } = await supabase
        .from('barbershops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!shop) return

      // 2. Fetch completed appointments from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: turnos, error } = await supabase
        .from('turnos')
        .select(`
          id,
          fecha_hora,
          estado,
          servicio:servicios(nombre, precio)
        `)
        .eq('barbershop_id', shop.id)
        .eq('estado', 'completado')
        .gte('fecha_hora', thirtyDaysAgo.toISOString())

      if (error) {
        toast.error('Error al cargar datos de analytics')
        setLoading(false)
        return
      }

      processStats(turnos as any[])
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const processStats = (turnos: any[]) => {
    const revenueByDate: Record<string, number> = {}
    const popularity: Record<string, number> = {}
    let total = 0

    turnos.forEach(t => {
      const date = new Date(t.fecha_hora).toLocaleDateString()
      const price = t.servicio?.precio || 0
      revenueByDate[date] = (revenueByDate[date] || 0) + price
      
      const serviceName = t.servicio?.nombre || 'Otro'
      popularity[serviceName] = (popularity[serviceName] || 0) + 1
      total += price
    })

    // Convert revenue to array and sort by date
    const sortedRevenue = Object.entries(revenueByDate)
      .map(([date, amount]) => ({ date, recaudacion: amount }))
      .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime())

    // Convert popularity to array
    const sortedServices = Object.entries(popularity)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    setRevenueData(sortedRevenue)
    setServiceData(sortedServices)
    setTotalRevenue(total)
    setTotalAppointments(turnos.length)
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
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="mb-12">
          <Button 
            variant="ghost" 
            className="mb-6 h-8 px-0 text-gray-500 hover:text-white hover:bg-transparent tracking-widest uppercase text-xs font-light"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-3 h-3 mr-2" /> Volver al Panel
          </Button>
          <h1 className="text-4xl font-light tracking-wide mb-2 uppercase flex items-center gap-4">
            <BarChartIcon className="w-8 h-8 text-gray-400" /> Reportes & Analytics
          </h1>
          <p className="text-gray-500 font-light text-sm tracking-wide">
            Análisis de rendimiento de los últimos 30 días.
          </p>
        </div>

        {/* Global Stats Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-zinc-900/50 border-white/10 rounded-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Recaudación Total</p>
                <TrendingUp className="w-4 h-4 text-white/20" />
              </div>
              <p className="text-3xl font-light">${totalRevenue.toLocaleString('es-AR')}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/10 rounded-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Turnos Completados</p>
                <Scissors className="w-4 h-4 text-white/20" />
              </div>
              <p className="text-3xl font-light">{totalAppointments}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/10 rounded-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Periodo</p>
                <CalendarIcon className="w-4 h-4 text-white/20" />
              </div>
              <p className="text-3xl font-light">30 Días</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <Card className="bg-zinc-900/50 border-white/10 rounded-none overflow-hidden col-span-1 lg:col-span-2">
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle className="text-xs tracking-widest uppercase font-light text-white/70">Ingresos Diarios ($)</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#52525b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => val.split('/')[0] + '/' + val.split('/')[1]}
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="recaudacion" 
                      stroke="#ffffff" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRec)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Popular Services Chart */}
          <Card className="bg-zinc-900/50 border-white/10 rounded-none overflow-hidden">
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle className="text-xs tracking-widest uppercase font-light text-white/70">Top Servicios</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#52525b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0px' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Service Distribution Pie */}
          <Card className="bg-zinc-900/50 border-white/10 rounded-none overflow-hidden">
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle className="text-xs tracking-widest uppercase font-light text-white/70">Distribución de Demanda</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {serviceData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] uppercase tracking-widest text-gray-500">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
