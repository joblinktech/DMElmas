import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSupabase } from '../../hooks/useSupabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../lib/utils';
import { Database } from '../../lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];

interface Conversation {
  listing_id: string;
  listing_title: string;
  listing_photo: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_date: string;
  unread_count: number;
}

const MessagesPage: React.FC = () => {
  const { user } = useSupabase();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      try {
        // Get all messages where the user is either sender or receiver
        const { data: messages, error } = await supabase
          .from('messages')
          .select(`
            *,
            listing:listings!messages_listing_id_fkey (
              id,
              title,
              photos,
              user_id
            ),
            sender:users!messages_sender_id_fkey (
              full_name
            ),
            receiver:users!messages_receiver_id_fkey (
              full_name
            )
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Group messages by conversation (listing_id + other_user_id)
        const conversationMap = new Map<string, Conversation>();
        
        messages?.forEach((message: any) => {
          const isUserSender = message.sender_id === user.id;
          const otherUserId = isUserSender ? message.receiver_id : message.sender_id;
          const otherUserName = isUserSender 
            ? message.receiver.full_name 
            : message.sender.full_name;
          
          const conversationKey = `${message.listing_id}_${otherUserId}`;
          
          if (!conversationMap.has(conversationKey)) {
            conversationMap.set(conversationKey, {
              listing_id: message.listing_id,
              listing_title: message.listing.title,
              listing_photo: message.listing.photos[0] || '',
              other_user_id: otherUserId,
              other_user_name: otherUserName,
              last_message: message.content,
              last_message_date: message.created_at,
              unread_count: !isUserSender && !message.read ? 1 : 0
            });
          } else if (!isUserSender && !message.read) {
            // Count unread messages
            const conversation = conversationMap.get(conversationKey)!;
            conversation.unread_count += 1;
          }
        });
        
        // Convert map to array and sort by last message date
        const conversationList = Array.from(conversationMap.values())
          .sort((a, b) => new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime());
        
        setConversations(conversationList);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Erreur lors du chargement des conversations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
    
    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `sender_id=eq.${user.id},receiver_id=eq.${user.id}`
      }, () => {
        fetchConversations();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-grey-50 py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        {conversations.length > 0 ? (
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="divide-y divide-grey-200">
              {conversations.map((conversation) => (
                <Link
                  key={`${conversation.listing_id}_${conversation.other_user_id}`}
                  to={`/messages/${conversation.listing_id}/${conversation.other_user_id}`}
                  className="block p-4 hover:bg-grey-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={conversation.listing_photo || 'https://via.placeholder.com/64'} 
                        alt={conversation.listing_title} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-grey-900 line-clamp-1">
                          {conversation.listing_title}
                        </h3>
                        <span className="text-xs text-grey-500">
                          {formatDate(conversation.last_message_date)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-grey-600 mt-1">
                        {conversation.other_user_name}
                      </p>
                      
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-grey-500 line-clamp-1">
                          {conversation.last_message}
                        </p>
                        
                        {conversation.unread_count > 0 && (
                          <span className="bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-card shadow-card p-8 text-center">
            <MessageSquare className="h-16 w-16 text-grey-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun message</h3>
            <p className="text-grey-600 mb-6">
              Vous n'avez pas encore de conversations. Parcourez les annonces et contactez les vendeurs pour commencer à discuter.
            </p>
            <Link to="/search" className="btn-primary">
              Parcourir les annonces
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;