import { WatchHistory, UpdateWatchHistoryRequest, WatchHistoryResponse, WatchHistoryStats, ContinueWatching } from '../types/watch-history.types';

export class WatchHistoryService {
  // Mock data storage (replace with actual database)
  private watchHistoryData: Map<string, WatchHistory[]> = new Map(); // userId -> watch history

  // Update or create watch history entry
  async updateWatchHistory(userId: string, data: UpdateWatchHistoryRequest): Promise<WatchHistory> {
    try {
      const userHistory = this.watchHistoryData.get(userId) || [];
      let historyEntry = userHistory.find(item => item.movieId === data.movieId);

      if (historyEntry) {
        // Update existing entry
        historyEntry.watchedMinutes = Math.max(historyEntry.watchedMinutes, data.watchedMinutes);
        historyEntry.totalMinutes = data.totalMinutes;
        historyEntry.lastWatchedAt = new Date();
        historyEntry.updatedAt = new Date();
        
        if (data.completed !== undefined) {
          historyEntry.completed = data.completed;
        } else {
          // Auto-complete if watched 90% or more
          historyEntry.completed = historyEntry.watchedMinutes >= (data.totalMinutes * 0.9);
        }
      } else {
        // Create new entry
        historyEntry = {
          id: `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          movieId: data.movieId,
          watchedMinutes: data.watchedMinutes,
          totalMinutes: data.totalMinutes,
          completed: data.completed || (data.watchedMinutes >= (data.totalMinutes * 0.9)),
          lastWatchedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          movie: this.getMockMovieData(data.movieId),
        };

        userHistory.push(historyEntry);
        this.watchHistoryData.set(userId, userHistory);
      }

      return historyEntry;
    } catch (error: any) {
      throw new Error(`Failed to update watch history: ${error.message}`);
    }
  }

  // Get user's watch history
  async getWatchHistory(
    userId: string, 
    page: number = 1, 
    limit: number = 20,
    completed?: boolean
  ): Promise<WatchHistoryResponse> {
    try {
      const userHistory = this.watchHistoryData.get(userId) || [];
      
      let filteredHistory = userHistory;
      if (completed !== undefined) {
        filteredHistory = userHistory.filter(item => item.completed === completed);
      }

      // Sort by last watched (most recent first)
      filteredHistory.sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime());

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

      return {
        items: paginatedHistory,
        pagination: {
          page,
          limit,
          total: filteredHistory.length,
          totalPages: Math.ceil(filteredHistory.length / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get watch history: ${error.message}`);
    }
  }

  // Get continue watching list
  async getContinueWatching(userId: string, limit: number = 10): Promise<ContinueWatching[]> {
    try {
      const userHistory = this.watchHistoryData.get(userId) || [];
      
      // Filter for partially watched movies (watched between 5% and 90%)
      const partiallyWatched = userHistory
        .filter(item => {
          const progress = (item.watchedMinutes / item.totalMinutes) * 100;
          return progress >= 5 && progress < 90 && !item.completed;
        })
        .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
        .slice(0, limit);

      return partiallyWatched.map(item => ({
        id: item.id,
        movieId: item.movieId,
        watchedMinutes: item.watchedMinutes,
        totalMinutes: item.totalMinutes,
        progressPercentage: Math.round((item.watchedMinutes / item.totalMinutes) * 100),
        lastWatchedAt: item.lastWatchedAt,
        movie: item.movie || this.getMockMovieData(item.movieId),
      }));
    } catch (error: any) {
      throw new Error(`Failed to get continue watching: ${error.message}`);
    }
  }

  // Get watch history statistics
  async getWatchHistoryStats(userId: string): Promise<WatchHistoryStats> {
    try {
      const userHistory = this.watchHistoryData.get(userId) || [];
      
      if (userHistory.length === 0) {
        return {
          totalWatchTime: 0,
          totalMoviesWatched: 0,
          completedMovies: 0,
          averageWatchTime: 0,
          mostWatchedGenres: [],
          recentlyWatched: [],
          watchStreak: 0,
          thisWeekWatchTime: 0,
          thisMonthWatchTime: 0,
        };
      }

      // Calculate basic stats
      const totalWatchTime = userHistory.reduce((sum, item) => sum + item.watchedMinutes, 0);
      const completedMovies = userHistory.filter(item => item.completed).length;
      const averageWatchTime = totalWatchTime / userHistory.length;

      // Get recently watched (last 5)
      const recentlyWatched = userHistory
        .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
        .slice(0, 5);

      // Calculate weekly and monthly watch time
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const thisWeekWatchTime = userHistory
        .filter(item => new Date(item.lastWatchedAt) >= weekAgo)
        .reduce((sum, item) => sum + item.watchedMinutes, 0);

      const thisMonthWatchTime = userHistory
        .filter(item => new Date(item.lastWatchedAt) >= monthAgo)
        .reduce((sum, item) => sum + item.watchedMinutes, 0);

      // Mock most watched genres (replace with actual genre analysis)
      const mostWatchedGenres = [
        { genreId: 28, genreName: 'Action', totalMinutes: 300, movieCount: 5 },
        { genreId: 12, genreName: 'Adventure', totalMinutes: 240, movieCount: 3 },
        { genreId: 35, genreName: 'Comedy', totalMinutes: 180, movieCount: 4 },
      ];

      // Calculate watch streak (mock implementation)
      const watchStreak = this.calculateWatchStreak(userHistory);

      return {
        totalWatchTime,
        totalMoviesWatched: userHistory.length,
        completedMovies,
        averageWatchTime: Math.round(averageWatchTime),
        mostWatchedGenres,
        recentlyWatched,
        watchStreak,
        thisWeekWatchTime,
        thisMonthWatchTime,
      };
    } catch (error: any) {
      throw new Error(`Failed to get watch history stats: ${error.message}`);
    }
  }

  // Delete watch history entry
  async deleteWatchHistory(userId: string, movieId: string): Promise<boolean> {
    try {
      const userHistory = this.watchHistoryData.get(userId) || [];
      const filteredHistory = userHistory.filter(item => item.movieId !== movieId);
      
      this.watchHistoryData.set(userId, filteredHistory);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete watch history: ${error.message}`);
    }
  }

  // Clear all watch history
  async clearWatchHistory(userId: string): Promise<boolean> {
    try {
      this.watchHistoryData.set(userId, []);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to clear watch history: ${error.message}`);
    }
  }

  // Mark movie as completed
  async markAsCompleted(userId: string, movieId: string): Promise<WatchHistory> {
    try {
      const userHistory = this.watchHistoryData.get(userId) || [];
      let historyEntry = userHistory.find(item => item.movieId === movieId);

      if (!historyEntry) {
        throw new Error('Watch history entry not found');
      }

      historyEntry.completed = true;
      historyEntry.watchedMinutes = historyEntry.totalMinutes; // Mark as fully watched
      historyEntry.lastWatchedAt = new Date();
      historyEntry.updatedAt = new Date();

      return historyEntry;
    } catch (error: any) {
      throw new Error(`Failed to mark as completed: ${error.message}`);
    }
  }

  // Get watch history for specific movie
  async getMovieWatchHistory(userId: string, movieId: string): Promise<WatchHistory | null> {
    try {
      const userHistory = this.watchHistoryData.get(userId) || [];
      const historyEntry = userHistory.find(item => item.movieId === movieId);
      return historyEntry || null;
    } catch (error: any) {
      throw new Error(`Failed to get movie watch history: ${error.message}`);
    }
  }

  // Get watching trends (for analytics)
  async getWatchingTrends(userId: string, days: number = 30): Promise<any> {
    try {
      const userHistory = this.watchHistoryData.get(userId) || [];
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const recentHistory = userHistory.filter(item => new Date(item.lastWatchedAt) >= cutoffDate);
      
      // Group by date
      const dailyWatchTime: Record<string, number> = {};
      
      recentHistory.forEach(item => {
        const dateKey = new Date(item.lastWatchedAt).toISOString().split('T')[0];
        dailyWatchTime[dateKey] = (dailyWatchTime[dateKey] || 0) + item.watchedMinutes;
      });

      // Generate trend data
      const trends = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        
        trends.push({
          date: dateKey,
          watchTime: dailyWatchTime[dateKey] || 0,
          moviesWatched: recentHistory.filter(item => 
            new Date(item.lastWatchedAt).toISOString().split('T')[0] === dateKey
          ).length,
        });
      }

      return trends;
    } catch (error: any) {
      throw new Error(`Failed to get watching trends: ${error.message}`);
    }
  }

  // Helper method to calculate watch streak
  private calculateWatchStreak(watchHistory: WatchHistory[]): number {
    // Mock implementation - replace with actual streak calculation logic
    const uniqueDates = new Set(
      watchHistory.map(item => new Date(item.lastWatchedAt).toISOString().split('T')[0])
    );
    
    if (uniqueDates.size === 0) return 0;
    
    // Simple streak calculation (consecutive days)
    const sortedDates = Array.from(uniqueDates).sort().reverse();
    let streak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i - 1]);
      const previousDate = new Date(sortedDates[i]);
      const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Mock movie data (replace with actual movie service)
  private getMockMovieData(movieId: string) {
    return {
      id: movieId,
      title: `Movie ${movieId}`,
      posterPath: `/poster_${movieId}.jpg`,
      backdropPath: `/backdrop_${movieId}.jpg`,
      runtime: Math.floor(Math.random() * 60) + 90, // 90-150 minutes
      voteAverage: Math.random() * 2 + 7,
    };
  }
}

export const watchHistoryService = new WatchHistoryService();
