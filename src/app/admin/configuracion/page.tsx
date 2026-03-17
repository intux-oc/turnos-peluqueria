'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ArrowLeft, Save, Palette, Image as ImageIcon } from 'lucide-react'
import { Barbershop } from '@/types/database'

export default function ConfigurationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  
  const [name, setName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#ffffff')
  const [secondaryColor, setSecondaryColor] = useState('#000000')
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    const fetchConfig = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: shop, error } = await supabase
        .from('barbershops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (error || !shop) {
        toast.error('No se encontró la peluquería')
        router.push('/admin')
        return
      }

      setBarbershop(shop as Barbershop)
      setName(shop.name)
      setPrimaryColor(shop.primary_color || '#ffffff')
      setSecondaryColor(shop.secondary_color || '#000000')
      setLogoUrl(shop.logo_url || '')
      setLoading(false)
    }

    fetchConfig()
  }, [supabase, router])

  const handleSave = async () => {
    if (!barbershop) return
    setSaving(true)

    const { error } = await supabase
      .from('barbershops')
      .update({
        name,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl
      })
      .eq('id', barbershop.id)

    if (error) {
      toast.error('Error al guardar la configuración', { description: error.message })
    } else {
      toast.success('Configuración guardada', { description: 'Los cambios se aplicarán en tu página pública.' })
    }
    setSaving(false)
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
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="mb-12">
          <Button 
            variant="ghost" 
            className="mb-6 h-8 px-0 text-gray-500 hover:text-white hover:bg-transparent tracking-widest uppercase text-xs font-light"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-3 h-3 mr-2" /> Volver al Panel
          </Button>
          <h1 className="text-4xl font-light tracking-wide mb-2 uppercase">Configuración de Marca</h1>
          <p className="text-gray-500 font-light text-sm tracking-wide">
            Personalizá la identidad visual de tu peluquería.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-zinc-900/50 border-white/10 rounded-none overflow-hidden">
              <CardHeader className="border-b border-white/10 pb-4">
                <CardTitle className="text-sm tracking-widest uppercase font-light flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Identidad Visual
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-gray-400 font-light">Nombre del Negocio</Label>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black border-white/10 focus:border-white rounded-none h-12 font-light"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs tracking-widest uppercase text-gray-400 font-light">Color Primario</Label>
                    <div className="flex gap-3">
                      <Input 
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-12 p-1 bg-black border-white/10 rounded-none cursor-pointer"
                      />
                      <Input 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 bg-black border-white/10 focus:border-white rounded-none h-12 font-mono uppercase text-xs tracking-widest"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs tracking-widest uppercase text-gray-400 font-light">Color Secundario</Label>
                    <div className="flex gap-3">
                      <Input 
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-12 p-1 bg-black border-white/10 rounded-none cursor-pointer"
                      />
                      <Input 
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 bg-black border-white/10 focus:border-white rounded-none h-12 font-mono uppercase text-xs tracking-widest"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-gray-400 font-light">URL del Logo (Opcional)</Label>
                  <Input 
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://ejemplo.com/logo.png"
                    className="bg-black border-white/10 focus:border-white rounded-none h-12 font-light"
                  />
                  <p className="text-[10px] text-gray-600 italic">Se recomienda un logo con fondo transparente (PNG).</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="h-14 px-12 text-sm tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 transition-all rounded-none flex items-center gap-2"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar Cambios
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-4">Vista Previa</p>
            <div 
              className="p-8 border border-white/10 aspect-square flex flex-col items-center justify-center text-center gap-6"
              style={{ backgroundColor: secondaryColor }}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo Preview" className="max-w-[120px] max-h-[120px] object-contain" />
              ) : (
                <div className="w-20 h-20 border border-white/10 bg-white/5 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-light tracking-widest uppercase mb-4" style={{ color: primaryColor }}>
                  {name || 'Tu Peluquería'}
                </h3>
                <div 
                  className="px-6 py-2 text-[10px] tracking-widest uppercase font-light"
                  style={{ backgroundColor: primaryColor, color: secondaryColor }}
                >
                  Reservar Turno
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-600 text-center font-light px-4 leading-relaxed">
              Esta es una aproximación de cómo se verá el encabezado en tu página pública.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
