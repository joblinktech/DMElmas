const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_3ShCCqX9_MURKAs86dpLguANhbDJ2G6gy";
const TO_EMAIL = "daloamarket@gmail.com";
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const resend = new Resend(RESEND_API_KEY);

exports.handler = async (event) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  // Vérifier la méthode HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  }

  try {
    // Parser et valider les données
    const { 
      phone, 
      account, 
      pack, 
      screenshotBase64,
      screenshotFilename = 'screenshot.png',
      userEmail 
    } = JSON.parse(event.body);

    // Validation des champs requis
    if (!phone || !account || !pack || !screenshotBase64) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          error: 'Données manquantes',
          details: 'Tous les champs sont requis'
        })
      };
    }

    // Construction du template HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563EB;">Nouvelle preuve de paiement manuelle</h2>
            
            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Détails du pack</h3>
              <ul style="list-style: none; padding: 0;">
                <li>📦 <strong>Pack:</strong> ${pack.name}</li>
                <li>💎 <strong>Crédits:</strong> ${pack.credits}</li>
                <li>💰 <strong>Prix:</strong> ${pack.price} FCFA</li>
              </ul>
            </div>

            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Informations client</h3>
              <ul style="list-style: none; padding: 0;">
                <li>📱 <strong>Numéro débité:</strong> ${phone}</li>
                <li>👤 <strong>Compte à recharger:</strong> ${account}</li>
                <li>📧 <strong>Email:</strong> ${userEmail || 'Non renseigné'}</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 14px;">
              La capture d'écran du paiement est jointe à cet email.
            </p>
          </div>
        </body>
      </html>
    `;

    // Conversion du base64 en buffer pour la pièce jointe
    const attachmentData = screenshotBase64.split(';base64,').pop();

    // Envoi de l'email avec Resend
    const result = await resend.emails.send({
      from: 'DaloaMarket <noreply@resend.dev>',
      to: TO_EMAIL,
      subject: `🆕 Nouvelle preuve de paiement - Pack ${pack.name}`,
      html: html,
      attachments: [{
        filename: screenshotFilename,
        content: attachmentData,
        content_type: 'image/png'
      }],
      tags: [{
        name: 'category',
        value: 'manual_payment'
      }]
    });

    // Envoi d'une confirmation au client si un email est fourni
    if (userEmail) {
      await resend.emails.send({
        from: 'DaloaMarket <noreply@resend.dev>',
        to: userEmail,
        subject: '✅ Preuve de paiement reçue - DaloaMarket',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563EB;">Preuve de paiement reçue</h2>
                
                <p>Nous avons bien reçu votre preuve de paiement pour le pack suivant :</p>
                
                <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <ul style="list-style: none; padding: 0;">
                    <li>📦 <strong>Pack:</strong> ${pack.name}</li>
                    <li>💎 <strong>Crédits:</strong> ${pack.credits}</li>
                    <li>💰 <strong>Prix:</strong> ${pack.price} FCFA</li>
                  </ul>
                </div>

                <p>Notre équipe va vérifier votre paiement et créditer votre compte dans les plus brefs délais.</p>
                
                <p style="color: #666; font-size: 14px;">
                  Pour toute question, n'hésitez pas à nous contacter via la page d'aide de DaloaMarket.
                </p>
              </div>
            </body>
          </html>
        `
      });
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        message: 'Preuve de paiement envoyée avec succès',
        emailId: result.id
      })
    };

  } catch (error) {
    console.error('Erreur:', error);

    // Log détaillé de l'erreur Resend si disponible
    if (error.response) {
      console.error('Réponse d\'erreur Resend:', error.response.data);
    }

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Erreur lors de l\'envoi de la preuve de paiement',
        details: error.message,
        type: error.name || 'UnknownError'
      })
    };
  }
};
