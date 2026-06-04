export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      child_behavior_profiles: {
        Row: {
          ai_insights: Json | null
          attention_span_minutes: number | null
          average_accuracy: number | null
          average_response_time_seconds: number | null
          best_time_of_day: string | null
          challenging_categories: Json | null
          child_id: string
          color_sensitivity: string | null
          created_at: string
          current_difficulty_level: number | null
          frustration_threshold: number | null
          id: string
          last_ai_analysis: string | null
          preferred_pace: string | null
          prefers_animations: boolean | null
          prefers_sounds: boolean | null
          recommended_games: Json | null
          strong_categories: Json | null
          updated_at: string
        }
        Insert: {
          ai_insights?: Json | null
          attention_span_minutes?: number | null
          average_accuracy?: number | null
          average_response_time_seconds?: number | null
          best_time_of_day?: string | null
          challenging_categories?: Json | null
          child_id: string
          color_sensitivity?: string | null
          created_at?: string
          current_difficulty_level?: number | null
          frustration_threshold?: number | null
          id?: string
          last_ai_analysis?: string | null
          preferred_pace?: string | null
          prefers_animations?: boolean | null
          prefers_sounds?: boolean | null
          recommended_games?: Json | null
          strong_categories?: Json | null
          updated_at?: string
        }
        Update: {
          ai_insights?: Json | null
          attention_span_minutes?: number | null
          average_accuracy?: number | null
          average_response_time_seconds?: number | null
          best_time_of_day?: string | null
          challenging_categories?: Json | null
          child_id?: string
          color_sensitivity?: string | null
          created_at?: string
          current_difficulty_level?: number | null
          frustration_threshold?: number | null
          id?: string
          last_ai_analysis?: string | null
          preferred_pace?: string | null
          prefers_animations?: boolean | null
          prefers_sounds?: boolean | null
          recommended_games?: Json | null
          strong_categories?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_behavior_profiles_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          age: number | null
          avatar: string | null
          created_at: string
          id: string
          name: string
          parent_id: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          avatar?: string | null
          created_at?: string
          id?: string
          name: string
          parent_id: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          avatar?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          child_id: string
          correct_answers: number
          created_at: string
          duration_seconds: number | null
          game_type: string
          id: string
          max_streak: number
          mistakes: Json | null
          score: number
          total_questions: number
          wrong_answers: number
        }
        Insert: {
          child_id: string
          correct_answers?: number
          created_at?: string
          duration_seconds?: number | null
          game_type: string
          id?: string
          max_streak?: number
          mistakes?: Json | null
          score?: number
          total_questions?: number
          wrong_answers?: number
        }
        Update: {
          child_id?: string
          correct_answers?: number
          created_at?: string
          duration_seconds?: number | null
          game_type?: string
          id?: string
          max_streak?: number
          mistakes?: Json | null
          score?: number
          total_questions?: number
          wrong_answers?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parental_settings: {
        Row: {
          animations_enabled: boolean | null
          created_at: string
          id: string
          parent_id: string
          session_duration_minutes: number | null
          sound_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          animations_enabled?: boolean | null
          created_at?: string
          id?: string
          parent_id: string
          session_duration_minutes?: number | null
          sound_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          animations_enabled?: boolean | null
          created_at?: string
          id?: string
          parent_id?: string
          session_duration_minutes?: number | null
          sound_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      remote_control_settings: {
        Row: {
          age_filter: number | null
          auto_adjust_difficulty: boolean | null
          break_interval_minutes: number | null
          break_reminders: boolean | null
          child_id: string
          content_filter_level: string | null
          created_at: string
          daily_time_limit: number | null
          difficulty_level: number | null
          enabled_categories: Json | null
          focus_mode: boolean | null
          id: string
          learning_goals: Json | null
          max_games_per_session: number | null
          milestone_notifications: Json | null
          parent_id: string
          schedule: Json | null
          updated_at: string
        }
        Insert: {
          age_filter?: number | null
          auto_adjust_difficulty?: boolean | null
          break_interval_minutes?: number | null
          break_reminders?: boolean | null
          child_id: string
          content_filter_level?: string | null
          created_at?: string
          daily_time_limit?: number | null
          difficulty_level?: number | null
          enabled_categories?: Json | null
          focus_mode?: boolean | null
          id?: string
          learning_goals?: Json | null
          max_games_per_session?: number | null
          milestone_notifications?: Json | null
          parent_id: string
          schedule?: Json | null
          updated_at?: string
        }
        Update: {
          age_filter?: number | null
          auto_adjust_difficulty?: boolean | null
          break_interval_minutes?: number | null
          break_reminders?: boolean | null
          child_id?: string
          content_filter_level?: string | null
          created_at?: string
          daily_time_limit?: number | null
          difficulty_level?: number | null
          enabled_categories?: Json | null
          focus_mode?: boolean | null
          id?: string
          learning_goals?: Json | null
          max_games_per_session?: number | null
          milestone_notifications?: Json | null
          parent_id?: string
          schedule?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "remote_control_settings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "parent" | "child"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["parent", "child"],
    },
  },
} as const
