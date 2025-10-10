# FastDelivery - Delivery Service Platform

Modern delivery service platform with landing page and customer dashboard built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- ⚡ Fast development with Vite
- 🎨 Styled with Tailwind CSS
- 📱 Fully responsive design
- 🎯 TypeScript for type safety
- 🧩 Modular component architecture
- 🎭 Beautiful animations and transitions
- 📊 Customer dashboard with order management
- 🔄 Real-time order tracking
- 📦 Order creation and management
- 🔍 Search and filter functionality

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── BenefitsSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── PricingSection.tsx
│   │   ├── TrackingSection.tsx
│   │   ├── DriverSection.tsx
│   │   ├── MerchantSection.tsx
│   │   ├── SocialProofSection.tsx
│   │   └── FAQSection.tsx
│   ├── pages/
│   │   └── LandingPage.tsx
│   ├── ui/
│   └── CreateOrderModal.tsx
├── pages/
│   ├── LandingPage.tsx
│   └── CustomerDashboard.tsx
├── services/
│   └── customerApi.ts
├── styles/
│   └── global.css
├── App.tsx
└── main.tsx
```

## Pages

### Landing Page (`/`)
- Hero section with call-to-action
- Benefits and features showcase
- How it works explanation
- Pricing information
- Social proof and testimonials

### Customer Dashboard (`/dashboard`)
- Order statistics overview
- Quick actions (Create order, Track order, Update profile)
- Order management with search and filter
- Real-time order status updates
- Order creation modal

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Routing
- **Axios** - HTTP client for API calls

## License

MIT
