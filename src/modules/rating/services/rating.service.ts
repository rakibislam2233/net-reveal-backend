import { Rating, CreateRatingRequest, UpdateRatingRequest, RatingResponse, MovieRatingStats, UserRatingStats } from '../types/rating.types';

export class RatingService {
  // Mock data storage (replace with actual database)
  private ratingsData: Map<string, Rating[]> = new Map(); // movieId -> ratings
  private userRatingsData: Map<string, Rating[]> = new Map(); // userId -> ratings

  // Create or update rating
  async createOrUpdateRating(userId: string, data: CreateRatingRequest): Promise<Rating> {
    try {
      if (data.rating < 1 || data.rating > 10) {
        throw new Error('Rating must be between 1 and 10');
      }

      // Check if user already rated this movie
      const userRatings = this.userRatingsData.get(userId) || [];
      const existingRatingIndex = userRatings.findIndex(r => r.movieId === data.movieId);

      let rating: Rating;

      if (existingRatingIndex !== -1) {
        // Update existing rating
        const existingRating = userRatings[existingRatingIndex];
        existingRating.rating = data.rating;
        existingRating.review = data.review;
        existingRating.updatedAt = new Date();
        rating = existingRating;

        // Update in movie ratings
        const movieRatings = this.ratingsData.get(data.movieId) || [];
        const movieRatingIndex = movieRatings.findIndex(r => r.userId === userId);
        if (movieRatingIndex !== -1) {
          movieRatings[movieRatingIndex] = rating;
        }
      } else {
        // Create new rating
        rating = {
          id: `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          movieId: data.movieId,
          rating: data.rating,
          review: data.review,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: this.getMockUserData(userId),
          movie: this.getMockMovieData(data.movieId),
        };

        // Add to user ratings
        userRatings.push(rating);
        this.userRatingsData.set(userId, userRatings);

        // Add to movie ratings
        const movieRatings = this.ratingsData.get(data.movieId) || [];
        movieRatings.push(rating);
        this.ratingsData.set(data.movieId, movieRatings);
      }

      return rating;
    } catch (error: any) {
      throw new Error(`Failed to create/update rating: ${error.message}`);
    }
  }

  // Update rating
  async updateRating(userId: string, ratingId: string, data: UpdateRatingRequest): Promise<Rating> {
    try {
      const userRatings = this.userRatingsData.get(userId) || [];
      const ratingIndex = userRatings.findIndex(r => r.id === ratingId && r.userId === userId);

      if (ratingIndex === -1) {
        throw new Error('Rating not found');
      }

      const rating = userRatings[ratingIndex];

      if (data.rating !== undefined) {
        if (data.rating < 1 || data.rating > 10) {
          throw new Error('Rating must be between 1 and 10');
        }
        rating.rating = data.rating;
      }

      if (data.review !== undefined) {
        rating.review = data.review;
      }

      rating.updatedAt = new Date();

      // Update in movie ratings
      const movieRatings = this.ratingsData.get(rating.movieId) || [];
      const movieRatingIndex = movieRatings.findIndex(r => r.id === ratingId);
      if (movieRatingIndex !== -1) {
        movieRatings[movieRatingIndex] = rating;
      }

      return rating;
    } catch (error: any) {
      throw new Error(`Failed to update rating: ${error.message}`);
    }
  }

  // Delete rating
  async deleteRating(userId: string, ratingId: string): Promise<boolean> {
    try {
      const userRatings = this.userRatingsData.get(userId) || [];
      const ratingIndex = userRatings.findIndex(r => r.id === ratingId && r.userId === userId);

      if (ratingIndex === -1) {
        throw new Error('Rating not found');
      }

      const rating = userRatings[ratingIndex];

      // Remove from user ratings
      userRatings.splice(ratingIndex, 1);
      this.userRatingsData.set(userId, userRatings);

      // Remove from movie ratings
      const movieRatings = this.ratingsData.get(rating.movieId) || [];
      const movieRatingIndex = movieRatings.findIndex(r => r.id === ratingId);
      if (movieRatingIndex !== -1) {
        movieRatings.splice(movieRatingIndex, 1);
        this.ratingsData.set(rating.movieId, movieRatings);
      }

      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete rating: ${error.message}`);
    }
  }

  // Get movie ratings
  async getMovieRatings(movieId: string, page: number = 1, limit: number = 20): Promise<RatingResponse> {
    try {
      const movieRatings = this.ratingsData.get(movieId) || [];

      // Sort by creation date (newest first)
      movieRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRatings = movieRatings.slice(startIndex, endIndex);

      return {
        items: paginatedRatings,
        pagination: {
          page,
          limit,
          total: movieRatings.length,
          totalPages: Math.ceil(movieRatings.length / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get movie ratings: ${error.message}`);
    }
  }

  // Get user ratings
  async getUserRatings(userId: string, page: number = 1, limit: number = 20): Promise<RatingResponse> {
    try {
      const userRatings = this.userRatingsData.get(userId) || [];

      // Sort by creation date (newest first)
      userRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRatings = userRatings.slice(startIndex, endIndex);

      return {
        items: paginatedRatings,
        pagination: {
          page,
          limit,
          total: userRatings.length,
          totalPages: Math.ceil(userRatings.length / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get user ratings: ${error.message}`);
    }
  }

  // Get user rating for specific movie
  async getUserMovieRating(userId: string, movieId: string): Promise<Rating | null> {
    try {
      const userRatings = this.userRatingsData.get(userId) || [];
      const rating = userRatings.find(r => r.movieId === movieId);
      return rating || null;
    } catch (error: any) {
      throw new Error(`Failed to get user movie rating: ${error.message}`);
    }
  }

  // Get movie rating statistics
  async getMovieRatingStats(movieId: string, userId?: string): Promise<MovieRatingStats> {
    try {
      const movieRatings = this.ratingsData.get(movieId) || [];

      if (movieRatings.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
            6: 0, 7: 0, 8: 0, 9: 0, 10: 0
          },
        };
      }

      // Calculate average rating
      const totalRating = movieRatings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRating / movieRatings.length;

      // Calculate rating distribution
      const ratingDistribution = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        6: 0, 7: 0, 8: 0, 9: 0, 10: 0
      };

      movieRatings.forEach(rating => {
        const ratingKey = Math.floor(rating.rating) as keyof typeof ratingDistribution;
        if (ratingKey >= 1 && ratingKey <= 10) {
          ratingDistribution[ratingKey]++;
        }
      });

      // Get user's rating if provided
      let userRating;
      if (userId) {
        userRating = movieRatings.find(r => r.userId === userId);
      }

      return {
        averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        totalRatings: movieRatings.length,
        ratingDistribution,
        userRating: userRating ? {
          rating: userRating.rating,
          review: userRating.review,
          createdAt: userRating.createdAt,
        } : undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to get movie rating stats: ${error.message}`);
    }
  }

  // Get user rating statistics
  async getUserRatingStats(userId: string): Promise<UserRatingStats> {
    try {
      const userRatings = this.userRatingsData.get(userId) || [];

      if (userRatings.length === 0) {
        return {
          totalRatings: 0,
          averageRating: 0,
          recentRatings: [],
          favoriteGenres: [],
        };
      }

      // Calculate average rating
      const totalRating = userRatings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRating / userRatings.length;

      // Get recent ratings (last 5)
      const recentRatings = userRatings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Mock favorite genres (replace with actual genre analysis)
      const favoriteGenres = [
        { genreId: 28, genreName: 'Action', count: 5, averageRating: 8.2 },
        { genreId: 12, genreName: 'Adventure', count: 3, averageRating: 7.8 },
        { genreId: 35, genreName: 'Comedy', count: 4, averageRating: 7.5 },
      ];

      return {
        totalRatings: userRatings.length,
        averageRating: Math.round(averageRating * 100) / 100,
        recentRatings,
        favoriteGenres,
      };
    } catch (error: any) {
      throw new Error(`Failed to get user rating stats: ${error.message}`);
    }
  }

  // Get top rated movies
  async getTopRatedMovies(limit: number = 10): Promise<any[]> {
    try {
      const allMovieStats = [];

      // Calculate stats for all movies
      for (const [movieId, ratings] of this.ratingsData.entries()) {
        if (ratings.length > 0) {
          const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
          const averageRating = totalRating / ratings.length;

          allMovieStats.push({
            movieId,
            averageRating: Math.round(averageRating * 100) / 100,
            totalRatings: ratings.length,
            movie: this.getMockMovieData(movieId),
          });
        }
      }

      // Sort by average rating (highest first) and limit
      return allMovieStats
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, limit);
    } catch (error: any) {
      throw new Error(`Failed to get top rated movies: ${error.message}`);
    }
  }

  // Mock user data (replace with actual user service)
  private getMockUserData(userId: string) {
    return {
      id: userId,
      fullName: `User ${userId}`,
      profileImage: `/user_${userId}.jpg`,
    };
  }

  // Mock movie data (replace with actual movie service)
  private getMockMovieData(movieId: string) {
    return {
      id: movieId,
      title: `Movie ${movieId}`,
      posterPath: `/poster_${movieId}.jpg`,
      releaseDate: new Date('2023-01-01'),
    };
  }
}

export const ratingService = new RatingService();
