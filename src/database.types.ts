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
      retailers: {
        Row: {
          id: string
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          id: string
          name: string
          role: string
          retailer_id: string
          email: string
          interested_in_evhc: boolean
          created_at: string
          current_process?: string | null
          process_effectiveness?: number | null
          challenges?: string | null
          missed_opportunities?: string | null
          automation_interest?: string | null
          automation_interest_comments?: string | null
          valuable_features?: string | null
          expected_benefits?: string | null
          investment_willingness?: string | null
          concerns?: string | null
          additional_feedback?: string | null
        }
        Insert: {
          id?: string
          name: string
          role: string
          retailer_id: string
          email: string
          interested_in_evhc: boolean
          created_at?: string
          current_process?: string | null
          process_effectiveness?: number | null
          challenges?: string | null
          missed_opportunities?: string | null
          automation_interest?: string | null
          automation_interest_comments?: string | null
          valuable_features?: string | null
          expected_benefits?: string | null
          investment_willingness?: string | null
          concerns?: string | null
          additional_feedback?: string | null
        }
        Update: {
          id?: string
          name?: string
          role?: string
          retailer_id?: string
          email?: string
          interested_in_evhc?: boolean
          created_at?: string
          current_process?: string | null
          process_effectiveness?: number | null
          challenges?: string | null
          missed_opportunities?: string | null
          automation_interest?: string | null
          automation_interest_comments?: string | null
          valuable_features?: string | null
          expected_benefits?: string | null
          investment_willingness?: string | null
          concerns?: string | null
          additional_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_retailer_id_fkey"
            columns: ["retailer_id"]
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}