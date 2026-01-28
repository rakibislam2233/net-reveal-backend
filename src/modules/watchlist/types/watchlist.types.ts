export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: string;
  listType: 'WATCHLIST' | 'FAVORITES' | 'WATCHED' | 'INTERESTED';
  createdAt: Date;
  movie?: {
    id: string;
    title: string;
    posterPath?: string;
    backdropPath?: string;
    releaseDate?: Date;
    voteAverage?: number;
    runtime?: number;
    genres?: Array<{ id: number; name: string }>;
  };
}

export interface AddToWatchlistRequest {
  movieId: string;
  listType: 'WATCHLIST' | 'FAVORITES' | 'WATCHED' | 'INTERESTED';
}

export interface WatchlistResponse {
  items: WatchlistItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WatchlistStats {
  totalWatchlist: number;
  totalFavorites: number;
  totalWatched: number;
  totalInterested: number;
  recentlyAdded: WatchlistItem[];
}
