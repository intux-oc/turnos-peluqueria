'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Star, MessageSquare, ArrowLeft, Trash2 } from 'lucide-react'
import { Review } from '@/types/database'

export default function ResenasPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: shop } = await supabase
        .from('barbershops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (shop) {
        const { data: res } = await supabase
          .from('reviews')
          .select(`
            *,
            cliente:profiles(full_name, email)
          `)
          .eq('barbershop_id', shop.id)
          .order('created_at', { ascending: false })
        
        if (res) setReviews(res as any)
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase, router])

  const deleteReview = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) return
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Error al eliminar')
    } else {
      toast.success('Reseña eliminada')
      setReviews(reviews.filter(r => r.id !== id))
    }
  }

  if (loading) return null

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <Button 
            variant="ghost" 
            className="mb-6 h-8 px-0 text-gray-500 hover:text-white hover:bg-transparent tracking-widest uppercase text-xs font-light"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-3 h-3 mr-2" /> Volver al Panel
          </Button>
          <h1 className="text-4xl font-light tracking-wide mb-2 uppercase flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-amber-500" /> Reseñas de Clientes
          </h1>
          <p className="text-gray-500 font-light text-sm tracking-wide">
            Leé y gestioná lo que tus clientes opinan de tu servicio.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {reviews.length === 0 ? (
            <div className="p-12 border border-white/10 border-dashed text-center">
              <p className="text-gray-500 font-light uppercase tracking-widest text-xs">Aún no recibiste reseñas.</p>
            </div>
          ) : (
            reviews.map((r) => (
              <Card key={r.id} className="bg-zinc-900 border-white/10 rounded-none group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${r.rating >= s ? 'fill-amber-500 text-amber-500' : 'text-gray-800'}`} />
                        ))}
                      </div>
                      <p className="text-sm font-light text-white mb-1">{r.cliente?.full_name || 'Cliente'}</p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteReview(r.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {r.comment && (
                    <p className="text-gray-400 font-light text-sm leading-relaxed border-l border-white/10 pl-4 py-1 italic">
                      "{r.comment}"
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
