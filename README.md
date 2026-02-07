# Kreotype

A modern, feature-rich typing test web application built with Next.js, TypeScript, and MongoDB.

## 🚀 Features

- **Multiple Test Modes**: Time-based, word count, and zen mode
- **Real-time Statistics**: WPM, accuracy, consistency tracking
- **Customizable Settings**: Punctuation, numbers, different languages
- **User Accounts**: Save progress, view history, track personal bests
- **Leaderboards**: Compete with other typists globally
- **Themes**: Multiple color themes with custom theme support
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 + React 19 | App routing, SSR/SSG |
| **Language** | TypeScript | Type safety and maintainability |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **State** | Zustand | Lightweight state management |
| **Database** | MongoDB + Mongoose | User data and test results |
| **Cache** | Redis + ioredis | Leaderboards and hot data |
| **Auth** | Auth.js (NextAuth v5) | Authentication and OAuth |
| **Validation** | Zod | Runtime schema validation |
| **Charts** | Recharts | Performance visualizations |
| **Animation** | Framer Motion | Smooth UI animations |
| **Testing** | Vitest + Testing Library | Unit and integration tests |

## 📦 Installation

### Prerequisites

- Node.js 20+ and npm
- MongoDB (local or Atlas)
- Redis (optional, falls back to in-memory)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kreotype-project/kreotype-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your credentials:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/kreotype
   MONGODB_DB_NAME=kreotype
   REDIS_URL=redis://localhost:6379

   # Auth
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   NEXTAUTH_URL=http://localhost:3000

   # OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Email (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=noreply@kreotype.com
   ```

4. **Start MongoDB and Redis** (if running locally)
   ```bash
   # MongoDB
   mongod --dbpath /path/to/data

   # Redis
   redis-server
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   └── ...                # Page components
├── components/            # React components
│   ├── features/         # Feature-specific components
│   ├── layout/           # Layout components
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── core/                  # Core business logic
│   ├── typing-engine.ts  # Typing test engine
│   ├── word-generator.ts # Word generation logic
│   └── badge-engine.ts   # Badge system
├── hooks/                 # Custom React hooks
│   ├── useTypingEngine.ts
│   ├── useTestTimer.ts
│   ├── useKeyboardInput.ts
│   └── usePaceCaret.ts
├── lib/                   # Utilities and configurations
│   ├── db/               # Database schemas and operations
│   ├── auth.ts           # Auth configuration
│   ├── redis.ts          # Redis client
│   └── utils.ts          # Helper functions
├── server/                # Server-side code
│   ├── models/           # Mongoose models
│   ├── middleware/       # API middleware
│   └── validators/       # Request validators
├── store/                 # Zustand stores
│   ├── useTypingTestStore.ts
│   ├── useConfigStore.ts
│   └── themeStore.ts
├── test/                  # Test files
└── types/                 # TypeScript type definitions
```

## 🎯 Architecture Principles

### Separation of Concerns

- **Core Logic** (`src/core/`): Pure business logic, framework-agnostic
- **Hooks** (`src/hooks/`): React integration layer
- **Components** (`src/components/`): UI presentation only
- **Store** (`src/store/`): State management

### Client-Side Test Execution

All typing test logic runs client-side for zero latency. Only final results are sent to the server.

```
User types → Client calculates stats → Test ends → Send result to API → Save to DB
```

### Phase 2 Ready

The architecture supports future features:
- Text patterns (circular, spiral, shapes)
- Typing-driven games
- Real-time multiplayer

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
```

## 🔒 Security

- Environment variables are gitignored
- OAuth credentials use secure flows
- Passwords are hashed with bcrypt
- API routes use authentication middleware
- Input validation with Zod schemas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Inspired by [Monkeytype](https://monkeytype.com)
- Built for [kreo-tech.com](https://kreo-tech.com)