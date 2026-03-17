'use client'

import { Button } from '@/components/ui/button'
import { BarChart3, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActionCards() {
  const router = useRouter()
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Accesos Rápidos</h3>
      <div className="grid gap-3">
        <Button 
          variant="secondary" 
          className="w-full justify-start h-14 bg-gray-900 border-gray-800 hover:bg-gray-800"
          onClick={() => router.push('/admin/reportes')}
        >
          <BarChart3 className="h-5 w-5 mr-3 text-blue-400" />
          Reportes de Negocio
        </Button>
        <Button 
          variant="secondary" 
          className="w-full justify-start h-14 bg-gray-900 border-gray-800 hover:bg-gray-800"
          onClick={() => router.push('/admin/empleados')}
        >
          <Users className="h-5 w-5 mr-3 text-green-400" />
          Gestión de Personal
        </Button>
      </div>
    </div>
  )
}
