# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack for fast hot reload
- `npm run build` - Create production build (includes `prisma generate`)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks (disabled by default)

### Database Operations
- `npx prisma db push` - Push schema changes to database
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma db seed` - Run database seeding (configured with ts-node)

### Supabase Local Development
- `npx supabase start` - Start local Supabase development environment
- `npx supabase stop` - Stop local Supabase services

### Package Management
- `npm install` - Install dependencies (includes automatic `prisma generate` via postinstall)

## Project Architecture

### Technology Stack
- **Framework**: Next.js 15.4.2 with App Router
- **Language**: TypeScript with strict mode enabled
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Authentication**: Supabase Auth with SSR support
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: Comprehensive shadcn/ui component library (New York style)
- **State Management**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Theming**: next-themes for dark/light mode support

### Project Structure
```
src/
├── app/
│   ├── (auth)/          # Authentication pages (login, registration)
│   ├── (private)/       # Protected routes requiring authentication
│   ├── (public)/        # Public routes
│   └── layout.tsx       # Root layout with providers
├── components/
│   ├── reuseable/       # Custom reusable components
│   └── ui/             # shadcn/ui components (40+ pre-built components)
├── hooks/
│   ├── standard-hooks/  # General React hooks
│   └── tanstasck-query/ # React Query hooks for data fetching
├── lib/
│   └── utils.ts        # Utility functions
├── types/              # TypeScript type definitions
└── generated/
    └── prisma/         # Generated Prisma client
```

### Database Architecture
- **Schema Location**: `prisma/schema.prisma`
- **Core Models**: 
  - User system: `Users`, `user_accounts`, `user_details`
  - Registration: `Visitors` (general event), `Conference` (conference-specific)
  - Payment: `ConferencePayment`, `SummaryOfPayments`
  - Events: `Events`, `CodeDistribution`
  - Admin: `ManagerAccount`
- **Key Enums**: Gender, AgeBracket, Industry, AttendeeType, InterestArea, HearAboutEvent, MaritimeLeagueMembership, PaymentMode, PaymentStatus
- **Registration Flow**: Dual registration system for visitors and conference attendees
- **Payment Integration**: PayMongo integration with webhook-based payment confirmation
- **Database Provider**: PostgreSQL with Supabase (supports both `DATABASE_URL` and `DIRECT_URL`)
- **Client Generation**: Standard Prisma client (not custom output)

### Authentication Flow
- Route-based authentication with Next.js route groups
- Supabase Auth integration with SSR support
- Protected routes in `(private)` group
- Public routes in `(public)` group
- Auth pages in `(auth)` group

### Key Configuration
- **Import Aliases**: `@/` maps to `./src/` for clean imports
- **TypeScript**: Strict mode enabled with ES2017 target
- **UI Library**: Lucide React for icons, extensive Radix UI primitives (40+ components)
- **Fonts**: Custom Urbanist font family with multiple weights and styles, plus Geist fonts
- **Webpack Config**: Custom fallbacks for Node.js modules (fs, path, crypto)
- **Face Recognition**: face-api.js integration with server components external packages config

### Development Notes
- Uses Turbopack in development for enhanced performance
- Organized hook structure separating standard hooks from React Query hooks
- Route group architecture for clean authentication flow: `(auth)`, `(private)`, `(public)`
- Admin panel with data tables for managing visitors, conferences, events, and codes
- Real-time capabilities via Supabase realtime provider
- State management using Zustand stores for different registration types

### Domain Context
- **BEACON 2025**: Maritime industry event registration and management system
- **Target Users**: Seafarers, corporate professionals, students, government officials, exhibitors, media
- **Event Features**: Multi-day attendance tracking, industry categorization, interest area matching
- **Registration Flow**: Comprehensive multi-step registration with personal, professional, and event-specific data

### Development Protocols
- Always look at `prisma/schema.prisma` before creating API routes or database-related code
- Always check `src/types/` directory if there are available data types for specific schema models
- Face capture functionality is integrated - check `face-api.js` configuration in Next.js config
- Use appropriate registration stores: `useRegistrationStore` for visitors, `useConferenceRegistrationStore` for conferences
- Admin routes require authentication validation via `adminSessions.ts`
- **Realtime Integration**: Admin pages automatically refresh when database changes occur via Supabase realtime subscriptions

### Realtime Features
- **Live Admin Dashboard**: Visitor and conference admin tables show real-time updates with visual indicators
- **Auto-refresh**: Tables automatically refresh when realtime changes are detected
- **Connection Status**: Visual indicators show when realtime connection is active
- **Fallback Strategy**: API-based data loading when realtime is unavailable
- **Toast Notifications**: Real-time event notifications for database changes

## Warnings and Cautions

- Do not use or run migration especially forcing npx prisma migrate

## Payment Integration Notes

- PayMongo tracks payments by checkout session/payment intent, not by the phone number used to pay
- Even if someone else pays on behalf of the user (e.g., parents paying for children, assistants paying for bosses), the payment will be confirmed if:
  - The correct amount is paid
  - The payment is made to the correct PayMongo checkout session
- PayMongo handles these scenarios perfectly through their webhook system

## Form Schema Alignment Notes

### Maritime League Section
- ✅ isMaritimeLeagueMember → "Yes/No/Apply for membership"
- ✅ tmlMemberCode → TML member code field

### Event Registration Section
- ✅ registerForConference → BEACON 2025 Conference
- ✅ registerBoatShow → In-Water Show (FREE)
- ✅ registerBlueRunway → Blue Runway Fashion Show

### Conference Days Section
- ✅ conferenceDuration → 1/2/3 days
- ✅ attendingDay1/2/3 → Individual day selection

### Personal/Contact/Professional/Interests Sections
- ✅ All form fields mapped to schema fields

### Payment Section - PayMongo Ready
- ✅ totalPaymentAmount → Calculated total (₱2,000-₱9,000)
- ✅ paymongoCheckoutId → PayMongo session tracking
- ✅ isPaid → Automatic webhook confirmation
- ✅ paymentMode → GCash/Bank/Walk-in

### PayMongo Integration Flow
```typescript
// 1. Registration submission
if (!isMaritimeLeagueMember) {
  // Create PayMongo checkout
  const checkout = await paymongo.createCheckout({
    amount: calculateTotal(selections),
    currency: 'PHP'
  });

  // Store in DB
  await createConferencePayment({
    paymongoCheckoutId: checkout.id,
    totalAmount: checkout.amount,
    requiresPayment: true
  });
}

// 2. Webhook automatically confirms
// When user pays from ANY device/phone
webhook.on('payment.paid', async (event) => {       
  await updatePayment({
    isPaid: true,
    paymentConfirmedAt: new Date(),
    paymentConfirmedBy: 'webhook'
  });
});
```

## Technical Architecture Notes

### State Management Pattern
- **Zustand Stores**: Individual stores for different registration types and app state
- **TanStack Query**: Server state management with real-time cache updates
- **Supabase Realtime**: WebSocket-based real-time database updates with comprehensive admin dashboard integration

### Component Architecture
- **Multi-step Forms**: Conference and visitor registration with progress tracking
- **Draft Management**: Auto-save functionality for incomplete registrations
- **Admin Data Tables**: TanStack Table integration for data management
- **Modal Patterns**: Consistent dialog and sheet usage throughout the app

### API Route Structure
```
api/
├── admin/           # Admin-only endpoints
├── check-email/     # Email validation
├── code-distribution/ # Registration codes
├── conference/      # Conference registration & receipts
├── events/          # Event management
└── visitors/        # Visitor registration
```

### Linting & Code Quality
- ESLint configured but disabled by default
- TypeScript strict mode enforced
- Prisma client regeneration on build and install