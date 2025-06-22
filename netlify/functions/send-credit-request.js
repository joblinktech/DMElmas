// Netlify Function : Envoi d'email avec Resend pour les demandes de crédits
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

exports.handler = async (event) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('Début du traitement de la demande de crédits...');
    
    // Vérifier la clé API Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY manquante');
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Configuration email manquante' })
      };
    }

    // Vérifier que le body existe
    if (!event.body) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Corps de la requête manquant' })
      };
    }

    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Format JSON invalide' })
      };
    }

    const { 
      selectedPack, 
      phoneNumber, 
      email, 
      fullName, 
      screenshotBase64,
      screenshotFilename 
    } = requestData;

    console.log('Données reçues:', { selectedPack, phoneNumber, email, fullName, hasScreenshot: !!screenshotBase64 });

    // Validation des données
    if (!selectedPack || !phoneNumber || !email || !fullName || !screenshotBase64) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Données manquantes' })
      };
    }

    // Informations sur les packs
    const CREDIT_PACKS = {
      'starter': { name: 'Starter', credits: 3, price: 500 },
      'regular': { name: 'Regular', credits: 10, price: 1500 },
      'pro': { name: 'Pro', credits: 30, price: 3500 }
    };

    const packInfo = CREDIT_PACKS[selectedPack];
    if (!packInfo) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Pack invalide' })
      };
    }

    console.log('Pack sélectionné:', packInfo);

    // Préparer l'email pour l'équipe
    const emailSubject = `🛍️ Nouvelle demande de crédits - Pack ${packInfo.name}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #FF7F00, #FF9933); 
              color: white; 
              padding: 30px 20px; 
              text-align: center;
            }
            .header h1 { margin: 0 0 10px 0; font-size: 24px; }
            .header p { margin: 0; opacity: 0.9; }
            .content { padding: 30px 20px; }
            .info-box { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #FF7F00; 
            }
            .info-box h3 { 
              margin: 0 0 15px 0; 
              color: #FF7F00; 
              font-size: 18px;
            }
            .info-box p { margin: 5px 0; }
            .payment-info { 
              background: linear-gradient(135deg, #e3f2fd, #bbdefb); 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border: 1px solid #2196f3;
            }
            .payment-info h3 { color: #1976d2; margin: 0 0 15px 0; }
            .action-box {
              background: linear-gradient(135deg, #fff3e0, #ffe0b2);
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #ff9800;
            }
            .action-box h3 { color: #f57c00; margin: 0 0 15px 0; }
            .action-box ol { margin: 10px 0; padding-left: 20px; }
            .action-box li { margin: 8px 0; }
            .footer { 
              text-align: center; 
              padding: 20px; 
              background: #f8f9fa; 
              color: #666; 
              font-size: 14px; 
              border-top: 1px solid #e9ecef;
            }
            .highlight { 
              background: #fff3cd; 
              padding: 2px 6px; 
              border-radius: 4px; 
              font-weight: bold; 
            }
            .urgent { 
              background: #f8d7da; 
              color: #721c24; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border: 1px solid #f5c6cb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛍️ DaloaMarket</h1>
              <p>Nouvelle demande d'achat de crédits</p>
            </div>
            
            <div class="content">
              <div class="urgent">
                <strong>⚡ ACTION REQUISE :</strong> Nouvelle demande de crédits à traiter
              </div>

              <div class="info-box">
                <h3>📦 Informations du pack</h3>
                <p><strong>Pack sélectionné :</strong> <span class="highlight">${packInfo.name}</span></p>
                <p><strong>Nombre de crédits :</strong> <span class="highlight">${packInfo.credits}</span></p>
                <p><strong>Prix :</strong> <span class="highlight">${packInfo.price} FCFA</span></p>
              </div>

              <div class="info-box">
                <h3>👤 Informations client</h3>
                <p><strong>Nom complet :</strong> ${fullName}</p>
                <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Numéro débité :</strong> <a href="tel:${phoneNumber}">${phoneNumber}</a></p>
              </div>

              <div class="payment-info">
                <h3>💳 Détails du paiement</h3>
                <p><strong>Montant à vérifier :</strong> <span class="highlight">${packInfo.price} FCFA</span></p>
                <p><strong>Numéro débité :</strong> ${phoneNumber}</p>
                <p><strong>Date de demande :</strong> ${new Date().toLocaleString('fr-FR', { 
                  timeZone: 'Africa/Abidjan',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p><strong>Capture d'écran :</strong> Voir pièce jointe</p>
              </div>

              <div class="action-box">
                <h3>📋 Actions à effectuer</h3>
                <ol>
                  <li><strong>Vérifier la capture d'écran</strong> de transaction en pièce jointe</li>
                  <li><strong>Confirmer le paiement</strong> sur Orange Money/MTN Mobile Money</li>
                  <li><strong>Ajouter ${packInfo.credits} crédits</strong> au compte de ${email}</li>
                  <li><strong>Envoyer un email de confirmation</strong> au client</li>
                </ol>
              </div>

              <div class="info-box">
                <h3>🔗 Liens utiles</h3>
                <p><strong>Dashboard Supabase :</strong> <a href="https://supabase.com/dashboard">Gérer les crédits</a></p>
                <p><strong>Email client :</strong> <a href="mailto:${email}?subject=Confirmation crédits DaloaMarket">Répondre au client</a></p>
              </div>
            </div>

            <div class="footer">
              <p><strong>DaloaMarket</strong> - Marketplace P2P de Daloa</p>
              <p>Email automatique généré le ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}</p>
              <p>🤖 Système automatisé - Ne pas répondre à cet email</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Préparer la pièce jointe (capture d'écran)
    const attachments = [];
    if (screenshotBase64) {
      try {
        // Extraire le type MIME et les données base64
        const matches = screenshotBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          
          attachments.push({
            filename: screenshotFilename || `transaction_${packInfo.name}_${Date.now()}.jpg`,
            content: base64Data,
            type: mimeType,
            disposition: 'attachment'
          });
          
          console.log('Pièce jointe préparée:', { filename: screenshotFilename, mimeType });
        } else {
          console.warn('Format base64 invalide pour la capture d\'écran');
        }
      } catch (attachmentError) {
        console.error('Erreur préparation pièce jointe:', attachmentError);
      }
    }

    // Envoyer l'email à l'équipe via Resend
    const emailData = {
      from: 'DaloaMarket <noreply@resend.dev>',
      to: ['daloamarket@gmail.com'],
      subject: emailSubject,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined
    };

    console.log('Envoi email à l\'équipe via Resend...');
    const result = await resend.emails.send(emailData);
    
    console.log('Email équipe envoyé avec succès:', result);

    // Email de confirmation au client
    const confirmationEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #4caf50, #66bb6a); 
              color: white; 
              padding: 30px 20px; 
              text-align: center;
            }
            .header h1 { margin: 0 0 10px 0; font-size: 24px; }
            .header p { margin: 0; opacity: 0.9; }
            .content { padding: 30px 20px; }
            .success-box { 
              background: linear-gradient(135deg, #e8f5e8, #c8e6c9); 
              border: 2px solid #4caf50; 
              color: #2e7d32; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              text-align: center;
            }
            .success-box h3 { margin: 0 0 10px 0; color: #1b5e20; }
            .info-box { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #FF7F00; 
            }
            .info-box h3 { 
              margin: 0 0 15px 0; 
              color: #FF7F00; 
              font-size: 18px;
            }
            .info-box p { margin: 5px 0; }
            .info-box ol { margin: 10px 0; padding-left: 20px; }
            .info-box li { margin: 8px 0; }
            .contact-box {
              background: linear-gradient(135deg, #e3f2fd, #bbdefb);
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #2196f3;
            }
            .contact-box h3 { color: #1976d2; margin: 0 0 15px 0; }
            .footer { 
              text-align: center; 
              padding: 20px; 
              background: #f8f9fa; 
              color: #666; 
              font-size: 14px; 
              border-top: 1px solid #e9ecef;
            }
            .highlight { 
              background: #fff3cd; 
              padding: 2px 6px; 
              border-radius: 4px; 
              font-weight: bold; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Demande reçue !</h1>
              <p>Merci pour votre confiance</p>
            </div>
            
            <div class="content">
              <div class="success-box">
                <h3>🎉 Votre demande a été envoyée avec succès !</h3>
                <p>Nous avons bien reçu votre demande d'achat du pack <strong>${packInfo.name}</strong>.</p>
              </div>

              <div class="info-box">
                <h3>📋 Récapitulatif de votre commande</h3>
                <p><strong>Pack :</strong> <span class="highlight">${packInfo.name}</span></p>
                <p><strong>Crédits :</strong> <span class="highlight">${packInfo.credits}</span></p>
                <p><strong>Prix :</strong> <span class="highlight">${packInfo.price} FCFA</span></p>
                <p><strong>Numéro débité :</strong> ${phoneNumber}</p>
                <p><strong>Date de demande :</strong> ${new Date().toLocaleString('fr-FR', { 
                  timeZone: 'Africa/Abidjan',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>

              <div class="info-box">
                <h3>⏰ Prochaines étapes</h3>
                <ol>
                  <li><strong>Vérification :</strong> Notre équipe va vérifier votre paiement dans les <strong>24h</strong></li>
                  <li><strong>Validation :</strong> Une fois confirmé, vos crédits seront ajoutés automatiquement</li>
                  <li><strong>Confirmation :</strong> Vous recevrez un email de confirmation</li>
                  <li><strong>Publication :</strong> Vous pourrez alors publier vos annonces !</li>
                </ol>
              </div>

              <div class="contact-box">
                <h3>📞 Besoin d'aide ?</h3>
                <p>Notre équipe est là pour vous aider :</p>
                <p><strong>📧 Email :</strong> <a href="mailto:daloamarket@gmail.com">daloamarket@gmail.com</a></p>
                <p><strong>📱 WhatsApp :</strong> <a href="https://wa.me/2250788000831">+225 07 88 00 08 31</a></p>
                <p><strong>📞 Téléphone :</strong> <a href="tel:+2250788000831">+225 07 88 00 08 31</a></p>
              </div>

              <div class="info-box">
                <h3>💡 Conseils</h3>
                <p>• Gardez une copie de votre capture d'écran de transaction</p>
                <p>• Vérifiez votre boîte email (y compris les spams) pour notre confirmation</p>
                <p>• Une fois vos crédits ajoutés, vous pourrez publier ${packInfo.credits} annonces</p>
              </div>
            </div>

            <div class="footer">
              <p><strong>Merci de faire confiance à DaloaMarket !</strong></p>
              <p>L'équipe DaloaMarket - Daloa, Côte d'Ivoire 🇨🇮</p>
              <p>Marketplace P2P locale - Achetez et vendez facilement</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Envoyer l'email de confirmation au client
    console.log('Envoi email de confirmation au client...');
    const confirmationResult = await resend.emails.send({
      from: 'DaloaMarket <noreply@resend.dev>',
      to: [email],
      subject: `✅ Demande reçue - Pack ${packInfo.name} (${packInfo.credits} crédits)`,
      html: confirmationEmailHtml
    });

    console.log('Email confirmation client envoyé:', confirmationResult);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        message: 'Demande envoyée avec succès',
        teamEmailId: result.id,
        clientEmailId: confirmationResult.id,
        pack: packInfo
      })
    };

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    
    // Log détaillé de l'erreur pour le debugging
    if (error.response) {
      console.error('Réponse d\'erreur Resend:', error.response.data);
    }
    
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Erreur lors de l\'envoi de la demande',
        details: error.message,
        type: error.name || 'UnknownError'
      })
    };
  }
};