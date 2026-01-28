export interface MovieResponse {
  id: string;
  tmdbId: number;
  title: string;
  originalTitle?: string;
  overview?: string;
  tagline?: string;
  releaseDate?: Date;
  runtime?: number;
  language?: string;
  originalLanguage?: string;
  voteAverage?: number;
  voteCount?: number;
  popularity?: number;
  posterPath?: string;
  backdropPath?: string;
  adult?: boolean;
  genreIds: number[];
  status: string;
  featured?: boolean;
  trendingRank?: number;
  createdAt: Date;
  updatedAt: Date;
  genres?: GenreResponse[];
  videos?: VideoResponse[];
}

export interface GenreResponse {
  id: number;
  name: string;
  tmdbId: number;
}

export interface VideoResponse {
  id: string;
  movieId: string;
  tmdbId?: string;
  iso639_1?: string;
  iso3166_1?: string;
  name: string;
  key: string;
  site: string;
  size?: number;
  type: string;
  official: boolean;
  publishedAt?: Date;
  createdAt: Date;
}

export interface WatchHistoryResponse {
  id: string;
  userId: string;
  movieId: string;
  watchedMinutes: number;
  totalMinutes: number;
  completed: boolean;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  movie?: MovieResponse;
}

export interface UserListResponse {
  id: string;
  userId: string;
  movieId: string;
  listType: string;
  createdAt: Date;
  movie?: MovieResponse;
}

export interface RatingResponse {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
  movie?: MovieResponse;
}

export interface MovieQueryParams {
  page?: number;
  limit?: number;
  genre?: string;
  language?: string;
  year?: number;
  minRating?: number;
  maxRating?: number;
  search?: string;
  sortBy?: 'popularity' | 'release_date' | 'vote_average' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface MovieListResponse {
  movies: MovieResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  tagline?: string;
  release_date?: string;
  runtime?: number;
  original_language?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  adult?: boolean;
  backdrop_path?: string;
  poster_path?: string;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
      published_at?: string;
    }>;
  };
}
