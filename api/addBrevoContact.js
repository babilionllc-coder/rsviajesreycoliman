export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', 'https://rsviajesreycoliman.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { nombre, email, whatsapp, destino, pasajeros, fechas, mensaje } = req.body;

  if (!email || !nombre) {
    return res.status(400).json({ error: 'Nombre y email son requeridos.' });
  }

  try {
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      console.error('CRITICAL: BREVO_API_KEY environment variable is missing.');
      return res.status(500).json({ error: 'Falta configuración del servidor.' });
    }

    // Parse and sanitize WhatsApp number
    const attributes = {
      NOMBRE: nombre,
      DESTINO: destino || '',
      PASAJEROS: pasajeros || '',
      FECHAS: fechas || '',
      MENSAJE: mensaje || '',
    };

    if (whatsapp) {
      let cleanPhone = whatsapp.replace(/\D/g, '');
      if (cleanPhone.length === 10) {
        cleanPhone = '52' + cleanPhone; // Default to Mexico (+52) if 10 digits
      }
      if (cleanPhone.length > 0) {
        attributes.WHATSAPP = '+' + cleanPhone; // Brevo requires + prefix
      }
    }

    // 1. Create/update contact in Brevo with attributes
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes,
        listIds: [6],          // List #6 — Leads Web RS Viajes (triggers automation)
        updateEnabled: true,   // Update if contact already exists
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return res.status(response.status).json({ error: 'Error comunicándose con Brevo.', details: errorData });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Brevo Server error:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor al registrar el contacto.' });
  }
}
