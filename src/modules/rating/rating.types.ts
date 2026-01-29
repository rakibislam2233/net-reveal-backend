export interface Rating {
  id: string;
  userId: string;
  movieId: string;
  rating: number; // 1-10 scale
  review?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    fullName: string;
    profileImage?: string;
  };
  movie?: {
    id: string;
    title: string;
    posterPath?: string;
    releaseDate?: Date;
  };
}

export interface CreateRatingRequest {
  movieId: string;
  rating: number; // 1-10
  review?: string;
}

export interface UpdateRatingRequest {
  rating?: number; // 1-10
  review?: string;
}

export interface RatingResponse {
  items: Rating[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MovieRatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
    9: number;
    10: number;
  };
  userRating?: {
    rating: number;
    review?: string;
    createdAt: Date;
  };
}

export interface UserRatingStats {
  totalRatings: number;
  averageRating: number;
  recentRatings: Rating[];
  favoriteGenres: Array<{
    genreId: number;
    genreName: string;
    count: number;
    averageRating: number;
  }>;
}
