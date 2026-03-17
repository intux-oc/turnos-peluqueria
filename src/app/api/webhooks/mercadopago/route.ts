import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { sendEmail, getSubscriptionTemplate } from '@/lib/email'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const dataId = searchParams.get('data.id')

  if (type !== 'payment' && searchParams.get('topic') !== 'payment') {
    return NextResponse.json({ received: true })
  }

  const paymentId = dataId || searchParams.get('id')
  if (!paymentId) return NextResponse.json({ error: 'No data id' }, { status: 400 })

  try {
    const supabase = await createClient()
    
    // Usamos el token central del SuperAdmin
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN || '' 
    })

    const payment = new Payment(client)
    const paymentData = await payment.get({ id: paymentId })

    const barbershopId = paymentData.external_reference
    const status = paymentData.status

    if (barbershopId) {
      if (status === 'approved') {
        // 1. Actualizar suscripción a activa
        // Calculamos 31 días a partir de ahora para el plan mensual
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 31)

        await supabase
          .from('subscriptions')
          .update({ 
            status: 'active',
            mp_payment_id: paymentId.toString(),
            current_period_end: endDate.toISOString()
          })
          .eq('barbershop_id', barbershopId)
          .eq('status', 'pending')

        // Enviar email al dueño
        const { data: shop } = await supabase
          .from('barbershops')
          .select('name, owner:profiles(email)')
          .eq('id', barbershopId)
          .single()

        if (shop && (shop as any).owner?.email) {
          const html = getSubscriptionTemplate({
            barbershopName: shop.name,
            planName: paymentData.additional_info?.items?.[0]?.title || 'Plan SaaS',
            endDate: endDate.toLocaleDateString(),
            amount: paymentData.transaction_amount || 0
          })

          await sendEmail({
            to: (shop as any).owner.email,
            subject: 'Suscripción Activada - Turnos Peluquería',
            html
          })
        }
      } else if (status === 'rejected' || status === 'cancelled') {
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('barbershop_id', barbershopId)
          .eq('status', 'pending')
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook subscription error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
