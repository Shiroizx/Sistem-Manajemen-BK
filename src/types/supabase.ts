/**
 * Supabase Database Types
 * 
 * This file will be auto-generated using the Supabase CLI:
 * npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
 * 
 * Or using the Supabase MCP tools if available.
 * 
 * For now, this is a placeholder. You'll need to generate the actual types
 * from your Supabase project after running the migration.
 */

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
      profiles: {
        Row: {
          id: string
          full_name: string
          nis: string | null
          role: 'admin' | 'student'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          nis?: string | null
          role?: 'admin' | 'student'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          nis?: string | null
          role?: 'admin' | 'student'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      point_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          point_value: number
          type: 'violation' | 'achievement'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          point_value: number
          type: 'violation' | 'achievement'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          point_value?: number
          type?: 'violation' | 'achievement'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_records: {
        Row: {
          id: string
          student_id: string
          category_id: string
          notes: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          student_id: string
          category_id: string
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          category_id?: string
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_records_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_records_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "point_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_records_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      student_scores: {
        Row: {
          student_id: string
          full_name: string
          nis: string | null
          total_score: number
          total_records: number
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'student'
      point_type: 'violation' | 'achievement'
    }
  }
}

