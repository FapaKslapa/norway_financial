import { env } from "@/env";

type BrevoEmailOptions = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
};

const FROM_EMAIL = env.BREVO_FROM_EMAIL ?? "noreply@zimaserver.it";
const FROM_NAME = env.BREVO_FROM_NAME ?? "Gravio";

export async function sendEmail({
  to,
  toName,
  subject,
  html,
  text,
}: BrevoEmailOptions): Promise<void> {
  if (env.NODE_ENV === "development") {
    console.log("\n==================================================");
    console.log(`[DEV MODE] Email to: ${to} (${toName ?? "No Name"})`);
    console.log(`Subject: ${subject}`);
    const urlRegex = /(https?:\/\/[^\s"'>]+)/g;
    const urls = (text ?? html).match(urlRegex);
    if (urls) {
      console.log("Links:");
      for (const url of urls) {
        console.log(` 👉 ${url}`);
      }
    }
    console.log("==================================================\n");
    return;
  }

  const apiKey = env.BREVO_API_KEY;

  if (!apiKey) {
    console.log(`[BREVO] No API key — skipping email to ${to}: ${subject}`);
    return;
  }

  console.log(`[BREVO] Sending "${subject}" to ${to}…`);

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to, name: toName ?? to }],
      subject,
      htmlContent: html,
      textContent: text ?? subject,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[BREVO] Error ${res.status}: ${body}`);
    throw new Error(`Brevo error ${res.status}: ${body}`);
  }

  console.log(`[BREVO] Sent OK (${res.status}) to ${to}`);
}

const emailBase = (content: string) => `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background-color:#f2f2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:480px">

        <!-- Header -->
        <tr><td align="center" style="padding-bottom:24px">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#007aff;border-radius:14px;width:44px;height:44px;text-align:center;vertical-align:middle">
                <span style="color:#ffffff;font-size:22px;font-weight:800;line-height:44px;display:block;letter-spacing:-1px">G</span>
              </td>
              <td style="padding-left:10px;vertical-align:middle">
                <span style="font-size:18px;font-weight:800;color:#1c1c1e;letter-spacing:-0.4px">Gravio</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:20px;border:1px solid #e5e5ea;overflow:hidden">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px">
          <p style="margin:0;font-size:11px;color:#aeaeb2;line-height:1.6">
            Gravio · Gestione finanziaria multivaluta<br>
            Questa email è stata inviata automaticamente, non rispondere.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

export function magicLinkEmail(url: string): { html: string; text: string } {
  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <!-- Top accent bar -->
      <tr><td style="background:#007aff;height:4px;border-radius:20px 20px 0 0"></td></tr>

      <tr><td style="padding:36px 36px 28px">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1c1c1e;letter-spacing:-0.5px">Accedi a Gravio</h1>
        <p style="margin:0;font-size:14px;color:#6c6c70;line-height:1.6">
          Hai richiesto un link di accesso. Clicca il pulsante qui sotto per entrare nel tuo account.
        </p>
      </td></tr>

      <tr><td style="padding:0 36px 32px">
        <a href="${url}"
           style="display:inline-block;background:#007aff;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;letter-spacing:-0.2px">
          Accedi ora →
        </a>
      </td></tr>

      <tr><td style="padding:24px 36px;background:#f9f9fb;border-top:1px solid #f2f2f7">
        <p style="margin:0;font-size:12px;color:#aeaeb2;line-height:1.7">
          Il link è valido per <strong style="color:#6c6c70">15 minuti</strong>.<br>
          Se non hai richiesto l'accesso, puoi ignorare questa email in tutta sicurezza.
        </p>
      </td></tr>
    </table>`;

  const html = emailBase(content);
  const text = `Gravio — Accedi\n\nClicca il link per accedere:\n${url}\n\nIl link scade dopo 15 minuti.`;
  return { html, text };
}

export function activationEmail(
  url: string,
  name: string,
): { html: string; text: string } {
  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <!-- Top accent bar -->
      <tr><td style="background:linear-gradient(90deg,#007aff,#34c759);height:4px;border-radius:20px 20px 0 0"></td></tr>

      <tr><td style="padding:36px 36px 12px">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1c1c1e;letter-spacing:-0.5px">Benvenuto, ${name}!</h1>
        <p style="margin:0;font-size:14px;color:#6c6c70;line-height:1.6">
          Il tuo account Gravio è pronto. Attivalo per iniziare a gestire le tue finanze in qualsiasi valuta.
        </p>
      </td></tr>

      <tr><td style="padding:24px 36px">
        <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f2f9ff;border-radius:12px;border:1px solid #bfdbfe;width:100%">
          <tr><td style="padding:16px 20px">
            <p style="margin:0;font-size:12px;color:#3b82f6;font-weight:600;letter-spacing:0.3px;text-transform:uppercase;margin-bottom:4px">Accesso senza password</p>
            <p style="margin:0;font-size:13px;color:#6c6c70;line-height:1.6">
              Dopo l'attivazione usi solo la tua email — ti mandiamo un <strong style="color:#1c1c1e">Magic Link</strong> istantaneo ogni volta che vuoi accedere.
            </p>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:0 36px 32px">
        <a href="${url}"
           style="display:inline-block;background:#34c759;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;letter-spacing:-0.2px">
          Attiva il mio account →
        </a>
      </td></tr>

      <tr><td style="padding:24px 36px;background:#f9f9fb;border-top:1px solid #f2f2f7">
        <p style="margin:0;font-size:12px;color:#aeaeb2;line-height:1.7">
          Il link di attivazione è valido per <strong style="color:#6c6c70">24 ore</strong>.<br>
          Se non hai creato questo account, ignora questa email.
        </p>
      </td></tr>
    </table>`;

  const html = emailBase(content);
  const text = `Benvenuto su Gravio, ${name}!\n\nAttiva il tuo account:\n${url}\n\nIl link scade dopo 24 ore.`;
  return { html, text };
}

export function verifyEmailTemplate(url: string): {
  html: string;
  text: string;
} {
  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <!-- Top accent bar -->
      <tr><td style="background:#007aff;height:4px;border-radius:20px 20px 0 0"></td></tr>

      <tr><td style="padding:36px 36px 28px">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1c1c1e;letter-spacing:-0.5px">Verifica la tua email</h1>
        <p style="margin:0;font-size:14px;color:#6c6c70;line-height:1.6">
          Ci siamo quasi. Clicca il pulsante qui sotto per confermare il tuo indirizzo email e completare la registrazione su Gravio.
        </p>
      </td></tr>

      <tr><td style="padding:0 36px 32px">
        <a href="${url}"
           style="display:inline-block;background:#007aff;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;letter-spacing:-0.2px">
          Verifica email →
        </a>
      </td></tr>

      <tr><td style="padding:24px 36px;background:#f9f9fb;border-top:1px solid #f2f2f7">
        <p style="margin:0;font-size:12px;color:#aeaeb2;line-height:1.7">
          Se non hai creato un account su Gravio, puoi ignorare questa email in tutta sicurezza.
        </p>
      </td></tr>
    </table>`;

  const html = emailBase(content);
  const text = `Benvenuto su Gravio!\n\nVerifica la tua email:\n${url}`;
  return { html, text };
}
