export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number;
          checksum: string;
          finished_at: string | null;
          id: string;
          logs: string | null;
          migration_name: string;
          rolled_back_at: string | null;
          started_at: string;
        };
        Insert: {
          applied_steps_count?: number;
          checksum: string;
          finished_at?: string | null;
          id: string;
          logs?: string | null;
          migration_name: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Update: {
          applied_steps_count?: number;
          checksum?: string;
          finished_at?: string | null;
          id?: string;
          logs?: string | null;
          migration_name?: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Relationships: [];
      };
      Account: {
        Row: {
          access_token: string | null;
          expires_at: number | null;
          id: string;
          id_token: string | null;
          provider: string;
          providerAccountId: string;
          refresh_token: string | null;
          scope: string | null;
          session_state: string | null;
          token_type: string | null;
          type: string;
          userId: string;
        };
        Insert: {
          access_token?: string | null;
          expires_at?: number | null;
          id: string;
          id_token?: string | null;
          provider: string;
          providerAccountId: string;
          refresh_token?: string | null;
          scope?: string | null;
          session_state?: string | null;
          token_type?: string | null;
          type: string;
          userId: string;
        };
        Update: {
          access_token?: string | null;
          expires_at?: number | null;
          id?: string;
          id_token?: string | null;
          provider?: string;
          providerAccountId?: string;
          refresh_token?: string | null;
          scope?: string | null;
          session_state?: string | null;
          token_type?: string | null;
          type?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Account_userId_fkey";
            columns: ["userId"];
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
        ];
      };
      Game: {
        Row: {
          blackUserId: string | null;
          createdAt: string;
          hostUserId: string;
          id: string;
          startedAt: string | null;
          state: Database["public"]["Enums"]["GameState"];
          turn: Database["public"]["Enums"]["Turn"];
          type: Database["public"]["Enums"]["GameType"];
          updatedAt: string;
          whiteUserId: string | null;
        };
        Insert: {
          blackUserId?: string | null;
          createdAt?: string;
          hostUserId: string;
          id: string;
          startedAt?: string | null;
          state?: Database["public"]["Enums"]["GameState"];
          turn: Database["public"]["Enums"]["Turn"];
          type: Database["public"]["Enums"]["GameType"];
          updatedAt: string;
          whiteUserId?: string | null;
        };
        Update: {
          blackUserId?: string | null;
          createdAt?: string;
          hostUserId?: string;
          id?: string;
          startedAt?: string | null;
          state?: Database["public"]["Enums"]["GameState"];
          turn?: Database["public"]["Enums"]["Turn"];
          type?: Database["public"]["Enums"]["GameType"];
          updatedAt?: string;
          whiteUserId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "Game_blackUserId_fkey";
            columns: ["blackUserId"];
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Game_hostUserId_fkey";
            columns: ["hostUserId"];
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Game_whiteUserId_fkey";
            columns: ["whiteUserId"];
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
        ];
      };
      Move: {
        Row: {
          createdAt: string;
          gameId: string;
          positionX: number;
          positionY: number;
          positionZ: number;
          turn: Database["public"]["Enums"]["Turn"];
        };
        Insert: {
          createdAt?: string;
          gameId: string;
          positionX: number;
          positionY: number;
          positionZ: number;
          turn: Database["public"]["Enums"]["Turn"];
        };
        Update: {
          createdAt?: string;
          gameId?: string;
          positionX?: number;
          positionY?: number;
          positionZ?: number;
          turn?: Database["public"]["Enums"]["Turn"];
        };
        Relationships: [
          {
            foreignKeyName: "Move_gameId_fkey";
            columns: ["gameId"];
            referencedRelation: "Game";
            referencedColumns: ["id"];
          },
        ];
      };
      Session: {
        Row: {
          expires: string;
          id: string;
          sessionToken: string;
          userId: string;
        };
        Insert: {
          expires: string;
          id: string;
          sessionToken: string;
          userId: string;
        };
        Update: {
          expires?: string;
          id?: string;
          sessionToken?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Session_userId_fkey";
            columns: ["userId"];
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
        ];
      };
      User: {
        Row: {
          email: string | null;
          emailVerified: string | null;
          id: string;
          image: string | null;
          name: string | null;
        };
        Insert: {
          email?: string | null;
          emailVerified?: string | null;
          id: string;
          image?: string | null;
          name?: string | null;
        };
        Update: {
          email?: string | null;
          emailVerified?: string | null;
          id?: string;
          image?: string | null;
          name?: string | null;
        };
        Relationships: [];
      };
      VerificationToken: {
        Row: {
          expires: string;
          identifier: string;
          token: string;
        };
        Insert: {
          expires: string;
          identifier: string;
          token: string;
        };
        Update: {
          expires?: string;
          identifier?: string;
          token?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      GameSquare: "EMPTY" | "LIGHT" | "DARK";
      GameState:
        | "WAITINGFORPLAYERS"
        | "PLAYING"
        | "ANIMATING"
        | "LIGHTWIN"
        | "DARKWIN"
        | "ABANDONED";
      GameType: "PVPLOCAL" | "PVPREMOTE" | "BOT";
      Turn: "LIGHT" | "DARK";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
