import { Resend } from 'resend';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

let resendClient: Resend | null = null;

const getResendClient = () => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('Warning: RESEND_API_KEY is not defined.');
      return null;
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

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
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: new Error('Resend client not initialized (missing API key)') };
    }

    const { data, error } = await resend.emails.send({
      from: 'Intux Oc <onboarding@resend.dev>', // Dominio de prueba
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend Error Details:', JSON.stringify(error, null, 2));
      return { success: false, error };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected email error:', error);
    return { success: false, error };
  }
};

export const getConfirmationTemplate = (data: {
  customerName: string;
  serviceName: string;
  date: Date | string;
  time: string;
  barbershopName: string;
  address?: string;
}) => {
  const dateObj = typeof data.date === 'string' ? new Date(data.date) : data.date;
  const formattedDate = format(dateObj, "EEEE d 'de' MMMM", { locale: es });

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px; border: 1px solid #333;">
      <h1 style="font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Reserva Confirmada</h1>
      <p style="color: #888; font-size: 14px;">Hola ${data.customerName},</p>
      <p style="line-height: 1.6;">Tu reserva en <strong>${data.barbershopName}</strong> ha sido confirmada con éxito.</p>
      
      <div style="background-color: #111; padding: 20px; border: 1px solid #222; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #555; letter-spacing: 1px;">Detalles del Servicio</p>
        <p style="margin: 0; font-size: 18px; font-weight: 300;">${data.serviceName}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #aaa; text-transform: capitalize;">${formattedDate} a las ${data.time}</p>
        ${data.address ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Dirección: ${data.address}</p>` : ''}
      </div>

      <p style="font-size: 12px; color: #555; margin-top: 40px;">
        Si necesitas cancelar o reprogramar, por favor hazlo desde tu panel de "Mis Turnos" con al menos 2 horas de anticipación.
      </p>
      <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;">
      <p style="text-align: center; font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 1px;">
        Impulsado por Intux Oc
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
      <h1 style="font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Suscripción Activada</h1>
      <p style="color: #888; font-size: 14px;">Hola,</p>
      <p style="line-height: 1.6;">La suscripción para <strong>${data.barbershopName}</strong> ya está activa.</p>
      
      <div style="background-color: #111; padding: 20px; border: 1px solid #222; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #555; letter-spacing: 1px;">Detalles del Plan</p>
        <p style="margin: 0; font-size: 18px; font-weight: 300;">${data.planName}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #aaa;">Vence el: ${data.endDate}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #fff;">Monto: $${data.amount}</p>
      </div>

      <p style="line-height: 1.6;">Ya podés acceder a todas las funcionalidades premium desde tu panel de control.</p>
      
      <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;">
      <p style="text-align: center; font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 1px;">
        Gracias por elegir Intux Oc
      </p>
    </div>
  `;
};
