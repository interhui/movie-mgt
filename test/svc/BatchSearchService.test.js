/**
 * BatchSearchService 单元测试
 */
const BatchSearchService = require('../../src/main/services/BatchSearchService');

jest.mock('fs', () => ({
    promises: {
        mkdir: jest.fn().mockResolvedValue(undefined),
        readFile: jest.fn().mockResolvedValue('<?xml version="1.0"?><movie><title>Test</title></movie>')
    }
}));

jest.mock('fs');
jest.mock('path', () => ({
    join: jest.fn().mockImplementation((...args) => args.join('/'))
}));

describe('BatchSearchService', () => {
    let batchSearchService;
    let mockSettingsService;
    let mockTmdbAdapterService;
    let mockR18AdapterService;
    let mockMovieService;
    let mockFileService;

    beforeEach(() => {
        mockSettingsService = {
            getSettings: jest.fn().mockReturnValue({
                library: { moviesDir: '/test/movies' },
                tmdb: { url: 'api.themoviedb.org', token: 'test-token', language: 'zh-CN' },
                r18: { dbUrl: 'postgresql://localhost:5432/test' }
            }),
            getMoviesDir: jest.fn().mockReturnValue('/test/movies')
        };

        mockTmdbAdapterService = {
            searchMovie: jest.fn(),
            getMovie: jest.fn()
        };

        mockR18AdapterService = {
            searchMovie: jest.fn(),
            getMovie: jest.fn()
        };

        mockMovieService = {
            generateNfoContent: jest.fn().mockReturnValue('<?xml version="1.0"?><movie></movie>')
        };

        mockFileService = {
            writeMovieNfo: jest.fn().mockResolvedValue(undefined),
            readMovieNfo: jest.fn().mockResolvedValue(null),
            generateMovieNfo: jest.fn().mockReturnValue('<?xml version="1.0"?><movie></movie>')
        };

        batchSearchService = new BatchSearchService(
            mockSettingsService,
            mockTmdbAdapterService,
            mockR18AdapterService,
            mockMovieService,
            mockFileService
        );
    });

    describe('getAdapter', () => {
        it('should return TMDB adapter for tmdb type', () => {
            const adapter = batchSearchService.getAdapter('tmdb');
            expect(adapter).toBe(mockTmdbAdapterService);
        });

        it('should return R18 adapter for r18 type', () => {
            const adapter = batchSearchService.getAdapter('r18');
            expect(adapter).toBe(mockR18AdapterService);
        });

        it('should throw error for unknown adapter type', () => {
            expect(() => batchSearchService.getAdapter('unknown')).toThrow('Unknown adapter type: unknown');
        });
    });

    describe('searchMovie', () => {
        it('should search movie successfully with TMDB adapter', async () => {
            mockTmdbAdapterService.searchMovie.mockResolvedValue([
                { search_id: '123', title: 'Test Movie' }
            ]);
            mockTmdbAdapterService.getMovie.mockResolvedValue({
                title: 'Test Movie',
                overview: 'Test overview',
                year: '2023',
                poster_url: 'https://example.com/poster.jpg',
                actors: [{ name: 'Actor 1' }],
                directors: [{ name: 'Director 1' }],
                tags: ['Action'],
                runtime: 120
            });

            const result = await batchSearchService.searchMovie('movie-123', 'Test Movie', 'tmdb');

            expect(result.success).toBe(true);
            expect(result.status).toBe('completed');
            expect(result.result.title).toBe('Test Movie');
        });

        it('should return none status when no search results', async () => {
            mockTmdbAdapterService.searchMovie.mockResolvedValue([]);

            const result = await batchSearchService.searchMovie('movie-123', 'Test Movie', 'tmdb');

            expect(result.success).toBe(false);
            expect(result.status).toBe('none');
        });

        it('should handle search errors', async () => {
            mockTmdbAdapterService.searchMovie.mockRejectedValue(new Error('Network error'));

            const result = await batchSearchService.searchMovie('movie-123', 'Test Movie', 'tmdb');

            expect(result.success).toBe(false);
            expect(result.status).toBe('error');
            expect(result.error).toBe('Network error');
        });
    });

    describe('batchSearchMovies', () => {
        it('should batch search multiple movies', async () => {
            const movies = [
                { id: 'movie-1', name: 'Movie 1' },
                { id: 'movie-2', name: 'Movie 2' }
            ];

            mockTmdbAdapterService.searchMovie.mockResolvedValue([
                { search_id: '1', title: 'Movie 1' }
            ]);
            mockTmdbAdapterService.getMovie.mockResolvedValue({
                title: 'Movie 1',
                overview: 'Overview 1'
            });

            const progressCallback = jest.fn();
            const results = await batchSearchService.batchSearchMovies(movies, 'tmdb', progressCallback);

            expect(results).toHaveLength(2);
            expect(progressCallback).toHaveBeenCalled();
        });

        it('should default to concurrency of 5', async () => {
            const movies = Array.from({ length: 10 }, (_, i) => ({
                id: `movie-${i}`,
                name: `Movie ${i}`
            }));

            mockTmdbAdapterService.searchMovie.mockImplementation(async (keyword) => {
                return [{ search_id: keyword, title: keyword }];
            });
            mockTmdbAdapterService.getMovie.mockResolvedValue({
                title: 'Test',
                overview: 'Overview'
            });

            let maxConcurrent = 0;
            let currentConcurrent = 0;

            const spy = jest.spyOn(batchSearchService, 'searchMovie').mockImplementation(async (...args) => {
                currentConcurrent++;
                maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
                await new Promise(r => setTimeout(r, 50));
                currentConcurrent--;
                return { success: true, status: 'completed', movieId: args[0], result: { title: 'Test' } };
            });

            await batchSearchService.batchSearchMovies(movies, 'tmdb');

            expect(maxConcurrent).toBeLessThanOrEqual(5);
            spy.mockRestore();
        });

        it('should respect custom concurrency parameter', async () => {
            const movies = Array.from({ length: 10 }, (_, i) => ({
                id: `movie-${i}`,
                name: `Movie ${i}`
            }));

            let maxConcurrent = 0;
            let currentConcurrent = 0;

            const spy = jest.spyOn(batchSearchService, 'searchMovie').mockImplementation(async (...args) => {
                currentConcurrent++;
                maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
                await new Promise(r => setTimeout(r, 50));
                currentConcurrent--;
                return { success: true, status: 'completed', movieId: args[0], result: { title: 'Test' } };
            });

            await batchSearchService.batchSearchMovies(movies, 'tmdb', null, 3);

            expect(maxConcurrent).toBeLessThanOrEqual(3);
            spy.mockRestore();
        });

        it('should run faster than serial execution', async () => {
            const movies = Array.from({ length: 6 }, (_, i) => ({
                id: `movie-${i}`,
                name: `Movie ${i}`
            }));

            const spy = jest.spyOn(batchSearchService, 'searchMovie').mockImplementation(async (...args) => {
                await new Promise(r => setTimeout(r, 100));
                return { success: true, status: 'completed', movieId: args[0], result: { title: 'Test' } };
            });

            const start = Date.now();
            await batchSearchService.batchSearchMovies(movies, 'tmdb', null, 5);
            const elapsed = Date.now() - start;

            // 6 movies, 100ms each, 5 concurrent: ~200ms (2 batches)
            // Serial would be 600ms. Assert well under serial time.
            expect(elapsed).toBeLessThan(400);
            spy.mockRestore();
        });

        it('should return results in correct order despite concurrent execution', async () => {
            const movies = Array.from({ length: 8 }, (_, i) => ({
                id: `movie-${i}`,
                name: `Movie ${i}`
            }));

            const spy = jest.spyOn(batchSearchService, 'searchMovie').mockImplementation(async (movieId) => {
                // Vary delay to simulate different response times
                const delay = 50 + Math.random() * 100;
                await new Promise(r => setTimeout(r, delay));
                return {
                    success: true,
                    status: 'completed',
                    movieId: movieId,
                    result: { title: `Result for ${movieId}` }
                };
            });

            const results = await batchSearchService.batchSearchMovies(movies, 'tmdb', null, 5);

            expect(results).toHaveLength(8);
            results.forEach((item, index) => {
                expect(item.movie.id).toBe(`movie-${index}`);
                expect(item.searchResult.result.title).toBe(`Result for movie-${index}`);
            });
            spy.mockRestore();
        });

        it('should handle empty movies array', async () => {
            const results = await batchSearchService.batchSearchMovies([], 'tmdb');
            expect(results).toEqual([]);
        });

        it('should handle single movie', async () => {
            mockTmdbAdapterService.searchMovie.mockResolvedValue([
                { search_id: '1', title: 'Movie 1' }
            ]);
            mockTmdbAdapterService.getMovie.mockResolvedValue({
                title: 'Movie 1',
                overview: 'Overview 1'
            });

            const results = await batchSearchService.batchSearchMovies(
                [{ id: 'movie-1', name: 'Movie 1' }],
                'tmdb'
            );

            expect(results).toHaveLength(1);
            expect(results[0].searchResult.success).toBe(true);
        });

        it('should support cancellation during concurrent search', async () => {
            const movies = Array.from({ length: 20 }, (_, i) => ({
                id: `movie-${i}`,
                name: `Movie ${i}`
            }));

            const spy = jest.spyOn(batchSearchService, 'searchMovie').mockImplementation(async (...args) => {
                await new Promise(r => setTimeout(r, 50));
                return { success: true, status: 'completed', movieId: args[0], result: { title: 'Test' } };
            });

            // Cancel after a short delay
            setTimeout(() => batchSearchService.cancel(), 80);

            const results = await batchSearchService.batchSearchMovies(movies, 'tmdb', null, 5);

            // Should not process all 20 movies
            expect(results.length).toBeLessThan(20);
            spy.mockRestore();
        });

        it('should call progressCallback with searching and completed status', async () => {
            const movies = [
                { id: 'movie-1', name: 'Movie 1' },
                { id: 'movie-2', name: 'Movie 2' }
            ];

            const spy = jest.spyOn(batchSearchService, 'searchMovie').mockImplementation(async (movieId) => {
                return { success: true, status: 'completed', movieId, result: { title: 'Test' } };
            });

            const progressCallback = jest.fn();
            await batchSearchService.batchSearchMovies(movies, 'tmdb', progressCallback, 2);

            const statuses = progressCallback.mock.calls.map(call => call[0].status);
            expect(statuses).toContain('searching');
            expect(statuses).toContain('completed');
            spy.mockRestore();
        });

        it('should handle partial failures without affecting other movies', async () => {
            const movies = Array.from({ length: 5 }, (_, i) => ({
                id: `movie-${i}`,
                name: `Movie ${i}`
            }));

            const spy = jest.spyOn(batchSearchService, 'searchMovie').mockImplementation(async (movieId) => {
                if (movieId === 'movie-2') {
                    return { success: false, status: 'error', movieId, error: 'Network error' };
                }
                return { success: true, status: 'completed', movieId, result: { title: 'Test' } };
            });

            const results = await batchSearchService.batchSearchMovies(movies, 'tmdb', null, 5);

            expect(results).toHaveLength(5);
            const failed = results.find(r => r.movie.id === 'movie-2');
            expect(failed.searchResult.success).toBe(false);
            expect(failed.searchResult.status).toBe('error');

            const succeeded = results.filter(r => r.movie.id !== 'movie-2');
            expect(succeeded).toHaveLength(4);
            succeeded.forEach(r => {
                expect(r.searchResult.success).toBe(true);
            });
            spy.mockRestore();
        });

        it('should use worker count equal to min(concurrency, movies.length)', async () => {
            const movies = [{ id: 'movie-1', name: 'Movie 1' }];

            let maxConcurrent = 0;
            let currentConcurrent = 0;

            const spy = jest.spyOn(batchSearchService, 'searchMovie').mockImplementation(async (...args) => {
                currentConcurrent++;
                maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
                await new Promise(r => setTimeout(r, 50));
                currentConcurrent--;
                return { success: true, status: 'completed', movieId: args[0], result: { title: 'Test' } };
            });

            await batchSearchService.batchSearchMovies(movies, 'tmdb', null, 5);

            // Only 1 movie, so concurrency should be 1
            expect(maxConcurrent).toBe(1);
            spy.mockRestore();
        });
    });

    describe('saveMovieInfo', () => {
        beforeEach(() => {
            const fsSync = require('fs');
            fsSync.existsSync = jest.fn().mockReturnValue(true);
        });

        it('should save movie info successfully with movie path', async () => {
            const movieInfo = { id: 'movie-1', name: 'Test Movie', path: '/test/movies/category1/movie-folder' };
            const searchResult = {
                title: 'Test Movie',
                overview: 'Test overview',
                actors: [{ name: 'Actor 1' }],
                poster_url: null
            };

            mockFileService.readMovieNfo = jest.fn().mockResolvedValue({
                original_filename: 'original-file.mp4',
                fileinfo: { streamdetails: { video: { codec: 'H264' } } }
            });

            const result = await batchSearchService.saveMovieInfo(
                movieInfo,
                searchResult,
                'category1',
                'movie-1'
            );

            expect(result.success).toBe(true);
            expect(mockFileService.writeMovieNfo).toHaveBeenCalled();
        });

        it('should use movie.path when available', async () => {
            const movieInfo = { id: 'movie-1', name: 'Test Movie', path: '/test/movies/custom-folder' };
            const searchResult = {
                title: 'New Title',
                poster_url: null
            };

            mockFileService.readMovieNfo = jest.fn().mockResolvedValue(null);

            await batchSearchService.saveMovieInfo(
                movieInfo,
                searchResult,
                'category1',
                'some-folder'
            );

            const writeCall = mockFileService.writeMovieNfo.mock.calls[0];
            const savedDir = writeCall[0];
            
            expect(savedDir).toBe('/test/movies/custom-folder');
        });

        it('should preserve original_filename and fileinfo from existing NFO', async () => {
            const movieInfo = { id: 'movie-1', name: 'Test Movie', path: '/test/movies/category1/movie-1' };
            const searchResult = {
                title: 'New Title',
                overview: 'New overview',
                actors: [{ name: 'Actor 1' }],
                poster_url: null
            };

            mockFileService.readMovieNfo = jest.fn().mockResolvedValue({
                original_filename: 'original-file.mp4',
                fileinfo: { streamdetails: { video: { codec: 'H264', width: 1920, height: 1080 } } }
            });

            await batchSearchService.saveMovieInfo(
                movieInfo,
                searchResult,
                'category1',
                'movie-1'
            );

            const writeCall = mockFileService.writeMovieNfo.mock.calls[0];
            const savedData = writeCall[1];
            
            expect(savedData.original_filename).toBe('original-file.mp4');
            expect(savedData.fileinfo).toEqual({ streamdetails: { video: { codec: 'H264', width: 1920, height: 1080 } } });
        });

        it('should throw error when movie directory not found', async () => {
            const fsSync = require('fs');
            fsSync.existsSync.mockReturnValue(false);
            
            const movieInfo = { id: 'movie-1', name: 'Test Movie', path: '/test/movies/nonexistent' };
            const searchResult = { title: 'Test Movie', poster_url: null };

            await expect(
                batchSearchService.saveMovieInfo(movieInfo, searchResult, 'category1', 'movie-1')
            ).rejects.toThrow('Movie directory not found');
        });

        it('should handle missing movies directory', async () => {
            mockSettingsService.getSettings.mockReturnValue({
                library: { moviesDir: '' }
            });
            mockSettingsService.getMoviesDir.mockReturnValue('');

            const movieInfo = { id: 'movie-1', name: 'Test Movie' };
            const searchResult = { title: 'Test Movie', poster_url: null };

            await expect(
                batchSearchService.saveMovieInfo(movieInfo, searchResult, 'category1', 'movie-1')
            ).rejects.toThrow('Movies directory not configured');
        });
    });
});