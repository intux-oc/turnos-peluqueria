import { NextResponse } from 'next/server';
import { sendEmail, getConfirmationTemplate } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { turnoId } = await request.json();
    const supabase = await createClient();

    // Obtener detalles del turno para el mail
    const { data: turno, error } = await supabase
      .from('turnos')
      .select(`
        *,
        cliente:profiles!turnos_cliente_id_fkey(full_name, email),
        servicio:servicios(nombre, precio),
        barbershop:barbershops(name, address)
      `)
      .eq('id', turnoId)
      .single();

    if (error || !turno) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
    }

    const fecha = new Date(turno.fecha_hora);
    const dateFormatted = fecha.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const timeFormatted = fecha.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = getConfirmationTemplate({
      customerName: turno.cliente?.full_name || 'Cliente',
      serviceName: turno.servicio?.nombre || 'Servicio',
      date: dateFormatted,
      time: timeFormatted,
      barbershopName: turno.barbershop?.name || 'La Peluquería',
      address: turno.barbershop?.address || '',
    });

    const result = await sendEmail({
      to: turno.cliente?.email || '',
      subject: `Reserva Confirmada - ${turno.barbershop?.name}`,
      html,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
