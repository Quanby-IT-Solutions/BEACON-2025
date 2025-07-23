# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack for fast hot reload
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npx prisma db push` - Push schema changes to database
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma studio` - Open Prisma Studio for database management
- `npx supabase start` - Start local Supabase development environment
- `npx supabase stop` - Stop local Supabase services

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
- **Core Models**: User, UserAccounts, UserDetails, AttendeeRegistration
- **Event Registration System**: Comprehensive BEACON 2025 event registration with enums for Gender, AgeBracket, Industry, EventDay, AttendeeType, InterestArea, HearAboutEvent
- **User Management**: Multi-table user system with accounts, details, and registration data
- **Database Provider**: PostgreSQL with Supabase
- **Client Generation**: Custom output to `src/generated/prisma`

### Authentication Flow
- Route-based authentication with Next.js route groups
- Supabase Auth integration with SSR support
- Protected routes in `(private)` group
- Public routes in `(public)` group
- Auth pages in `(auth)` group

### Key Configuration
- **Import Aliases**: `@/` maps to `./src/` for clean imports
- **Component Aliases**: Pre-configured paths for `@/components`, `@/lib`, `@/hooks`, `@/ui`
- **UI Library**: Lucide React for icons, extensive Radix UI primitives
- **Fonts**: Custom Urbanist font family with multiple weights and styles, plus Geist fonts

### Development Notes
- Uses Turbopack in development for enhanced performance
- Organized hook structure separating standard hooks from React Query hooks
- Route group architecture for clean authentication flow
- Custom Prisma client output location for better organization

### Domain Context
- **BEACON 2025**: Maritime industry event registration and management system
- **Target Users**: Seafarers, corporate professionals, students, government officials, exhibitors, media
- **Event Features**: Multi-day attendance tracking, industry categorization, interest area matching
- **Registration Flow**: Comprehensive multi-step registration with personal, professional, and event-specific data

### Development Protocols
- Always look at the prisma/schema.prisma before creating api or codes
- Always check types/ directory if there is available data types for specific schema model

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

## Linting Notes
- I have no linting I disabled it