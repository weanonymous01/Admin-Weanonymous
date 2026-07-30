const http = require('http');

const PORT = 3002;
const DEFAULT_RESEND_KEY = process.env.RESEND_API_KEY || '';

// Helper to ensure sender display name is always "We Anonymous"
function formatSender(emailInput) {
  if (!emailInput || !emailInput.includes('@')) {
    return 'We Anonymous <onboarding@resend.dev>';
  }
  // If user already included name format like "We Anonymous <email>", keep it
  if (emailInput.includes('<') && emailInput.includes('>')) {
    return emailInput;
  }
  // Wrap plain email with "We Anonymous" display name
  return `We Anonymous <${emailInput.trim()}>`;
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
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
        const { to, subject, text, html, from, apiKey } = payload;

        const keyToUse = apiKey || DEFAULT_RESEND_KEY;
        let fromEmail = formatSender(from);

        console.log(`[Email Dispatch Request] Target: ${to} | From: "${fromEmail}" | Subject: "${subject}"`);

        // First Attempt with requested From Email
        let response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyToUse}`
          },
          body: JSON.stringify({
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            text: text || '',
            html: html || (text ? text.replace(/\n/g, '<br>') : '')
          })
        });

        let data = await response.json();

        // Smart Fallback: If custom domain is not yet verified on Resend, retry using onboarding@resend.dev with "We Anonymous" name
        if (!response.ok && data.message && data.message.includes('domain is not verified')) {
          console.warn(`[Domain Unverified Notice]: "${fromEmail}" is not verified on Resend yet. Retrying dispatch automatically with "We Anonymous <onboarding@resend.dev>"...`);
          
          fromEmail = 'We Anonymous <onboarding@resend.dev>';
          response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${keyToUse}`
            },
            body: JSON.stringify({
              from: fromEmail,
              to: Array.isArray(to) ? to : [to],
              subject: subject,
              text: text || '',
              html: html || (text ? text.replace(/\n/g, '<br>') : '')
            })
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
