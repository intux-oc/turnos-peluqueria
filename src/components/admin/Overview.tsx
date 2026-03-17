import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Stats } from '@/lib/services/stats'
import { TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'

interface OverviewProps {
  stats: Stats
  tasaCancelacion: number
}

export function Overview({ stats, tasaCancelacion }: OverviewProps) {
  const cards = [
    {
      title: 'Total Hoy',
      value: stats.totalTurnos,
      icon: TrendingUp,
      color: 'text-white',
    },
    {
      title: 'Pendientes',
      value: stats.turnosPendientes,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'Confirmados',
      value: stats.turnosConfirmados,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Completados',
      value: stats.turnosCompletados,
      icon: CheckCircle,
      color: 'text-blue-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <Card key={card.title} className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-gray-400">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}