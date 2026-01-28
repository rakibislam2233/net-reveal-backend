# Netflix Movie Platform API Documentation

## Overview

This is a comprehensive Netflix-like movie platform backend with TMDB API integration. The platform provides movie streaming capabilities with user authentication, subscriptions, watchlists, ratings, and watch history tracking.

## Base URL

```
http://localhost:8082
```

## API Version

```
/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🎬 Movie Endpoints

### Get All Movies
```http
GET /api/v1/movies
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `genre` (string): Filter by genre ID
- `language` (string): Filter by language
- `year` (number): Filter by release year
- `minRating` (number): Minimum rating filter
- `maxRating` (number): Maximum rating filter
- `search` (string): Search query
- `sortBy` (string): Sort by field (popularity, release_date, vote_average, title)
- `sortOrder` (string): Sort order (asc, desc)

### Get Trending Movies
```http
GET /api/v1/movies/trending
```

### Get Popular Movies
```http
GET /api/v1/movies/popular
```

### Search Movies
```http
GET /api/v1/movies/search?query=<search-term>
```

### Get Movies by Genre
```http
GET /api/v1/movies/genre/<genreId>
```

### Get Movie by ID
```http
GET /api/v1/movies/<movieId>
```

### Get Movie by TMDB ID
```http
GET /api/v1/movies/tmdb/<tmdbId>
```

### Get All Genres
```http
GET /api/v1/movies/genres
```

### Sync Movie from TMDB (Admin)
```http
POST /api/v1/movies/sync
```

**Body:**
```json
{
  "tmdbId": 12345
}
```

## 💳 Subscription Endpoints

### Get All Plans
```http
GET /api/v1/subscriptions/plans
```

### Get Specific Plan
```http
GET /api/v1/subscriptions/plans/<plan>
```

### Get User Subscription
```http
GET /api/v1/subscriptions/user
```
*Requires Authentication*

### Create Subscription
```http
POST /api/v1/subscriptions/user
```
*Requires Authentication*

**Body:**
```json
{
  "plan": "BASIC",
  "paymentMethod": "credit_card"
}
```

### Update Subscription
```http
PUT /api/v1/subscriptions/user
```
*Requires Authentication*

### Cancel Subscription
```http
DELETE /api/v1/subscriptions/user
```
*Requires Authentication*

### Get Subscription Usage
```http
GET /api/v1/subscriptions/usage
```
*Requires Authentication*

### Check Subscription Access
```http
GET /api/v1/subscriptions/check-access?quality=HD
```
*Requires Authentication*

## 📝 Watchlist Endpoints

### Add to Watchlist
```http
POST /api/v1/watchlist
```
*Requires Authentication*

**Body:**
```json
{
  "movieId": "movie_123",
  "listType": "WATCHLIST"
}
```

**List Types:** `WATCHLIST`, `FAVORITES`, `WATCHED`, `INTERESTED`

### Get Watchlist
```http
GET /api/v1/watchlist?listType=WATCHLIST&page=1&limit=20
```
*Requires Authentication*

### Check Movie in List
```http
GET /api/v1/watchlist/check/<movieId>?listType=WATCHLIST
```
*Requires Authentication*

### Get Watchlist Statistics
```http
GET /api/v1/watchlist/stats
```
*Requires Authentication*

### Get Similar Movies (Recommendations)
```http
GET /api/v1/watchlist/similar?limit=10
```
*Requires Authentication*

### Remove from Watchlist
```http
DELETE /api/v1/watchlist/<movieId>?listType=WATCHLIST
```
*Requires Authentication*

### Move Between Lists
```http
PUT /api/v1/watchlist/<movieId>/move
```
*Requires Authentication*

**Body:**
```json
{
  "fromListType": "WATCHLIST",
  "toListType": "FAVORITES"
}
```

### Clear Watchlist
```http
DELETE /api/v1/watchlist?listType=WATCHLIST
```
*Requires Authentication*

## ⭐ Rating Endpoints

### Create/Update Rating
```http
POST /api/v1/ratings
```
*Requires Authentication*

**Body:**
```json
{
  "movieId": "movie_123",
  "rating": 8.5,
  "review": "Great movie!"
}
```

### Get Movie Ratings
```http
GET /api/v1/ratings/movie/<movieId>?page=1&limit=20
```

### Get Movie Rating Statistics
```http
GET /api/v1/ratings/movie/<movieId>/stats
```

### Get Top Rated Movies
```http
GET /api/v1/ratings/top-rated?limit=10
```

### Get User Ratings
```http
GET /api/v1/ratings/user?page=1&limit=20
```
*Requires Authentication*

### Get User Rating for Movie
```http
GET /api/v1/ratings/user/movie/<movieId>
```
*Requires Authentication*

### Get User Rating Statistics
```http
GET /api/v1/ratings/user/stats
```
*Requires Authentication*

### Update Rating
```http
PUT /api/v1/ratings/<ratingId>
```
*Requires Authentication*

### Delete Rating
```http
DELETE /api/v1/ratings/<ratingId>
```
*Requires Authentication*

## 📺 Watch History Endpoints

### Update Watch History
```http
POST /api/v1/watch-history
```
*Requires Authentication*

**Body:**
```json
{
  "movieId": "movie_123",
  "watchedMinutes": 45,
  "totalMinutes": 120,
  "completed": false
}
```

### Get Watch History
```http
GET /api/v1/watch-history?page=1&limit=20&completed=false
```
*Requires Authentication*

### Get Continue Watching
```http
GET /api/v1/watch-history/continue-watching?limit=10
```
*Requires Authentication*

### Get Watch History Statistics
```http
GET /api/v1/watch-history/stats
```
*Requires Authentication*

### Get Watching Trends
```http
GET /api/v1/watch-history/trends?days=30
```
*Requires Authentication*

### Get Movie Watch History
```http
GET /api/v1/watch-history/movie/<movieId>
```
*Requires Authentication*

### Mark as Completed
```http
POST /api/v1/watch-history/movie/<movieId>/complete
```
*Requires Authentication*

### Delete Watch History Entry
```http
DELETE /api/v1/watch-history/movie/<movieId>
```
*Requires Authentication*

### Clear All Watch History
```http
DELETE /api/v1/watch-history
```
*Requires Authentication*

## 🏥 Health Check

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Netflix Movie Platform API is running",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## 📊 Response Format

All responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "code": 400
}
```

## 🎯 Subscription Plans

| Plan | Price | Quality | Devices | Downloads | Features |
|------|-------|---------|---------|-----------|----------|
| FREE | $0 | SD | 1 | ❌ | Basic access |
| BASIC | $9.99 | HD | 2 | ✅ (10) | HD quality, downloads |
| PREMIUM | $15.99 | Full HD | 4 | ✅ (25) | Full HD, more downloads |
| PREMIUM_PLUS | $19.99 | 4K | 6 | ✅ (100) | 4K, unlimited downloads |

## 🔧 Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Generate Prisma client: `npm run prisma:generate`
4. Run database migrations: `npm run prisma:migrate`
5. Start development server: `npm run dev`

## 📝 Notes

- All timestamps are in ISO 8601 format
- Pagination starts from page 1
- Rate limiting is applied to all endpoints
- TMDB API is used for movie data
- Mock data is used in services - replace with actual database integration
