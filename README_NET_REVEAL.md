# Net Reveal - Netflix Clone Platform

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

A comprehensive Netflix-like movie streaming platform called **Net Reveal** built with Node.js, TypeScript, Express, and Prisma. Features TMDB API integration, user authentication, subscription management, and content tracking.

## 🚀 Features

### 🎬 Movie Management
- **TMDB API Integration**: Real-time movie data sync with The Movie Database
- **Advanced Search**: Search movies by title, genre, year, rating
- **Trending Content**: Discover trending and popular movies
- **Genre Filtering**: Browse movies by categories
- **Video Management**: Trailers, teasers, and behind-the-scenes content

### 👤 User System
- **Authentication**: JWT-based secure authentication without Redis
- **User Profiles**: Personalized user accounts
- **Preferences**: Customizable viewing preferences
- **Session Management**: Secure session handling

### 💳 Subscription Management
- **Multiple Tiers**: FREE, BASIC, PREMIUM, PREMIUM_PLUS plans
- **Feature-based Access**: Quality limits, device limits, download permissions
- **Billing Integration**: Payment method and subscription tracking
- **Usage Analytics**: Monitor subscription usage

### 📝 Content Interaction
- **Watchlists**: Multiple list types (Watchlist, Favorites, Watched, Interested)
- **Ratings & Reviews**: 1-10 star rating system with reviews
- **Watch History**: Track viewing progress and completion
- **Continue Watching**: Resume partially watched content

### 📊 Analytics & Insights
- **Viewing Statistics**: Personal viewing analytics
- **Watch Trends**: Daily/weekly viewing patterns
- **Rating Analytics**: Movie rating distributions
- **Recommendation Engine**: Content suggestions based on preferences

## 🛠️ Tech Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens (no Redis dependency)
- **API Documentation**: RESTful API design
- **External APIs**: TMDB (The Movie Database)
- **Rate Limiting**: In-memory rate limiting
- **Validation**: Input validation and sanitization

## 📁 Project Structure

```
src/
├── modules/
│   ├── authentication/          # 🔐 Authentication system (no subfolders)
│   │   ├── authentication.controller.ts
│   │   ├── authentication.service.ts
│   │   ├── authentication.routes.ts
│   │   ├── auth.interface.ts
│   │   └── auth.validation.ts
│   ├── users/                  # 👤 User management (no subfolders)
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.routes.ts
│   │   ├── user.interface.ts
│   │   └── user.validation.ts
│   ├── movie/                 # 🎬 Movie management
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── types/
│   ├── subscription/          # 💳 Subscription management
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── types/
│   ├── watchlist/             # 📝 Watchlist management
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── types/
│   ├── rating/                # ⭐ Rating system
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── types/
│   └── watch-history/         # 📺 History tracking
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       └── types/
├── config/
│   ├── tmdb.config.ts        # 🎬 TMDB API configuration
│   └── index.ts              # ⚙️ App configuration
├── middleware/
│   └── auth-new.middleware.ts  # 🔐 Authentication middleware
├── routes/
│   └── index.ts              # 🛣️ Main routes
├── app.ts                     # 🌐 Express app setup
└── server.ts                  # 🚀 Server startup
```

## 🎯 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email` - Verify email

### Users
- `GET /api/v1/users` - Get all users (admin)
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update current user profile
- `GET /api/v1/users/preferences` - Get user preferences
- `PUT /api/v1/users/preferences` - Update user preferences
- Plus admin management endpoints

### Movies
- `GET /api/v1/movies` - Get all movies with filtering
- `GET /api/v1/movies/trending` - Get trending movies
- `GET /api/v1/movies/search` - Search movies
- `GET /api/v1/movies/genres` - Get all genres

### Subscriptions
- `GET /api/v1/subscriptions/plans` - Get subscription plans
- `GET /api/v1/subscriptions/user` - Get user subscription
- `POST /api/v1/subscriptions/user` - Create subscription

### Watchlists
- `POST /api/v1/watchlist` - Add to watchlist
- `GET /api/v1/watchlist` - Get user watchlist
- `GET /api/v1/watchlist/stats` - Get watchlist statistics

### Ratings
- `POST /api/v1/ratings` - Create/update rating
- `GET /api/v1/ratings/movie/:id` - Get movie ratings
- `GET /api/v1/ratings/top-rated` - Get top rated movies

### Watch History
- `POST /api/v1/watch-history` - Update watch history
- `GET /api/v1/watch-history/continue-watching` - Get continue watching
- `GET /api/v1/watch-history/stats` - Get viewing statistics

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- TMDB API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd net-reveal-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
Create a `.env` file with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/net_reveal_platform"
JWT_ACCESS_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=8082
NODE_ENV=development
```

4. **Database setup**
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) View database in Prisma Studio
npm run prisma:studio
```

5. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:8082`

## 📚 API Documentation

Detailed API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🔧 Configuration

### TMDB API Setup
1. Get an API key from [TMDB](https://www.themoviedb.org/settings/api)
2. The API key is already configured in `src/config/tmdb.config.ts`
3. Movie data will be automatically synced from TMDB

### Subscription Plans
The platform supports 4 subscription tiers:
- **FREE**: SD quality, 1 device, no downloads
- **BASIC**: HD quality, 2 devices, 10 downloads
- **PREMIUM**: Full HD, 4 devices, 25 downloads
- **PREMIUM_PLUS**: 4K quality, 6 devices, 100 downloads

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio
```

### Code Structure
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data operations
- **Routes**: API endpoint definitions
- **Interfaces**: TypeScript type definitions
- **Validation**: Input validation schemas

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication (no Redis)
- **Rate Limiting**: Prevent API abuse with in-memory tracking
- **Input Validation**: Sanitize and validate all inputs
- **CORS Protection**: Cross-origin resource sharing controls
- **Helmet Security**: Security headers and protections
- **Login Attempt Tracking**: Account lockout after failed attempts

## 📊 Features in Detail

### Movie Management
- Real-time sync with TMDB database
- Advanced filtering and search capabilities
- Video content management (trailers, clips)
- Genre-based categorization
- Trending and popular content discovery

### User Experience
- Personalized watchlists with multiple categories
- Progress tracking for partially watched content
- Rating and review system
- Viewing statistics and insights
- Recommendation engine based on preferences

### Authentication System
- Clean, Redis-free authentication
- In-memory token management
- Login attempt tracking with account lockout
- Email verification system
- Password reset functionality

### Subscription System
- Flexible tier-based pricing
- Feature-based access control
- Usage monitoring and analytics
- Payment method integration
- Subscription lifecycle management

## 🚀 Deployment

### Production Setup
1. Set production environment variables
2. Build the application: `npm run build`
3. Run database migrations: `npm run prisma:migrate`
4. Start the server: `npm start`

### Environment Variables
```env
DATABASE_URL="postgresql://..."
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
PORT=8082
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the code comments for additional context

---

**Built with ❤️ for movie lovers everywhere - Net Reveal Platform**
