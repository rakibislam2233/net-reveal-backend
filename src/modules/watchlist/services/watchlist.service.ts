import { WatchlistItem, AddToWatchlistRequest, WatchlistResponse, WatchlistStats } from '../types/watchlist.types';

export class WatchlistService {
  // Mock data storage (replace with actual database)
  private watchlistData: Map<string, WatchlistItem[]> = new Map();

  // Add movie to watchlist
  async addToWatchlist(userId: string, data: AddToWatchlistRequest): Promise<WatchlistItem> {
    try {
      // Check if item already exists in the same list
      const userWatchlist = this.watchlistData.get(userId) || [];
      const existingItem = userWatchlist.find(
        item => item.movieId === data.movieId && item.listType === data.listType
      );

      if (existingItem) {
        throw new Error('Movie already exists in this list');
      }

      // Remove from other lists if exists (movie can only be in one list type at a time)
      const filteredList = userWatchlist.filter(
        item => !(item.movieId === data.movieId)
      );

      // Create new watchlist item
      const newItem: WatchlistItem = {
        id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        movieId: data.movieId,
        listType: data.listType,
        createdAt: new Date(),
      };

      // Add to watchlist
      filteredList.push(newItem);
      this.watchlistData.set(userId, filteredList);

      return newItem;
    } catch (error: any) {
      throw new Error(`Failed to add to watchlist: ${error.message}`);
    }
  }

  // Remove movie from watchlist
  async removeFromWatchlist(userId: string, movieId: string, listType?: string): Promise<boolean> {
    try {
      const userWatchlist = this.watchlistData.get(userId) || [];
      
      const filteredList = userWatchlist.filter(item => {
        if (listType) {
          return !(item.movieId === movieId && item.listType === listType);
        }
        return item.movieId !== movieId;
      });

      this.watchlistData.set(userId, filteredList);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to remove from watchlist: ${error.message}`);
    }
  }

  // Get user's watchlist
  async getUserWatchlist(
    userId: string, 
    listType?: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<WatchlistResponse> {
    try {
      const userWatchlist = this.watchlistData.get(userId) || [];
      
      let filteredList = userWatchlist;
      if (listType) {
        filteredList = userWatchlist.filter(item => item.listType === listType);
      }

      // Sort by creation date (newest first)
      filteredList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = filteredList.slice(startIndex, endIndex);

      // Mock movie data (replace with actual movie service calls)
      const itemsWithMovies = paginatedItems.map(item => ({
        ...item,
        movie: this.getMockMovieData(item.movieId),
      }));

      return {
        items: itemsWithMovies,
        pagination: {
          page,
          limit,
          total: filteredList.length,
          totalPages: Math.ceil(filteredList.length / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get watchlist: ${error.message}`);
    }
  }

  // Check if movie is in user's list
  async checkMovieInList(userId: string, movieId: string, listType?: string): Promise<WatchlistItem | null> {
    try {
      const userWatchlist = this.watchlistData.get(userId) || [];
      
      const item = userWatchlist.find(item => {
        if (listType) {
          return item.movieId === movieId && item.listType === listType;
        }
        return item.movieId === movieId;
      });

      return item || null;
    } catch (error: any) {
      throw new Error(`Failed to check movie in list: ${error.message}`);
    }
  }

  // Move movie between lists
  async moveBetweenLists(
    userId: string, 
    movieId: string, 
    fromListType: string, 
    toListType: string
  ): Promise<WatchlistItem> {
    try {
      const userWatchlist = this.watchlistData.get(userId) || [];
      
      // Find and remove from current list
      const itemIndex = userWatchlist.findIndex(
        item => item.movieId === movieId && item.listType === fromListType
      );

      if (itemIndex === -1) {
        throw new Error('Movie not found in the specified list');
      }

      const item = userWatchlist[itemIndex];
      
      // Remove from current position
      userWatchlist.splice(itemIndex, 1);

      // Check if already exists in target list
      const existingInTarget = userWatchlist.find(
        existingItem => existingItem.movieId === movieId && existingItem.listType === toListType
      );

      if (existingInTarget) {
        throw new Error('Movie already exists in the target list');
      }

      // Update and add to new list
      item.listType = toListType as any;
      item.createdAt = new Date();
      userWatchlist.push(item);

      this.watchlistData.set(userId, userWatchlist);
      return { ...item, movie: this.getMockMovieData(item.movieId) };
    } catch (error: any) {
      throw new Error(`Failed to move between lists: ${error.message}`);
    }
  }

  // Get watchlist statistics
  async getWatchlistStats(userId: string): Promise<WatchlistStats> {
    try {
      const userWatchlist = this.watchlistData.get(userId) || [];
      
      const stats: WatchlistStats = {
        totalWatchlist: userWatchlist.filter(item => item.listType === 'WATCHLIST').length,
        totalFavorites: userWatchlist.filter(item => item.listType === 'FAVORITES').length,
        totalWatched: userWatchlist.filter(item => item.listType === 'WATCHED').length,
        totalInterested: userWatchlist.filter(item => item.listType === 'INTERESTED').length,
        recentlyAdded: userWatchlist
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map(item => ({ ...item, movie: this.getMockMovieData(item.movieId) })),
      };

      return stats;
    } catch (error: any) {
      throw new Error(`Failed to get watchlist stats: ${error.message}`);
    }
  }

  // Clear entire watchlist or specific list
  async clearWatchlist(userId: string, listType?: string): Promise<boolean> {
    try {
      if (listType) {
        const userWatchlist = this.watchlistData.get(userId) || [];
        const filteredList = userWatchlist.filter(item => item.listType !== listType);
        this.watchlistData.set(userId, filteredList);
      } else {
        this.watchlistData.set(userId, []);
      }
      return true;
    } catch (error: any) {
      throw new Error(`Failed to clear watchlist: ${error.message}`);
    }
  }

  // Get movies similar to user's watchlist (for recommendations)
  async getSimilarMovies(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const userWatchlist = this.watchlistData.get(userId) || [];
      const favoriteMovies = userWatchlist.filter(item => item.listType === 'FAVORITES');
      
      // Mock similar movies based on favorites (replace with actual recommendation logic)
      const similarMovies = favoriteMovies.slice(0, limit).map(item => ({
        id: `similar_${item.movieId}`,
        title: `Similar to ${item.movieId}`,
        posterPath: '/similar_poster.jpg',
        voteAverage: Math.random() * 2 + 7, // Random rating between 7-9
        reason: 'Because you liked similar movies',
      }));

      return similarMovies;
    } catch (error: any) {
      throw new Error(`Failed to get similar movies: ${error.message}`);
    }
  }

  // Mock movie data (replace with actual movie service integration)
  private getMockMovieData(movieId: string) {
    return {
      id: movieId,
      title: `Movie ${movieId}`,
      posterPath: `/poster_${movieId}.jpg`,
      backdropPath: `/backdrop_${movieId}.jpg`,
      releaseDate: new Date('2023-01-01'),
      voteAverage: Math.random() * 2 + 7,
      runtime: Math.floor(Math.random() * 60) + 90, // 90-150 minutes
      genres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
      ],
    };
  }
}

export const watchlistService = new WatchlistService();
