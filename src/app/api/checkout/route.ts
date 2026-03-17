import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const { barbershopId, planId } = await request.json()
    const supabase = await createClient()

    // 1. Validar que la peluquería existe
    const { data: barbershop, error: shopError } = await supabase
      .from('barbershops')
      .select('*')
      .eq('id', barbershopId)
      .single()

    if (shopError || !barbershop) {
      return NextResponse.json({ error: 'Peluquería no encontrada' }, { status: 404 })
    }

    // 2. Definir planes (esto podría estar en la DB, pero lo hardcodeamos para el MVP)
    const plans: Record<string, { title: string, price: number }> = {
      'mensual': { title: 'Plan Mensual SaaS', price: 5000 },
      'anual': { title: 'Plan Anual SaaS', price: 50000 }
    }

    const plan = plans[planId]
    if (!plan) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })
    }

    // 3. Configurar Mercado Pago con el token del SUPERADMIN (desde env)
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN || '' 
    })

    const preference = new Preference(client)

    // 4. Crear la preferencia de suscripción
    const body = {
      items: [
        {
          id: planId,
          title: plan.title,
          unit_price: plan.price,
          quantity: 1,
          currency_id: 'ARS'
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/suscripcion?status=success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/suscripcion?status=failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/suscripcion?status=pending`
      },
      auto_return: 'approved',
      external_reference: barbershopId, // Usamos barbershopId para el webhook
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`
    }

    const response = await preference.create({ body })

    // 5. Crear registro de suscripción pendiente en la DB
    await supabase
      .from('subscriptions')
      .insert({
        barbershop_id: barbershopId,
        plan_id: planId,
        status: 'pending',
        mp_preference_id: response.id,
        amount: plan.price
      })

    return NextResponse.json({ id: response.id, init_point: response.init_point })

  } catch (error: any) {
    console.error('Error creating subscription preference:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
