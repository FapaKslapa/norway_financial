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

export function magicLinkEmail(url: string): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;padding:40px;border:1px solid #e8e8ed">
        <tr><td align="center" style="padding-bottom:32px">
          <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="width:36px;height:36px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;display:flex;align-items:center;justify-content:center">
              <span style="font-size:18px;line-height:1">◈</span>
            </div>
          </div>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px">Gravio</h1>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7280">Gestione finanziaria multivaluta</p>
        </td></tr>
        <tr><td style="padding-bottom:24px">
          <h2 style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1a1a1a">Accedi al tuo account</h2>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
            Clicca il pulsante qui sotto per accedere a Gravio. Il link è valido per 15 minuti.
          </p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px">
          <a href="${url}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 32px;border-radius:10px;letter-spacing:-0.1px">
            Accedi a Gravio
          </a>
        </td></tr>
        <tr><td style="border-top:1px solid #f0f0f5;padding-top:20px">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;line-height:1.6">
            Se non hai richiesto questo link, puoi ignorare questa email.<br>
            Il link scade automaticamente dopo 15 minuti.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Gravio — Accedi\n\nClicca il link per accedere:\n${url}\n\nIl link scade dopo 15 minuti.`;
  return { html, text };
}

export function activationEmail(
  url: string,
  name: string,
): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;padding:40px;border:1px solid #e8e8ed">
        <tr><td align="center" style="padding-bottom:28px">
          <div style="width:48px;height:48px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px">Gravio</h1>
          <p style="margin:6px 0 0;font-size:12px;color:#6b7280">Gestione finanziaria multivaluta</p>
        </td></tr>
        <tr><td style="padding-bottom:24px">
          <h2 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1a1a1a">Benvenuto, ${name}!</h2>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
            Il tuo account è stato creato con successo. Clicca il pulsante qui sotto per attivarlo e iniziare a usare Gravio.
          </p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px">
          <a href="${url}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:13px 36px;border-radius:10px;letter-spacing:-0.1px">
            Attiva il mio account
          </a>
        </td></tr>
        <tr><td style="background:#f9fafb;border-radius:10px;padding:14px 16px;margin-bottom:20px">
          <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.6">
            Dopo l'attivazione potrai accedere tramite <strong>Magic Link</strong> — ti basterà inserire la tua email per ricevere un link di accesso istantaneo, senza password.
          </p>
        </td></tr>
        <tr><td style="border-top:1px solid #f0f0f5;padding-top:20px">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;line-height:1.6">
            Se non hai creato questo account, ignora questa email.<br>
            Il link di attivazione scade dopo 24 ore.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Benvenuto su Gravio, ${name}!\n\nAttiva il tuo account:\n${url}\n\nIl link scade dopo 24 ore.`;
  return { html, text };
}

export function verifyEmailTemplate(url: string): {
  html: string;
  text: string;
} {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;padding:40px;border:1px solid #e8e8ed">
        <tr><td align="center" style="padding-bottom:32px">
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px">Gravio</h1>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7280">Conferma il tuo indirizzo email</p>
        </td></tr>
        <tr><td style="padding-bottom:24px">
          <h2 style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1a1a1a">Benvenuto!</h2>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
            Clicca il pulsante qui sotto per verificare il tuo indirizzo email e completare la registrazione.
          </p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px">
          <a href="${url}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 32px;border-radius:10px;letter-spacing:-0.1px">
            Verifica Email
          </a>
        </td></tr>
        <tr><td style="border-top:1px solid #f0f0f5;padding-top:20px">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;line-height:1.6">
            Se non hai creato un account su Gravio, puoi ignorare questa email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Benvenuto su Gravio!\n\nVerifica la tua email:\n${url}`;
  return { html, text };
}
