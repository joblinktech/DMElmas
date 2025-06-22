// Netlify Function : Callback PayDunya pour traitement des paiements
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
);

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
    console.log('Callback PayDunya reçu - Headers:', event.headers);
    console.log('Callback PayDunya reçu - Body:', event.body);

    // PayDunya envoie les données en application/x-www-form-urlencoded
    let data;
    
    try {
      // Essayer de parser comme JSON d'abord
      data = JSON.parse(event.body);
    } catch {
      // Si ce n'est pas du JSON, parser comme form data
      const params = new URLSearchParams(event.body);
      const dataParam = params.get('data');
      if (dataParam) {
        data = JSON.parse(dataParam);
      } else {
        // Essayer de récupérer directement les paramètres
        const allParams = {};
        for (const [key, value] of params.entries()) {
          allParams[key] = value;
        }
        data = allParams;
      }
    }

    console.log('Données callback parsées:', JSON.stringify(data, null, 2));

    if (!data) {
      throw new Error('Aucune donnée reçue dans le callback');
    }

    // Adapter selon le format des données reçues de PayDunya
    let invoice, customData;
    
    if (data.invoice) {
      invoice = data.invoice;
      customData = invoice.custom_data || {};
    } else if (data.status) {
      // Format direct
      invoice = data;
      customData = data.custom_data || {};
    } else {
      throw new Error('Format de données callback invalide');
    }

    const paymentStatus = invoice.status;
    const token = invoice.token;

    console.log('Traitement callback:', {
      status: paymentStatus,
      token: token,
      customData: customData
    });

    // Vérifier le statut du paiement
    if (paymentStatus === 'completed') {
      // Mettre à jour la transaction
      const { error: updateTransactionError } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed'
        })
        .eq('paydunya_token', token);

      if (updateTransactionError) {
        console.error('Erreur mise à jour transaction:', updateTransactionError);
      }

      // Traitement selon le type de paiement
      const paymentType = customData.type;
      const userId = customData.user_id;

      console.log('Traitement paiement:', { paymentType, userId });

      if (paymentType === 'annonce' && customData.listing_id) {
        // Publier l'annonce
        const { error: publishError } = await supabase
          .from('listings')
          .update({ status: 'active' })
          .eq('id', customData.listing_id)
          .eq('user_id', userId);

        if (publishError) {
          console.error('Erreur publication annonce:', publishError);
        } else {
          console.log('Annonce publiée avec succès:', customData.listing_id);
        }

      } else if (paymentType === 'boost' && customData.listing_id) {
        // Appliquer le boost
        const boostDuration = customData.boost_option;
        let boostedUntil = new Date();
        
        if (boostDuration === '24h') {
          boostedUntil.setDate(boostedUntil.getDate() + 1);
        } else if (boostDuration === '7d') {
          boostedUntil.setDate(boostedUntil.getDate() + 7);
        } else if (boostDuration === '30d') {
          boostedUntil.setDate(boostedUntil.getDate() + 30);
        }

        const { error: boostError } = await supabase
          .from('listings')
          .update({ 
            boosted_until: boostedUntil.toISOString(),
            status: 'active'
          })
          .eq('id', customData.listing_id)
          .eq('user_id', userId);

        if (boostError) {
          console.error('Erreur application boost:', boostError);
        } else {
          console.log('Boost appliqué avec succès:', customData.listing_id);
        }

      } else if (paymentType === 'pack' && customData.credits) {
        // Ajouter les crédits
        const creditsToAdd = parseInt(customData.credits);
        
        // Utiliser la fonction RPC pour ajouter les crédits
        const { error: creditsError } = await supabase.rpc(
          'add_user_credits',
          { 
            target_user_id: userId, 
            credit_amount: creditsToAdd,
            reason: `Achat pack ${customData.pack_name || creditsToAdd + ' crédits'}`
          }
        );

        if (creditsError) {
          console.error('Erreur ajout crédits:', creditsError);
        } else {
          console.log('Crédits ajoutés avec succès:', { userId, credits: creditsToAdd });
        }
      }

      console.log(`Paiement ${paymentType} traité avec succès pour l'utilisateur ${userId}`);

    } else if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
      // Mettre à jour la transaction comme échouée
      const { error: updateTransactionError } = await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('paydunya_token', token);

      if (updateTransactionError) {
        console.error('Erreur mise à jour transaction échouée:', updateTransactionError);
      }

      console.log(`Paiement échoué/annulé pour le token ${token}`);
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
        success: true, 
        message: 'Callback traité avec succès',
        status: paymentStatus 
      })
    };

  } catch (error) {
    console.error('Erreur callback PayDunya:', error);
    
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: error.message || 'Erreur lors du traitement du callback'
      })
    };
  }
};