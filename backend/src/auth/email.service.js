import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const API_BASE_URL = process.env.API_PUBLIC_URL || 'http://localhost:3000';
const FROM_ADDRESS = 'Detox Mental <no-reply@detoxmental.es>';

export async function sendMagicLinkEmail(email, rawToken) {
  const loginUrl = `${API_BASE_URL}/auth/verify?token=${encodeURIComponent(rawToken)}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Tu enlace de acceso a Detox Mental',
    html: buildEmailHtml(loginUrl),
    text: buildEmailText(loginUrl),
  });

}

function buildEmailHtml(loginUrl) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: sans-serif; background: #f9f9f9; padding: 40px 0; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <tr>
      <td>
        <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px;">Tu enlace de acceso a Detox Mental</h2>
        <p style="margin: 0 0 24px; color: #444; line-height: 1.6;">
          Haz clic en el botón de abajo para iniciar sesión. Este enlace es válido por <strong>15 minutos</strong> y solo puede usarse una vez.
        </p>
        <a href="${loginUrl}"
           style="display: inline-block; padding: 12px 28px; background: #845d43; color: #F4F2F0; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
          Iniciar sesión
        </a>
        <p style="margin: 24px 0 0; color: #999; font-size: 13px;">
          Si no solicitaste este enlace, puedes ignorar este correo de forma segura.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buildEmailText(loginUrl) {
  return [
    'Tu enlace de acceso a Detox Mental',
    '',
    'Visita el siguiente enlace para iniciar sesión. Es válido por 15 minutos y solo puede usarse una vez:',
    '',
    loginUrl,
    '',
    'Si no solicitaste este enlace, ignora este correo.',
  ].join('\n');
}
