export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          current_job_title: string | null
          why_quit: string | null
          risk_tolerance: "conservative" | "moderate" | "aggressive" | null
          compact_mode: boolean
          email_reminders: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          current_job_title?: string | null
          why_quit?: string | null
          risk_tolerance?: "conservative" | "moderate" | "aggressive" | null
          compact_mode?: boolean
          email_reminders?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          current_job_title?: string | null
          why_quit?: string | null
          risk_tolerance?: "conservative" | "moderate" | "aggressive" | null
          compact_mode?: boolean
          email_reminders?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      financial_goals: {
        Row: {
          id: string
          user_id: string
          monthly_expenses: number
          current_savings: number
          monthly_savings_rate: number
          monthly_income: number
          target_runway_months: number
          target_quit_date: string | null
          desired_post_quit_income: number
          emergency_fund_months: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          monthly_expenses?: number
          current_savings?: number
          monthly_savings_rate?: number
          monthly_income?: number
          target_runway_months?: number
          target_quit_date?: string | null
          desired_post_quit_income?: number
          emergency_fund_months?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          monthly_expenses?: number
          current_savings?: number
          monthly_savings_rate?: number
          monthly_income?: number
          target_runway_months?: number
          target_quit_date?: string | null
          desired_post_quit_income?: number
          emergency_fund_months?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      milestones: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: "pending" | "in_progress" | "completed"
          category: "financial" | "career" | "personal"
          order_index: number
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: "pending" | "in_progress" | "completed"
          category?: "financial" | "career" | "personal"
          order_index?: number
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: "pending" | "in_progress" | "completed"
          category?: "financial" | "career" | "personal"
          order_index?: number
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      expense_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          budget_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          budget_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          budget_limit?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          name: string
          amount: number
          expense_date: string
          is_recurring: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          name: string
          amount?: number
          expense_date?: string
          is_recurring?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          name?: string
          amount?: number
          expense_date?: string
          is_recurring?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          frequency: "monthly" | "yearly"
          next_due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount?: number
          frequency?: "monthly" | "yearly"
          next_due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          frequency?: "monthly" | "yearly"
          next_due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      loans: {
        Row: {
          id: string
          user_id: string
          name: string
          total_amount: number
          remaining_amount: number
          monthly_payment: number
          interest_rate: number
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          total_amount?: number
          remaining_amount?: number
          monthly_payment?: number
          interest_rate?: number
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          total_amount?: number
          remaining_amount?: number
          monthly_payment?: number
          interest_rate?: number
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
