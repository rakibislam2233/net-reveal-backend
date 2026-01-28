import { PrismaClient } from '@prisma/client';
import tmdbService, { TMDBMovie, TMDBGenre } from '../../config/tmdb.config';
import { MovieResponse, MovieQueryParams, MovieListResponse } from '../types/movie.types';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

export class MovieService {
  // Sync movie from TMDB to local database
  async syncMovieFromTMDB(tmdbId: number): Promise<MovieResponse | null> {
    try {
      // Check if movie already exists
      const existingMovie = await prisma.movie.findUnique({
        where: { tmdbId },
        include: { genres: { include: { genre: true } }, videos: true },
      });

      if (existingMovie) {
        return this.formatMovieResponse(existingMovie);
      }

      // Fetch movie from TMDB
      const tmdbMovie = await tmdbService.getMovieDetails(tmdbId);
      
      // Create movie in database
      const movie = await prisma.movie.create({
        data: {
          tmdbId: tmdbMovie.id,
          title: tmdbMovie.title,
          originalTitle: tmdbMovie.original_title,
          overview: tmdbMovie.overview,
          tagline: tmdbMovie.tagline,
          releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
          runtime: tmdbMovie.runtime,
          language: tmdbMovie.original_language,
          originalLanguage: tmdbMovie.original_language,
          voteAverage: tmdbMovie.vote_average,
          voteCount: tmdbMovie.vote_count,
          popularity: tmdbMovie.popularity,
          posterPath: tmdbMovie.poster_path,
          backdropPath: tmdbMovie.backdrop_path,
          adult: tmdbMovie.adult || false,
          genreIds: tmdbMovie.genres?.map(g => g.id) || [],
          status: 'PUBLISHED',
        },
        include: { genres: { include: { genre: true } }, videos: true },
      });

      // Sync genres
      if (tmdbMovie.genres && tmdbMovie.genres.length > 0) {
        await this.syncMovieGenres(movie.id, tmdbMovie.genres);
      }

      // Sync videos
      if (tmdbMovie.videos?.results) {
        await this.syncMovieVideos(movie.id, tmdbMovie.videos.results);
      }

      // Refresh movie with relations
      const refreshedMovie = await prisma.movie.findUnique({
        where: { id: movie.id },
        include: { genres: { include: { genre: true } }, videos: true },
      });

      return refreshedMovie ? this.formatMovieResponse(refreshedMovie) : null;
    } catch (error: any) {
      logger.error('Error syncing movie from TMDB:', error);
      throw new Error(`Failed to sync movie: ${error.message}`);
    }
  }

  // Sync genres for a movie
  private async syncMovieGenres(movieId: string, genres: TMDBGenre[]): Promise<void> {
    try {
      for (const genre of genres) {
        // Ensure genre exists in database
        await prisma.genre.upsert({
          where: { tmdbId: genre.id },
          update: { name: genre.name },
          create: {
            id: genre.id,
            name: genre.name,
            tmdbId: genre.id,
          },
        });

        // Create movie-genre relationship
        await prisma.movieGenre.upsert({
          where: {
            movieId_genreId: {
              movieId,
              genreId: genre.id,
            },
          },
          update: {},
          create: {
            movieId,
            genreId: genre.id,
          },
        });
      }
    } catch (error: any) {
      logger.error('Error syncing movie genres:', error);
    }
  }

  // Sync videos for a movie
  private async syncMovieVideos(movieId: string, videos: any[]): Promise<void> {
    try {
      for (const video of videos) {
        await prisma.video.create({
          data: {
            movieId,
            tmdbId: video.id.toString(),
            iso639_1: video.iso_639_1,
            iso3166_1: video.iso_3166_1,
            name: video.name,
            key: video.key,
            site: video.site,
            size: video.size,
            type: video.type,
            official: video.official,
            publishedAt: video.published_at ? new Date(video.published_at) : null,
          },
        });
      }
    } catch (error: any) {
      logger.error('Error syncing movie videos:', error);
    }
  }

  // Get movies with pagination and filtering
  async getMovies(params: MovieQueryParams): Promise<MovieListResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        genre,
        language,
        year,
        minRating,
        maxRating,
        search,
        sortBy = 'popularity',
        sortOrder = 'desc',
      } = params;

      const skip = (page - 1) * limit;
      const where: any = { status: 'PUBLISHED' };

      // Build filters
      if (genre) {
        where.genreIds = { has: parseInt(genre) };
      }

      if (language) {
        where.originalLanguage = language;
      }

      if (year) {
        where.releaseDate = {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        };
      }

      if (minRating) {
        where.voteAverage = { gte: minRating };
      }

      if (maxRating) {
        where.voteAverage = { ...where.voteAverage, lte: maxRating };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { originalTitle: { contains: search, mode: 'insensitive' } },
          { overview: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Build orderBy
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const [movies, total] = await Promise.all([
        prisma.movie.findMany({
          where,
          include: { genres: { include: { genre: true } }, videos: true },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.movie.count({ where }),
      ]);

      return {
        movies: movies.map(movie => this.formatMovieResponse(movie)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error('Error getting movies:', error);
      throw new Error(`Failed to get movies: ${error.message}`);
    }
  }

  // Get movie by ID
  async getMovieById(id: string): Promise<MovieResponse | null> {
    try {
      const movie = await prisma.movie.findUnique({
        where: { id },
        include: { 
          genres: { include: { genre: true } }, 
          videos: true,
          ratings: {
            include: { user: { select: { fullName: true, profileImage: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      return movie ? this.formatMovieResponse(movie) : null;
    } catch (error: any) {
      logger.error('Error getting movie by ID:', error);
      throw new Error(`Failed to get movie: ${error.message}`);
    }
  }

  // Get movie by TMDB ID
  async getMovieByTMDBId(tmdbId: number): Promise<MovieResponse | null> {
    try {
      const movie = await prisma.movie.findUnique({
        where: { tmdbId },
        include: { genres: { include: { genre: true } }, videos: true },
      });

      if (movie) {
        return this.formatMovieResponse(movie);
      }

      // If not found, sync from TMDB
      return await this.syncMovieFromTMDB(tmdbId);
    } catch (error: any) {
      logger.error('Error getting movie by TMDB ID:', error);
      throw new Error(`Failed to get movie: ${error.message}`);
    }
  }

  // Get trending movies
  async getTrendingMovies(page: number = 1, limit: number = 20): Promise<MovieListResponse> {
    try {
      const tmdbResponse = await tmdbService.getTrendingMovies('week', page);
      
      // Sync movies and get local data
      const movies = await Promise.all(
        tmdbResponse.results.map(async (tmdbMovie) => {
          return await this.getMovieByTMDBId(tmdbMovie.id);
        })
      );

      const validMovies = movies.filter((movie): movie is MovieResponse => movie !== null);

      return {
        movies: validMovies,
        pagination: {
          page,
          limit,
          total: tmdbResponse.total_results,
          totalPages: tmdbResponse.total_pages,
        },
      };
    } catch (error: any) {
      logger.error('Error getting trending movies:', error);
      throw new Error(`Failed to get trending movies: ${error.message}`);
    }
  }

  // Get popular movies
  async getPopularMovies(page: number = 1, limit: number = 20): Promise<MovieListResponse> {
    try {
      const tmdbResponse = await tmdbService.getPopularMovies(page);
      
      const movies = await Promise.all(
        tmdbResponse.results.map(async (tmdbMovie) => {
          return await this.getMovieByTMDBId(tmdbMovie.id);
        })
      );

      const validMovies = movies.filter((movie): movie is MovieResponse => movie !== null);

      return {
        movies: validMovies,
        pagination: {
          page,
          limit,
          total: tmdbResponse.total_results,
          totalPages: tmdbResponse.total_pages,
        },
      };
    } catch (error: any) {
      logger.error('Error getting popular movies:', error);
      throw new Error(`Failed to get popular movies: ${error.message}`);
    }
  }

  // Search movies
  async searchMovies(query: string, page: number = 1, limit: number = 20): Promise<MovieListResponse> {
    try {
      const tmdbResponse = await tmdbService.searchMovies(query, page);
      
      const movies = await Promise.all(
        tmdbResponse.results.map(async (tmdbMovie) => {
          return await this.getMovieByTMDBId(tmdbMovie.id);
        })
      );

      const validMovies = movies.filter((movie): movie is MovieResponse => movie !== null);

      return {
        movies: validMovies,
        pagination: {
          page,
          limit,
          total: tmdbResponse.total_results,
          totalPages: tmdbResponse.total_pages,
        },
      };
    } catch (error: any) {
      logger.error('Error searching movies:', error);
      throw new Error(`Failed to search movies: ${error.message}`);
    }
  }

  // Get movies by genre
  async getMoviesByGenre(genreId: number, page: number = 1, limit: number = 20): Promise<MovieListResponse> {
    try {
      const tmdbResponse = await tmdbService.getMoviesByGenre(genreId, page);
      
      const movies = await Promise.all(
        tmdbResponse.results.map(async (tmdbMovie) => {
          return await this.getMovieByTMDBId(tmdbMovie.id);
        })
      );

      const validMovies = movies.filter((movie): movie is MovieResponse => movie !== null);

      return {
        movies: validMovies,
        pagination: {
          page,
          limit,
          total: tmdbResponse.total_results,
          totalPages: tmdbResponse.total_pages,
        },
      };
    } catch (error: any) {
      logger.error('Error getting movies by genre:', error);
      throw new Error(`Failed to get movies by genre: ${error.message}`);
    }
  }

  // Get all genres
  async getGenres(): Promise<TMDBGenre[]> {
    try {
      const response = await tmdbService.getMovieGenres();
      return response.genres;
    } catch (error: any) {
      logger.error('Error getting genres:', error);
      throw new Error(`Failed to get genres: ${error.message}`);
    }
  }

  // Format movie response
  private formatMovieResponse(movie: any): MovieResponse {
    return {
      id: movie.id,
      tmdbId: movie.tmdbId,
      title: movie.title,
      originalTitle: movie.originalTitle,
      overview: movie.overview,
      tagline: movie.tagline,
      releaseDate: movie.releaseDate,
      runtime: movie.runtime,
      language: movie.language,
      originalLanguage: movie.originalLanguage,
      voteAverage: movie.voteAverage,
      voteCount: movie.voteCount,
      popularity: movie.popularity,
      posterPath: movie.posterPath,
      backdropPath: movie.backdropPath,
      adult: movie.adult,
      genreIds: movie.genreIds,
      status: movie.status,
      featured: movie.featured,
      trendingRank: movie.trendingRank,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
      genres: movie.genres?.map((mg: any) => ({
        id: mg.genre.id,
        name: mg.genre.name,
        tmdbId: mg.genre.tmdbId,
      })),
      videos: movie.videos?.map((video: any) => ({
        id: video.id,
        movieId: video.movieId,
        tmdbId: video.tmdbId,
        iso639_1: video.iso639_1,
        iso3166_1: video.iso3166_1,
        name: video.name,
        key: video.key,
        site: video.site,
        size: video.size,
        type: video.type,
        official: video.official,
        publishedAt: video.publishedAt,
        createdAt: video.createdAt,
      })),
    };
  }
}

export const movieService = new MovieService();
