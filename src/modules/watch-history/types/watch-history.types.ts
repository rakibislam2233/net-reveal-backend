export interface WatchHistory {
  id: string;
  userId: string;
  movieId: string;
  watchedMinutes: number;
  totalMinutes: number;
  completed: boolean;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  movie?: {
    id: string;
    title: string;
    posterPath?: string;
    backdropPath?: string;
    releaseDate?: Date;
    runtime?: number;
    voteAverage?: number;
  };
}

export interface UpdateWatchHistoryRequest {
  movieId: string;
  watchedMinutes: number;
  totalMinutes: number;
  completed?: boolean;
}

export interface WatchHistoryResponse {
  items: WatchHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WatchHistoryStats {
  totalWatchTime: number; // in minutes
  totalMoviesWatched: number;
  completedMovies: number;
  averageWatchTime: number; // in minutes
  mostWatchedGenres: Array<{
    genreId: number;
    genreName: string;
    totalMinutes: number;
    movieCount: number;
  }>;
  recentlyWatched: WatchHistory[];
  watchStreak: number; // consecutive days
  thisWeekWatchTime: number; // minutes watched this week
  thisMonthWatchTime: number; // minutes watched this month
}

export interface ContinueWatching {
  id: string;
  movieId: string;
  watchedMinutes: number;
  totalMinutes: number;
  progressPercentage: number;
  lastWatchedAt: Date;
  movie: {
    id: string;
    title: string;
    posterPath?: string;
    backdropPath?: string;
    runtime?: number;
  };
}
