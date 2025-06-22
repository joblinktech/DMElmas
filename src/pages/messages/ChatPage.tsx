import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Send, 
  ArrowLeft, 
  AlertCircle,
  User,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSupabase } from '../../hooks/useSupabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../lib/utils';
import { Database } from '../../lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: { full_name: string };
  receiver?: { full_name: string };
};

interface ListingInfo {
  id: string;
  title: string;
  photo: string;
  price: number;
  seller_id: string;
}

interface UserInfo {
  id: string;
  full_name: string;
}

const ChatPage: React.FC = () => {
  const { listingId: rawListingId, userId: rawUserId } = useParams<{ listingId: string; userId: string }>();
  const { user } = useSupabase();
  const navigate = useNavigate();

  // Sécurisation des paramètres (toujours string)
  const listingId = rawListingId || '';
  const userId = rawUserId || '';

  // Ajout : gestion des paramètres manquants ou invalides
  useEffect(() => {
    if (!listingId || !userId) {
      toast.error('Paramètres de conversation invalides.');
      navigate('/messages');
    }
    if (user && user.id === userId) {
      toast.error('Vous ne pouvez pas discuter avec vous-même.');
      navigate('/messages');
    }
  }, [listingId, userId, user, navigate]);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [listing, setListing] = useState<ListingInfo | null>(null);
  const [otherUser, setOtherUser] = useState<UserInfo | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Déplacer la déclaration de fetchMessages AVANT les useEffect pour qu'elle soit visible
  const fetchMessages = async () => {
    if (!user || !listingId || !userId) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey (
            full_name
          ),
          receiver:users!messages_receiver_id_fkey (
            full_name
          )
        `)
        .eq('listing_id', listingId as string)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  // Déplacer fetchListingAndUser hors du useEffect
  const fetchListingAndUser = async () => {
    try {
      // Fetch listing info
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('id, title, photos, price, user_id')
        .eq('id', listingId)
        .single();
      
      if (listingError) throw listingError;
      
      setListing({
        id: listingData.id,
        title: listingData.title,
        photo: listingData.photos[0] || '',
        price: listingData.price,
        seller_id: listingData.user_id
      });
      
      // Fetch other user info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      
      setOtherUser({
        id: userData.id,
        full_name: userData.full_name
      });
      
      // Fetch messages
      await fetchMessages();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement de la conversation');
      navigate('/messages');
    } finally {
      setLoading(false);
    }
  };
  
  // useEffect pour la souscription temps réel et le chargement initial
  useEffect(() => {
    if (!user || !listingId || !userId) return;
    // Définir la fonction asynchrone à l'intérieur
    const fetchAll = async () => {
      try {
        // On appelle fetchListingAndUser qui appelle fetchMessages
        await fetchListingAndUser();
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement de la conversation');
        navigate('/messages');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    
    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('chat-messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `listing_id=eq.${listingId}`
      }, () => {
        fetchMessages();
      })
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
    // fetchListingAndUser et fetchMessages ne changent jamais, donc on ne les met pas dans les dépendances
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, listingId, userId, navigate]);
  
  // Scroll automatique intelligent : seulement si l'utilisateur est déjà en bas
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // Marquer les messages comme lus
    if (messages.length > 0 && user) {
      const markAsRead = async () => {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('listing_id', listingId)
          .eq('receiver_id', user.id)
          .eq('read', false);
      };
      markAsRead();
    }
  }, [messages, listingId, user]);
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !listingId || !userId) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          listing_id: listingId,
          sender_id: user.id,
          receiver_id: userId,
          content: newMessage.trim(),
          read: false
        });
      if (error) throw error;
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Sécurisation : on ne rend le chat que si listing ET otherUser sont bien présents
  if (!listing || !otherUser) {
    return (
      <div className="min-h-screen bg-grey-50 py-8">
        <div className="container-custom max-w-4xl">
          <div className="bg-white rounded-card shadow-card p-8 text-center">
            <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Conversation introuvable</h1>
            <p className="text-grey-600 mb-6">
              Cette conversation n'existe pas, a été supprimée, ou les paramètres sont invalides.
            </p>
            <Link to="/messages" className="btn-primary">
              Retour aux messages
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-grey-50 py-8">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-grey-200 flex items-center">
            <Link to="/messages" className="mr-3 text-grey-500 hover:text-grey-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            
            <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src={listing.photo || 'https://via.placeholder.com/48'} 
                alt={listing.title} 
                className="h-full w-full object-cover"
              />
            </div>
            
            <div className="ml-3 flex-grow">
              <Link to={`/listings/${listing.id}`} className="font-medium text-grey-900 hover:underline line-clamp-1">
                {listing.title}
              </Link>
              <p className="text-sm text-grey-600">
                {otherUser.full_name}
              </p>
            </div>
          </div>
          
          {/* Messages */}
          <div className="p-4 h-[60vh] overflow-y-auto bg-grey-50">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isUserMessage = message.sender_id === user?.id;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUserMessage && (
                        <div className="h-8 w-8 rounded-full bg-grey-200 flex items-center justify-center mr-2 flex-shrink-0">
                          <User className="h-4 w-4 text-grey-500" />
                        </div>
                      )}
                      
                      <div 
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isUserMessage 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-white border border-grey-200 rounded-tl-none'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p 
                          className={`text-xs mt-1 ${
                            isUserMessage ? 'text-primary-100' : 'text-grey-500'
                          }`}
                        >
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="bg-grey-100 rounded-full p-4 mb-4">
                  <MessageSquare className="h-8 w-8 text-grey-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Commencez la conversation</h3>
                <p className="text-grey-600 max-w-md">
                  Envoyez un message à {otherUser.full_name} à propos de "{listing.title}"
                </p>
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t border-grey-200">
            <form onSubmit={sendMessage} className="flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="input-field flex-grow"
                disabled={sending}
              />
              <button
                type="submit"
                className="btn-primary ml-2 flex items-center justify-center"
                disabled={!newMessage.trim() || sending}
              >
                {sending ? (
                  <LoadingSpinner size="small" className="text-white" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;