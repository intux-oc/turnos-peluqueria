import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Turnos Peluquería <onboarding@resend.dev>', // Cambiar por dominio propio en producción
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected email error:', error);
    return { success: false, error };
  }
};

export const getConfirmationTemplate = (data: {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  barbershopName: string;
  address?: string;
}) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px; border: 1px solid #333;">
      <h1 style="font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Reserva Confirmada</h1>
      <p style="color: #888; font-size: 14px;">Hola ${data.customerName},</p>
      <p style="line-height: 1.6;">Tu reserva en <strong>${data.barbershopName}</strong> ha sido confirmada con éxito.</p>
      
      <div style="background-color: #111; padding: 20px; border: 1px solid #222; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #555; letter-spacing: 1px;">Detalles del Servicio</p>
        <p style="margin: 0; font-size: 18px; font-weight: 300;">${data.serviceName}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #aaa;">${data.date} a las ${data.time}</p>
        ${data.address ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Dirección: ${data.address}</p>` : ''}
      </div>

      <p style="font-size: 12px; color: #555; margin-top: 40px;">
        Si necesitas cancelar o reprogramar, por favor hazlo desde tu panel de "Mis Turnos" con al menos 2 horas de anticipación.
      </p>
      <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;">
      <p style="text-align: center; font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 1px;">
        Impulsado por Turnos Peluquería SaaS
      </p>
    </div>
  `;
};

export const getSubscriptionTemplate = (data: {
  barbershopName: string;
  planName: string;
  endDate: string;
  amount: number;
}) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px; border: 1px solid #333;">
      <h1 style="font-weight: 300; letter-spacing: 2px; text-transform: uppercase; color: #f59e0b;">Suscripción Activada</h1>
      <p style="color: #888; font-size: 14px;">Hola,</p>
      <p style="line-height: 1.6;">Gracias por confiar en nuestra plataforma. Tu suscripción para <strong>${data.barbershopName}</strong> ya está activa.</p>
      
      <div style="background-color: #111; padding: 20px; border: 1px solid #222; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #555; letter-spacing: 1px;">Detalles del Plan</p>
        <p style="margin: 0; font-size: 18px; font-weight: 300;">${data.planName}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #aaa;">Monto pagado: $${data.amount}</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Válido hasta: ${data.endDate}</p>
      </div>

      <p style="line-height: 1.6;">Ya puedes acceder a todas las funcionalidades del panel administrativo y recibir turnos de tus clientes.</p>
      
      <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;">
      <p style="text-align: center; font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 1px;">
        Turnos Peluquería SaaS - Sistema de Gestión Profesional
      </p>
    </div>
  `;
};
