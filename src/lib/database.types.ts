export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string
          full_name: string
          district: string
          created_at: string
          rating: number | null
          first_listing_at: string | null // Ajout du champ pour la première annonce
        }
        Insert: {
          id: string
          email: string
          phone: string
          full_name: string
          district: string
          created_at?: string
          rating?: number | null
          first_listing_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          phone?: string
          full_name?: string
          district?: string
          created_at?: string
          rating?: number | null
          first_listing_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      listings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          price: number
          category: string
          condition: string
          district: string
          photos: string[]
          boosted_until: string | null
          created_at: string
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          price: number
          category: string
          condition: string
          district: string
          photos: string[]
          boosted_until?: string | null
          created_at?: string
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          price?: number
          category?: string
          condition?: string
          district?: string
          photos?: string[]
          boosted_until?: string | null
          created_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          listing_id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
          read: boolean
        }
        Insert: {
          id?: string
          listing_id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at?: string
          read?: boolean
        }
        Update: {
          id?: string
          listing_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          created_at?: string
          read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          listing_id: string | null
          amount: number
          type: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id?: string | null
          amount: number
          type: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string | null
          amount?: number
          type?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_listing_id_fkey"
            columns: ["listing_id"]
            referencedRelation: "listings"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewed_id: string
          listing_id: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          reviewed_id: string
          listing_id: string
          rating: number
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          reviewed_id?: string
          listing_id?: string
          rating?: number
          comment?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            referencedRelation: "listings"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Ajout du modèle TypeScript pour un avis utilisateur
export interface Review {
  id: string;
  reviewed_id: string;
  reviewer_id: string;
  listing_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}