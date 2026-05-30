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
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:480px">

        <!-- Header -->
        <tr><td align="center" style="padding-bottom:28px">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#0f172a;border-radius:12px;width:38px;height:38px;text-align:center;vertical-align:middle">
                <span style="color:#ffffff;font-size:18px;font-weight:800;line-height:38px;display:block;letter-spacing:-1px">G</span>
              </td>
              <td style="padding-left:10px;vertical-align:middle">
                <span style="font-size:16px;font-weight:800;color:#0f172a;letter-spacing:-0.4px">Gravio</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:32px;overflow:hidden;box-shadow:0 10px 30px -10px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.02)">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:28px">
          <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;font-weight:500">
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
      <tr><td style="padding:40px 40px 24px">
        <!-- Icon Badge -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          <tr><td style="background:#f1f5f9;border-radius:9999px;width:48px;height:48px;text-align:center;vertical-align:middle">
            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwZjE3MmEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSI3LjUiIGN5PSIxNS41IiByPSI1LjUiLz48cGF0aCBkPSJtMjEgMi05LjYgOS42Ii8+PHBhdGggZD0ibTE1LjUgNy41IDMgMyIvPjwvc3ZnPg==" width="22" height="22" style="display:block;margin:0 auto;vertical-align:middle" alt="Key" />
          </td></tr>
        </table>

        <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px">Accedi a Gravio</h1>
        <p style="margin:0;font-size:14px;color:#475569;line-height:1.6">
          Hai richiesto un link di accesso. Clicca il pulsante qui sotto per entrare nel tuo account.
        </p>
      </td></tr>

      <tr><td style="padding:0 40px 32px">
        <a href="${url}"
           style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:14px 32px;border-radius:9999px;letter-spacing:-0.2px">
          Accedi ora →
        </a>
      </td></tr>

      <tr><td style="padding:28px 40px;background:#f8fafc;border-top:1px solid #f1f5f9">
        <p style="margin:0;font-size:12px;color:#64748b;line-height:1.7">
          Il link è valido per <strong style="color:#334155">15 minuti</strong>.<br>
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
      <tr><td style="padding:40px 40px 16px">
        <!-- Icon Badge -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          <tr><td style="background:#f1f5f9;border-radius:9999px;width:48px;height:48px;text-align:center;vertical-align:middle">
            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwZjE3MmEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCA0IDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==" width="22" height="22" style="display:block;margin:0 auto;vertical-align:middle" alt="User" />
          </td></tr>
        </table>

        <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px">Benvenuto, ${name}!</h1>
        <p style="margin:0;font-size:14px;color:#475569;line-height:1.6">
          Il tuo account Gravio è pronto. Attivalo per iniziare a gestire le tue finanze in qualsiasi valuta.
        </p>
      </td></tr>

      <tr><td style="padding:16px 40px 28px">
        <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:20px;width:100%">
          <tr><td style="padding:16px 20px">
            <p style="margin:0;font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:4px">Accesso senza password</p>
            <p style="margin:0;font-size:13px;color:#475569;line-height:1.6">
              Dopo l'attivazione non avrai bisogno di alcuna password. Riceverai un <strong style="color:#0f172a">Magic Link</strong> sicuro via email ogni volta che desideri accedere.
            </p>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:0 40px 32px">
        <a href="${url}"
           style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:14px 32px;border-radius:9999px;letter-spacing:-0.2px">
          Attiva il mio account →
        </a>
      </td></tr>

      <tr><td style="padding:28px 40px;background:#f8fafc;border-top:1px solid #f1f5f9">
        <p style="margin:0;font-size:12px;color:#64748b;line-height:1.7">
          Il link di attivazione è valido per <strong style="color:#334155">24 ore</strong>.<br>
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
      <tr><td style="padding:40px 40px 24px">
        <!-- Icon Badge -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          <tr><td style="background:#f1f5f9;border-radius:9999px;width:48px;height:48px;text-align:center;vertical-align:middle">
            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwZjE3MmEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTYiIHg9IjIiIHk9IjQiIHJ4PSIyIi8+PHBhdGggZD0ibTIyIDctOC45NyA1LjdhMS45NCAxLjk0IDAgMCAxLTIuMDYgMEwyIDciLz48L3N2Zz4=" width="22" height="22" style="display:block;margin:0 auto;vertical-align:middle" alt="Mail" />
          </td></tr>
        </table>

        <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px">Verifica la tua email</h1>
        <p style="margin:0;font-size:14px;color:#475569;line-height:1.6">
          Ci siamo quasi. Clicca il pulsante qui sotto per confermare il tuo indirizzo email e completare la registrazione su Gravio.
        </p>
      </td></tr>

      <tr><td style="padding:0 40px 32px">
        <a href="${url}"
           style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:14px 32px;border-radius:9999px;letter-spacing:-0.2px">
          Verifica email →
        </a>
      </td></tr>

      <tr><td style="padding:28px 40px;background:#f8fafc;border-top:1px solid #f1f5f9">
        <p style="margin:0;font-size:12px;color:#64748b;line-height:1.7">
          Se non hai creato un account su Gravio, puoi ignorare questa email in tutta sicurezza.
        </p>
      </td></tr>
    </table>`;

  const html = emailBase(content);
  const text = `Benvenuto su Gravio!\n\nVerifica la tua email:\n${url}`;
  return { html, text };
}
