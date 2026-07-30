const http = require('http');

const PORT = 3002;
const DEFAULT_RESEND_KEY = process.env.RESEND_API_KEY || '';

// Helper to ensure sender display name is always "We Anonymous"
function formatSender(emailInput) {
  if (!emailInput || !emailInput.includes('@')) {
    return 'We Anonymous <onboarding@resend.dev>';
  }
  if (emailInput.includes('<') && emailInput.includes('>')) {
    return emailInput;
  }
  return `We Anonymous <${emailInput.trim()}>`;
}

// Visual Brand Dark HTML Template with Custom CTA Button Text & Link
function generateBrandHtmlEmail(textMessage, recipientEmail = '', buttonText = '', buttonUrl = '') {
  const paragraphs = textMessage.trim().split(/\n\n+/);
  const formattedBody = paragraphs.map(p => {
    const withLinks = p.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #d5fc47; text-decoration: underline;">$1</a>');
    return `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #e2e8f0; font-size: 15px;">${withLinks.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  const unsubUrl = `https://join.weanonymous.in/unsubscribe.html?email=${encodeURIComponent(recipientEmail)}`;

  let ctaButtonHtml = '';
  if (buttonText && buttonUrl) {
    ctaButtonHtml = `
              <!-- Call To Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}" target="_blank" style="display: inline-block; width: 100%; box-sizing: border-box; background-color: #d5fc47; color: #080808; text-decoration: none; font-size: 15px; font-weight: 700; text-align: center; padding: 16px 24px; border-radius: 999px; letter-spacing: 0.01em; box-shadow: 0 4px 14px rgba(213, 252, 71, 0.25);">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We Anonymous</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080808; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #fefefe; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #080808; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #111111; border: 1px solid rgba(254, 254, 254, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid rgba(254, 254, 254, 0.08); background-color: #141414;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 4px 12px; background-color: rgba(213, 252, 71, 0.12); border: 1px solid rgba(213, 252, 71, 0.3); border-radius: 999px; color: #d5fc47; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;">
                      Free · Cybersecurity Community
                    </span>
                    <h1 style="margin: 12px 0 0; font-size: 24px; font-weight: 800; color: #fefefe; letter-spacing: -0.02em;">
                      We Anonymous
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; background-color: #111111;">
              ${formattedBody}
              ${ctaButtonHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(254, 254, 254, 0.08); background-color: #0d0d0d; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: rgba(254, 254, 254, 0.5);">
                We respect your privacy. No spam, ever. · <a href="${unsubUrl}" target="_blank" style="color: rgba(254, 254, 254, 0.6); text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: rgba(254, 254, 254, 0.3);">
                © 2026 We Anonymous Cybersecurity Community · All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/send-email') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { to, subject, text, html, from, apiKey, templateMode, buttonText, buttonUrl } = payload;

        const targetTo = Array.isArray(to) ? to[0] : to;
        const keyToUse = apiKey || DEFAULT_RESEND_KEY;
        let fromEmail = formatSender(from);
        const unsubUrl = `https://join.weanonymous.in/unsubscribe.html?email=${encodeURIComponent(targetTo)}`;

        let emailPayload = {};

        if (templateMode === 'primary') {
          // PURE PLAIN TEXT MODE (Bypasses Gmail Promotions Filter)
          const plainTextBody = `${text || ''}\n\n---\nWe Anonymous Community\nUnsubscribe: ${unsubUrl}`;
          emailPayload = {
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            text: plainTextBody
          };
        } else {
          // VISUAL BRAND DARK MODE
          const btnText = buttonText !== undefined ? buttonText : 'Join WhatsApp Community →';
          const btnUrl = buttonUrl !== undefined ? buttonUrl : 'https://chat.whatsapp.com/HSpSgCon0LSKbtT1ptEjzI';

          const finalHtml = html && html.includes('<table') ? html : generateBrandHtmlEmail(text || html || '', targetTo, btnText, btnUrl);
          emailPayload = {
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            text: text || '',
            html: finalHtml,
            headers: {
              'List-Unsubscribe': `<${unsubUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
            }
          };
        }

        console.log(`[Email Dispatch Request] Target: ${targetTo} | Mode: ${templateMode || 'brand'} | Btn: "${buttonText || 'default'}" | Subject: "${subject}"`);

        // Dispatch Email
        let response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyToUse}`
          },
          body: JSON.stringify(emailPayload)
        });

        let data = await response.json();

        // Smart Fallback
        if (!response.ok && data.message && data.message.includes('domain is not verified')) {
          console.warn(`[Domain Unverified Notice]: "${fromEmail}" is not verified on Resend yet. Retrying dispatch automatically with "We Anonymous <onboarding@resend.dev>"...`);
          
          emailPayload.from = 'We Anonymous <onboarding@resend.dev>';
          response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${keyToUse}`
            },
            body: JSON.stringify(emailPayload)
          });
          data = await response.json();
        }

        console.log(`[Resend API Response] Status: ${response.status}:`, data);

        res.writeHead(response.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (err) {
        console.error('[Resend Proxy Server Error]:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`We Anonymous Mailer Server running on http://localhost:${PORT}`);
  console.log(`=================================================`);
});
