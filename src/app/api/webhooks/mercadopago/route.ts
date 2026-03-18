import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
// Importamos 'after' de Next.js (disponible en Next 15+) para tareas en segundo plano
import { after } from 'next/server' 
import { sendEmail, getSubscriptionTemplate } from '@/lib/email'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const paymentId = searchParams.get('data.id') || searchParams.get('id')
  
  if (!paymentId) return NextResponse.json({ error: 'No ID provided' }, { status: 400 })

  try {
    const supabase = await createClient()
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' })
    const payment = new Payment(client)
    const paymentData = await payment.get({ id: paymentId })

    const barbershopId = paymentData.external_reference
    const status = paymentData.status
    const planName = paymentData.additional_info?.items?.[0]?.title?.toLowerCase() || 'mensual'

    if (barbershopId && status === 'approved') {
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('mp_payment_id')
          .eq('barbershop_id', barbershopId)
          .single()

        if (existingSub?.mp_payment_id === paymentId.toString()) {
          return NextResponse.json({ success: true, message: 'Already processed' })
        }

        // Lógica Dinámica de Planes
        const endDate = new Date()
        if (planName.includes('anual')) {
            endDate.setFullYear(endDate.getFullYear() + 1)
        } else {
            endDate.setDate(endDate.getDate() + 31)
        }

        await supabase
          .from('subscriptions')
          .update({ 
            status: 'active',
            mp_payment_id: paymentId.toString(),
            current_period_end: endDate.toISOString()
          })
          .eq('barbershop_id', barbershopId)

        // TAREA EN SEGUNDO PLANO (No bloquea la respuesta a Mercado Pago)
        after(async () => {
            const { data: shop } = await supabase
                .from('barbershops')
                .select('name, owner:profiles(email)')
                .eq('id', barbershopId)
                .single()

            if (shop && (shop as any).owner?.email) {
                const html = getSubscriptionTemplate({
                    barbershopName: shop.name,
                    planName: planName,
                    endDate: endDate.toLocaleDateString(),
                    amount: paymentData.transaction_amount || 0
                })
                await sendEmail({
                    to: (shop as any).owner.email,
                    subject: 'Suscripción Activada',
                    html
                })
            }
        })
    } else if (status === 'rejected' || status === 'cancelled') {
        await supabase.from('subscriptions').update({ status: 'past_due' }).eq('barbershop_id', barbershopId)
    }

    // Retornamos 200 INMEDIATAMENTE a Mercado Pago
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
