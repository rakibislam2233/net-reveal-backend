import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = 'b07785a918a90e5816110d5e6e835fd2';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  tagline?: string;
  release_date?: string;
  runtime?: number;
  status?: string;
  original_language?: string;
  spoken_languages?: Array<{
    iso_639_1: string;
    name: string;
  }>;
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
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path?: string;
  }>;
  production_countries?: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  revenue?: number;
  budget?: number;
  imdb_id?: string;
  homepage?: string;
}

export interface TMDBVideo {
  id: string;
  iso_639_1?: string;
  iso_3166_1?: string;
  key: string;
  name: string;
  site: string;
  size?: number;
  type: string;
  official: boolean;
  published_at?: string;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSearchResponse extends TMDBResponse<TMDBMovie> {
  // Additional search-specific properties can be added here
}

class TMDBService {
  private apiKey: string;
  private baseURL: string;
  private imageBaseURL: string;

  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.baseURL = TMDB_BASE_URL;
    this.imageBaseURL = TMDB_IMAGE_BASE_URL;
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await axios.get<T>(`${this.baseURL}${endpoint}`, {
        params: {
          api_key: this.apiKey,
          ...params,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('TMDB API Error:', error.response?.data || error.message);
      throw new Error(`TMDB API Error: ${error.response?.data?.status_message || error.message}`);
    }
  }

  // Movie Methods
  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    return this.request<TMDBMovie>(`/movie/${movieId}`, {
      append_to_response: 'videos,credits,similar,recommendations',
    });
  }

  async getPopularMovies(page: number = 1, language: string = 'en-US'): Promise<TMDBResponse<TMDBMovie>> {
    return this.request<TMDBResponse<TMDBMovie>>('/movie/popular', {
      page,
      language,
    });
  }

  async getTopRatedMovies(page: number = 1, language: string = 'en-US'): Promise<TMDBResponse<TMDBMovie>> {
    return this.request<TMDBResponse<TMDBMovie>>('/movie/top_rated', {
      page,
      language,
    });
  }

  async getUpcomingMovies(page: number = 1, language: string = 'en-US'): Promise<TMDBResponse<TMDBMovie>> {
    return this.request<TMDBResponse<TMDBMovie>>('/movie/upcoming', {
      page,
      language,
    });
  }

  async getNowPlayingMovies(page: number = 1, language: string = 'en-US'): Promise<TMDBResponse<TMDBMovie>> {
    return this.request<TMDBResponse<TMDBMovie>>('/movie/now_playing', {
      page,
      language,
    });
  }

  async searchMovies(query: string, page: number = 1, language: string = 'en-US'): Promise<TMDBSearchResponse> {
    return this.request<TMDBSearchResponse>('/search/movie', {
      query,
      page,
      language,
    });
  }

  async getMoviesByGenre(genreId: number, page: number = 1, language: string = 'en-US'): Promise<TMDBResponse<TMDBMovie>> {
    return this.request<TMDBResponse<TMDBMovie>>('/discover/movie', {
      with_genres: genreId,
      page,
      language,
    });
  }

  async getSimilarMovies(movieId: number, page: number = 1, language: string = 'en-US'): Promise<TMDBResponse<TMDBMovie>> {
    return this.request<TMDBResponse<TMDBMovie>>(`/movie/${movieId}/similar`, {
      page,
      language,
    });
  }

  async getRecommendedMovies(movieId: number, page: number = 1, language: string = 'en-US'): Promise<TMDBResponse<TMDBMovie>> {
    return this.request<TMDBResponse<TMDBMovie>>(`/movie/${movieId}/recommendations`, {
      page,
      language,
    });
  }

  // Video Methods
  async getMovieVideos(movieId: number, language: string = 'en-US'): Promise<{ results: TMDBVideo[] }> {
    return this.request<{ results: TMDBVideo[] }>(`/movie/${movieId}/videos`, {
      language,
    });
  }

  // Genre Methods
  async getMovieGenres(language: string = 'en-US'): Promise<{ genres: TMDBGenre[] }> {
    return this.request<{ genres: TMDBGenre[] }>('/genre/movie/list', {
      language,
    });
  }

  // Trending Methods
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.request<TMDBResponse<TMDBMovie>>('/trending/movie/' + timeWindow, {
      page,
    });
  }

  // Image URL Methods
  getImageURL(path: string, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return '';
    return `${this.imageBaseURL}/${size}${path}`;
  }

  getPosterURL(path: string, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
    return this.getImageURL(path, size);
  }

  getBackdropURL(path: string, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!path) return '';
    return `${this.imageBaseURL}/${size}${path}`;
  }

  // Multi-Search (searches movies, TV shows, and people)
  async multiSearch(query: string, page: number = 1, language: string = 'en-US'): Promise<any> {
    return this.request('/search/multi', {
      query,
      page,
      language,
    });
  }

  // Get movies by year
  async getMoviesByYear(year: number, page: number = 1, language: string = 'en-US'): Promise<TMDBResponse<TMDBMovie>> {
    return this.request<TMDBResponse<TMDBMovie>>('/discover/movie', {
      primary_release_year: year,
      page,
      language,
    });
  }

  // Get movies by rating range
  async getMoviesByRating(minRating: number, maxRating: number = 10, page: number = 1, language: string = 'en-US'): Promise<TMDBResponse<TMDBMovie>> {
    return this.request<TMDBResponse<TMDBMovie>>('/discover/movie', {
      'vote_average.gte': minRating,
      'vote_average.lte': maxRating,
      page,
      language,
    });
  }
}

export const tmdbService = new TMDBService();
export default tmdbService;
