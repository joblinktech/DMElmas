// Netlify Function : Création d'une facture PayDunya (Production)
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
);

// Configuration PayDunya Production
const PAYDUNYA_CONFIG = {
  MASTER_KEY: process.env.PAYDUNYA_MASTER_KEY,
  PRIVATE_KEY: process.env.PAYDUNYA_PRIVATE_KEY,
  PUBLIC_KEY: process.env.PAYDUNYA_PUBLIC_KEY,
  TOKEN: process.env.PAYDUNYA_TOKEN,
  MODE: process.env.PAYDUNYA_MODE || 'live',
  BASE_URL: 'https://app.paydunya.com/api/v1'
};

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
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Format JSON invalide' })
      };
    }

    const { userId, type, annonceId, boostOption, credits, packName } = requestData;

    console.log('Requête reçue:', { userId, type, annonceId, boostOption, credits, packName });

    if (!userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'userId requis' })
      };
    }

    if (!type || !['annonce', 'boost', 'pack'].includes(type)) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Type de paiement invalide' })
      };
    }

    // Vérifier la configuration PayDunya
    if (!PAYDUNYA_CONFIG.MASTER_KEY || !PAYDUNYA_CONFIG.PRIVATE_KEY || !PAYDUNYA_CONFIG.TOKEN) {
      console.error('Configuration PayDunya manquante:', {
        hasMasterKey: !!PAYDUNYA_CONFIG.MASTER_KEY,
        hasPrivateKey: !!PAYDUNYA_CONFIG.PRIVATE_KEY,
        hasToken: !!PAYDUNYA_CONFIG.TOKEN
      });
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Configuration PayDunya manquante' })
      };
    }

    // Récupérer les informations utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Erreur utilisateur:', userError);
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Utilisateur non trouvé' })
      };
    }

    // Calculer le montant et la description selon le type
    let amount = 200;
    let description = "Publication d'annonce sur DaloaMarket";
    let itemName = "Publication d'annonce";

    if (type === 'boost') {
      const boostPrices = {
        '24h': 300,
        '7d': 800,
        '30d': 2500
      };
      amount = boostPrices[boostOption] || 500;
      description = `Boost d'annonce (${boostOption}) sur DaloaMarket`;
      itemName = `Boost d'annonce (${boostOption})`;
    } else if (type === 'pack') {
      const packPrices = {
        3: 500,
        10: 1500,
        30: 3500
      };
      amount = packPrices[credits] || credits * 200;
      description = `Achat de pack de crédits (${packName || credits + ' crédits'}) sur DaloaMarket`;
      itemName = `Pack de crédits (${packName || credits + ' crédits'})`;
    }

    // Préparer les données pour PayDunya selon la documentation
    const invoiceData = {
      invoice: {
        total_amount: amount,
        description: description
      },
      store: {
        name: 'DaloaMarket'
      },
      customer: {
        name: user.full_name || 'Utilisateur DaloaMarket',
        email: user.email,
        phone: user.phone || ''
      },
      items: {
        item_0: {
          name: itemName,
          quantity: 1,
          unit_price: amount.toString(),
          total_price: amount.toString(),
          description: description
        }
      },
      actions: {
        return_url: `https://daloa-market.netlify.app/payment/success?type=${type}&user_id=${userId}${annonceId ? `&listing_id=${annonceId}` : ''}`,
        cancel_url: `https://daloa-market.netlify.app/payment/failure?type=${type}`,
        callback_url: `https://daloa-market.netlify.app/.netlify/functions/paydunya-callback`
      },
      custom_data: {
        user_id: userId,
        type: type,
        listing_id: annonceId || null,
        boost_option: boostOption || null,
        credits: credits || null,
        pack_name: packName || null,
        app_name: 'DaloaMarket'
      }
    };

    console.log('Création facture PayDunya:', {
      amount,
      type,
      userId,
      mode: PAYDUNYA_CONFIG.MODE,
      url: `${PAYDUNYA_CONFIG.BASE_URL}/checkout-invoice/create`
    });

    // Appel à l'API PayDunya avec timeout et gestion d'erreur améliorée
    let response;
    try {
      response = await axios.post(
        `${PAYDUNYA_CONFIG.BASE_URL}/checkout-invoice/create`,
        invoiceData,
        {
          headers: {
            'Content-Type': 'application/json',
            'PAYDUNYA-MASTER-KEY': PAYDUNYA_CONFIG.MASTER_KEY,
            'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_CONFIG.PRIVATE_KEY,
            'PAYDUNYA-TOKEN': PAYDUNYA_CONFIG.TOKEN,
            'PAYDUNYA-MODE': PAYDUNYA_CONFIG.MODE
          },
          timeout: 30000 // 30 secondes de timeout
        }
      );
    } catch (axiosError) {
      console.error('Erreur appel PayDunya:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });
      
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Erreur de communication avec PayDunya',
          details: axiosError.response?.data || axiosError.message
        })
      };
    }

    console.log('Réponse PayDunya:', {
      response_code: response.data.response_code,
      response_text: response.data.response_text,
      token: response.data.token
    });

    if (response.data.response_code !== '00') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: response.data.response_text || 'Erreur lors de la création de la facture PayDunya',
          code: response.data.response_code
        })
      };
    }

    // Enregistrer la transaction en base
    try {
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          listing_id: annonceId || null,
          amount: amount,
          type: type,
          status: 'pending',
          paydunya_token: response.data.token
        });

      if (transactionError) {
        console.error('Erreur enregistrement transaction:', transactionError);
        // Ne pas faire échouer la requête pour autant
      }
    } catch (dbError) {
      console.error('Erreur base de données:', dbError);
      // Ne pas faire échouer la requête pour autant
    }

    // Retourner la réponse de succès
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        checkout_url: response.data.response_text,
        token: response.data.token,
        amount: amount,
        description: description
      })
    };

  } catch (error) {
    console.error('Erreur générale:', error);
    
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Erreur interne du serveur',
        message: error.message
      })
    };
  }
};