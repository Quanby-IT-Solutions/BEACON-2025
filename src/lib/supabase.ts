import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with safe realtime configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Export types for TypeScript
export type Database = {
  public: {
    Tables: {
      // Conference table
      conferences: {
        Row: {
          id: string
          userId: string
          createdAt: string
          updatedAt: string
          isMaritimeLeagueMember: 'YES' | 'NO'
          tmlMemberCode: string | null
          registerForConference: boolean
          registerBoatShow: boolean
          registerBlueRunway: boolean
          conferenceDuration: 'ONE_DAY' | 'TWO_DAYS' | 'THREE_DAYS' | null
          attendingDay1: boolean
          attendingDay2: boolean
          attendingDay3: boolean
          fullName: string
          preferredName: string | null
          gender: 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY' | 'OTHERS'
          ageBracket: 'UNDER_18' | 'AGE_18_24' | 'AGE_25_34' | 'AGE_35_44' | 'AGE_45_54' | 'AGE_55_ABOVE'
          nationality: string
          email: string
          mobileNumber: string
          mailingAddress: string | null
          jobTitle: string | null
          companyName: string | null
          industry: string | null
          companyAddress: string | null
          companyWebsite: string | null
          interestAreas: string[]
          otherInterests: string | null
          receiveEventInvites: boolean
          totalPaymentAmount: number | null
          customPaymentAmount: string | null
          emailCertificate: boolean
          photoVideoConsent: boolean
          dataUsageConsent: boolean
          paymentToken: string | null
          paymentTokenExpiry: string | null
          requiresPayment: boolean
        }
        Insert: Omit<Database['public']['Tables']['conferences']['Row'], 'id' | 'createdAt' | 'updatedAt'>
        Update: Partial<Database['public']['Tables']['conferences']['Insert']>
      }
      // Visitors table  
      visitors: {
        Row: {
          id: string
          userId: string | null
          jobTitle: string
          companyName: string
          industry: 'MARITIME' | 'GOVERNMENT' | 'TOURISM_HOSPITALITY' | 'SHIPBUILDING_REPAIR' | 'NGO_DEVELOPMENT' | 'MEDIA_PRESS' | 'OTHERS'
          industryOthers: string | null
          companyAddress: string | null
          companyWebsite: string | null
          businessEmail: string | null
          attendingDays: string[]
          eventParts: string[]
          attendeeType: 'TRADE_VISITOR' | 'GOVERNMENT_OFFICIAL' | 'STUDENT_ACADEMIC' | 'MEDIA_PRESS' | 'EXHIBITOR' | 'SPEAKER_PANELIST' | 'VIP_GUEST'
          interestAreas: string[]
          receiveUpdates: boolean
          inviteToFutureEvents: boolean
          specialAssistance: string | null
          emergencyContactPerson: string
          emergencyContactNumber: string
          dataPrivacyConsent: boolean
          hearAboutEvent: 'FACEBOOK_SOCIAL_MEDIA' | 'WEBSITE' | 'EMAIL_INVITATION' | 'REFERRED_BY_FRIEND' | 'PARTICIPATED_LAST_YEAR' | 'OTHER'
          hearAboutOthers: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: Omit<Database['public']['Tables']['visitors']['Row'], 'id' | 'createdAt' | 'updatedAt'>
        Update: Partial<Database['public']['Tables']['visitors']['Insert']>
      }
      // Events table
      events: {
        Row: {
          id: string
          createdAt: string
          updatedAt: string
          eventName: string
          eventDate: string
          eventPrice: number
          eventStatus: 'CONFERENCE' | 'SHOW' | 'WORKSHOP' | 'SEMINAR' | 'EXHIBITION'
          isActive: boolean
          description: string | null
          eventStartTime: string | null
          eventEndTime: string | null
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'createdAt' | 'updatedAt'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      // Code distribution table
      code_distribution: {
        Row: {
          id: string
          createdAt: string
          updatedAt: string
          code: string
          isActive: boolean
          userId: string | null
        }
        Insert: Omit<Database['public']['Tables']['code_distribution']['Row'], 'id' | 'createdAt' | 'updatedAt'>
        Update: Partial<Database['public']['Tables']['code_distribution']['Insert']>
      }
      // Conference payments table
      conference_payments: {
        Row: {
          id: string
          conferenceId: string
          createdAt: string
          updatedAt: string
          totalAmount: number
          paymentMode: 'BANK_DEPOSIT_TRANSFER' | 'GCASH' | 'WALK_IN_ON_SITE'
          paymentStatus: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED'
          customPaymentAmount: string | null
          transactionId: string | null
          proofOfPaymentUrl: string | null
          paymentDate: string | null
          paymongoPaymentId: string | null
          paymongoCheckoutId: string | null
          paymongoIntentId: string | null
          paymongoWebhookId: string | null
          paymongoPaymentMethod: string | null
          paymongoReferenceId: string | null
          isPaid: boolean
          paymentConfirmedAt: string | null
          paymentConfirmedBy: string | null
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['conference_payments']['Row'], 'id' | 'createdAt' | 'updatedAt'>
        Update: Partial<Database['public']['Tables']['conference_payments']['Insert']>
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']