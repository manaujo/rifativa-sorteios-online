export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bilhetes_campanha: {
        Row: {
          campanha_id: string
          cpf: string
          created_at: string | null
          id: string
          nome_comprador: string
          quantidade: number
          status: Database["public"]["Enums"]["status_bilhete_campanha"] | null
          telefone: string
        }
        Insert: {
          campanha_id: string
          cpf: string
          created_at?: string | null
          id?: string
          nome_comprador: string
          quantidade?: number
          status?: Database["public"]["Enums"]["status_bilhete_campanha"] | null
          telefone: string
        }
        Update: {
          campanha_id?: string
          cpf?: string
          created_at?: string | null
          id?: string
          nome_comprador?: string
          quantidade?: number
          status?: Database["public"]["Enums"]["status_bilhete_campanha"] | null
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "bilhetes_campanha_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas"
            referencedColumns: ["id"]
          },
        ]
      }
      bilhetes_rifa: {
        Row: {
          cpf: string | null
          created_at: string | null
          id: string
          nome_comprador: string | null
          numero: number
          rifa_id: string
          status: Database["public"]["Enums"]["status_bilhete"] | null
          telefone: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          id?: string
          nome_comprador?: string | null
          numero: number
          rifa_id: string
          status?: Database["public"]["Enums"]["status_bilhete"] | null
          telefone?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          id?: string
          nome_comprador?: string | null
          numero?: number
          rifa_id?: string
          status?: Database["public"]["Enums"]["status_bilhete"] | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bilhetes_rifa_rifa_id_fkey"
            columns: ["rifa_id"]
            isOneToOne: false
            referencedRelation: "rifas"
            referencedColumns: ["id"]
          },
        ]
      }
      campanhas: {
        Row: {
          created_at: string | null
          descricao: string | null
          destaque: boolean | null
          id: string
          imagem: string | null
          modo: Database["public"]["Enums"]["modo_campanha"] | null
          preco_bilhete: number
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem?: string | null
          modo?: Database["public"]["Enums"]["modo_campanha"] | null
          preco_bilhete: number
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem?: string | null
          modo?: Database["public"]["Enums"]["modo_campanha"] | null
          preco_bilhete?: number
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campanhas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          comprador_cpf: string
          comprador_nome: string
          comprador_telefone: string
          created_at: string | null
          id: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"] | null
          referencia_id: string
          status: Database["public"]["Enums"]["status_pagamento"] | null
          tipo: Database["public"]["Enums"]["tipo_pagamento"]
          valor: number
        }
        Insert: {
          comprador_cpf: string
          comprador_nome: string
          comprador_telefone: string
          created_at?: string | null
          id?: string
          metodo?: Database["public"]["Enums"]["metodo_pagamento"] | null
          referencia_id: string
          status?: Database["public"]["Enums"]["status_pagamento"] | null
          tipo: Database["public"]["Enums"]["tipo_pagamento"]
          valor: number
        }
        Update: {
          comprador_cpf?: string
          comprador_nome?: string
          comprador_telefone?: string
          created_at?: string | null
          id?: string
          metodo?: Database["public"]["Enums"]["metodo_pagamento"] | null
          referencia_id?: string
          status?: Database["public"]["Enums"]["status_pagamento"] | null
          tipo?: Database["public"]["Enums"]["tipo_pagamento"]
          valor?: number
        }
        Relationships: []
      }
      rifas: {
        Row: {
          bilhete_premiado: number | null
          created_at: string | null
          descricao: string | null
          id: string
          imagem: string | null
          quantidade_bilhetes: number
          status: Database["public"]["Enums"]["status_rifa"] | null
          titulo: string
          user_id: string
          valor_bilhete: number
        }
        Insert: {
          bilhete_premiado?: number | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem?: string | null
          quantidade_bilhetes: number
          status?: Database["public"]["Enums"]["status_rifa"] | null
          titulo: string
          user_id: string
          valor_bilhete: number
        }
        Update: {
          bilhete_premiado?: number | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem?: string | null
          quantidade_bilhetes?: number
          status?: Database["public"]["Enums"]["status_rifa"] | null
          titulo?: string
          user_id?: string
          valor_bilhete?: number
        }
        Relationships: [
          {
            foreignKeyName: "rifas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          chave_pix: string | null
          created_at: string | null
          email: string
          id: string
          nome: string
          plano: Database["public"]["Enums"]["plano_type"] | null
          total_campanhas: number | null
          total_rifas: number | null
        }
        Insert: {
          chave_pix?: string | null
          created_at?: string | null
          email: string
          id: string
          nome: string
          plano?: Database["public"]["Enums"]["plano_type"] | null
          total_campanhas?: number | null
          total_rifas?: number | null
        }
        Update: {
          chave_pix?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          plano?: Database["public"]["Enums"]["plano_type"] | null
          total_campanhas?: number | null
          total_rifas?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      metodo_pagamento: "pix"
      modo_campanha: "simples" | "combo"
      plano_type: "economico" | "padrao" | "premium"
      status_bilhete: "disponivel" | "reservado" | "confirmado"
      status_bilhete_campanha: "aguardando" | "pago" | "cancelado"
      status_pagamento: "pendente" | "confirmado" | "cancelado"
      status_rifa: "ativa" | "encerrada"
      tipo_pagamento: "rifa" | "campanha"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      metodo_pagamento: ["pix"],
      modo_campanha: ["simples", "combo"],
      plano_type: ["economico", "padrao", "premium"],
      status_bilhete: ["disponivel", "reservado", "confirmado"],
      status_bilhete_campanha: ["aguardando", "pago", "cancelado"],
      status_pagamento: ["pendente", "confirmado", "cancelado"],
      status_rifa: ["ativa", "encerrada"],
      tipo_pagamento: ["rifa", "campanha"],
    },
  },
} as const
