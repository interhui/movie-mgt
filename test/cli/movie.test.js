/**
 * CLI Movie Commands Tests
 */

const path = require('path');

// Mock console methods
let consoleLogSpy;
let consoleErrorSpy;

beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
});

afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
});

// Test data paths
const TEST_DATA_DIR = path.join(__dirname, 'test-data');
const MOVIES_DIR = path.join(TEST_DATA_DIR, 'movies');

// Mock services - using object with jest.fn() created before jest.mock
const mockMovieService = {
    getAllMovies: jest.fn(),
    getMoviesByCategory: jest.fn(),
    searchMovies: jest.fn(),
    getMovieDetail: jest.fn(),
    addMovie: jest.fn(),
    refreshCache: jest.fn(),
    getStats: jest.fn(),
    isCacheInitialized: jest.fn()
};

const mockFileService = {
    readMovieNfo: jest.fn(),
    writeMovieNfo: jest.fn(),
    deleteDir: jest.fn(),
    fileExists: jest.fn()
};

const mockMovieCacheService = {
    removeMovieFromCache: jest.fn()
};

const mockIndexService = {
    deleteMovieFromIndex: jest.fn()
};

const mockSettingsService = {
    getSettings: jest.fn()
};

const mockCategoryService = {
    loadCategories: jest.fn()
};

// Create mocks and export via global
const mockServiceExports = {
    movieService: mockMovieService,
    fileService: mockFileService,
    movieCacheService: mockMovieCacheService,
    indexService: mockIndexService,
    settingsService: mockSettingsService,
    categoryService: mockCategoryService,
    getMoviesDir: () => MOVIES_DIR,
    getMovieboxDir: () => path.join(TEST_DATA_DIR, 'boxes')
};

// Set up global mock before importing commands
global.__CLI_MOCK_SERVICES__ = mockServiceExports;

// Mock service-loader
jest.mock('../../src/cli/utils/service-loader', () => ({
    initializeServices: jest.fn().mockResolvedValue(global.__CLI_MOCK_SERVICES__)
}));

// Import the commands
const movieCommands = require('../../src/cli/commands/movie');

describe('CLI Movie Commands', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSettingsService.getSettings.mockReturnValue({
            library: { moviesDir: MOVIES_DIR }
        });
    });

    describe('movie list', () => {
        test('CLI-MOVIE-LIST-001: 列出所有电影', async () => {
            const mockMovies = [
                { id: 'movie-test1', name: 'Test Movie 1', category: 'movie', userRating: 5, status: 'unwatched' },
                { id: 'movie-test2', name: 'Test Movie 2', category: 'movie', userRating: 3, status: 'watching' }
            ];
            mockMovieService.getAllMovies.mockResolvedValue(mockMovies);

            const services = {
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.listMovies(services, {});

            expect(mockMovieService.getAllMovies).toHaveBeenCalledWith(MOVIES_DIR, expect.any(Object));
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        test('CLI-MOVIE-LIST-002: 按分类筛选', async () => {
            mockMovieService.getMoviesByCategory.mockResolvedValue([
                { id: 'movie-test1', name: 'Test Movie', category: 'movie', userRating: 5, status: 'unwatched' }
            ]);

            const services = {
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.listMovies(services, { category: 'movie' });

            expect(mockMovieService.getMoviesByCategory).toHaveBeenCalledWith('movie', MOVIES_DIR, expect.any(Object));
        });

        test('CLI-MOVIE-LIST-007: JSON格式输出', async () => {
            const mockMovies = [
                { id: 'movie-test1', name: 'Test Movie', category: 'movie', userRating: 5, status: 'unwatched' }
            ];
            mockMovieService.getAllMovies.mockResolvedValue(mockMovies);

            const services = {
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.listMovies(services, { format: 'json' });

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"id"'));
        });
    });

    describe('movie search', () => {
        test('CLI-MOVIE-SEARCH-001: 关键字搜索', async () => {
            mockMovieService.searchMovies.mockResolvedValue([
                { id: 'movie-test1', name: 'Test Movie', category: 'movie', userRating: 5, status: 'unplayed' }
            ]);

            const services = {
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.searchMovies(services, 'Test', {});

            expect(mockMovieService.searchMovies).toHaveBeenCalledWith('Test', MOVIES_DIR, expect.any(Object));
        });

        test('CLI-MOVIE-SEARCH-004: JSON格式输出', async () => {
            mockMovieService.searchMovies.mockResolvedValue([
                { id: 'movie-test1', name: 'Test Movie', category: 'movie', userRating: 5, status: 'unplayed' }
            ]);

            const services = {
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.searchMovies(services, 'Test', { format: 'json' });

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"id"'));
        });
    });

    describe('movie show', () => {
        test('CLI-MOVIE-SHOW-001: 显示存在的电影', async () => {
            mockMovieService.getMovieDetail.mockResolvedValue({
                id: 'movie-test1',
                name: 'Test Movie',
                category: 'movie',
                userRating: 5,
                status: 'unwatched'
            });

            const services = {
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.showMovie(services, 'movie-test1');

            expect(mockMovieService.getMovieDetail).toHaveBeenCalledWith('movie-test1', MOVIES_DIR);
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        test('CLI-MOVIE-SHOW-002: 显示不存在的电影', async () => {
            mockMovieService.getMovieDetail.mockResolvedValue(null);

            const services = {
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.showMovie(services, 'movie-non-exist');

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('不存在'));
        });

        test('CLI-MOVIE-SHOW-003: 无效ID格式', async () => {
            const services = {
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.showMovie(services, 'invalid');

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('无效'));
        });
    });

    describe('movie add', () => {
        test('CLI-MOVIE-ADD-001: 基本添加', async () => {
            mockMovieService.addMovie.mockResolvedValue({
                success: true,
                movie: {
                    id: 'movie-new-movie',
                    name: 'New Movie',
                    category: 'movie',
                    path: path.join(MOVIES_DIR, 'movie', 'new-movie')
                }
            });

            const services = {
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.addMovie(services, 'New Movie', { category: 'movie' });

            expect(mockMovieService.addMovie).toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('成功'));
        });

        test('CLI-MOVIE-ADD-003: 缺少分类参数', async () => {
            const services = {
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.addMovie(services, 'New Movie', {});

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('缺少'));
        });

        test('CLI-MOVIE-ADD-004: 带标签参数', async () => {
            mockMovieService.addMovie.mockResolvedValue({
                success: true,
                movie: {
                    id: 'movie-new-movie',
                    name: 'New Movie',
                    category: 'movie',
                    tags: ['action', 'comedy'],
                    path: path.join(MOVIES_DIR, 'movie', 'new-movie')
                }
            });

            const services = {
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.addMovie(services, 'New Movie', { category: 'movie', tags: 'action,comedy' });

            expect(mockMovieService.addMovie).toHaveBeenCalled();
        });
    });

    describe('movie edit', () => {
        test('CLI-MOVIE-EDIT-001: 修改名称', async () => {
            mockMovieService.getMovieDetail.mockResolvedValue({
                id: 'movie-test1',
                name: 'Test Movie',
                category: 'movie',
                path: path.join(MOVIES_DIR, 'movie', 'test1', 'movie.nfo')
            });
            mockFileService.readMovieNfo.mockResolvedValue({ name: 'Test Movie' });
            mockFileService.writeMovieNfo.mockResolvedValue();
            mockMovieService.refreshCache.mockResolvedValue();

            const services = {
                movieService: mockMovieService,
                fileService: mockFileService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.editMovie(services, 'movie-test1', { name: 'New Name' });

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已更新'));
        });

        test('CLI-MOVIE-EDIT-005: 修改评分', async () => {
            mockMovieService.getMovieDetail.mockResolvedValue({
                id: 'movie-test1',
                name: 'Test Movie',
                category: 'movie',
                path: path.join(MOVIES_DIR, 'movie', 'test1', 'movie.nfo')
            });
            mockFileService.readMovieNfo.mockResolvedValue({ name: 'Test Movie', userRating: 0 });
            mockFileService.writeMovieNfo.mockResolvedValue();
            mockMovieService.refreshCache.mockResolvedValue();

            const services = {
                movieService: mockMovieService,
                fileService: mockFileService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.editMovie(services, 'movie-test1', { rating: '5' });

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已更新'));
        });

        test('CLI-MOVIE-EDIT-010: 修改不存在的电影', async () => {
            mockMovieService.getMovieDetail.mockResolvedValue(null);

            const services = {
                movieService: mockMovieService,
                fileService: mockFileService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.editMovie(services, 'movie-non-exist', { name: 'New Name' });

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('不存在'));
        });
    });

    describe('movie delete', () => {
        test('CLI-MOVIE-DELETE-001: 删除存在的电影', async () => {
            mockMovieService.getMovieDetail.mockResolvedValue({
                id: 'movie-test1',
                name: 'Test Movie',
                category: 'movie',
                path: path.join(MOVIES_DIR, 'movie', 'test1')
            });
            mockFileService.deleteDir.mockResolvedValue();
            mockMovieService.isCacheInitialized.mockReturnValue(true);
            mockMovieCacheService.removeMovieFromCache.mockReturnValue();
            mockIndexService.deleteMovieFromIndex.mockResolvedValue();

            const services = {
                movieService: mockMovieService,
                fileService: mockFileService,
                movieCacheService: mockMovieCacheService,
                indexService: mockIndexService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.deleteMovie(services, 'movie-test1', {});

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已删除'));
        });

        test('CLI-MOVIE-DELETE-002: 删除不存在的电影', async () => {
            mockMovieService.getMovieDetail.mockResolvedValue(null);

            const services = {
                movieService: mockMovieService,
                fileService: mockFileService,
                movieCacheService: mockMovieCacheService,
                indexService: mockIndexService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.deleteMovie(services, 'movie-non-exist', {});

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('不存在'));
        });

        test('CLI-MOVIE-DELETE-003: 无效ID格式', async () => {
            const services = {
                movieService: mockMovieService,
                fileService: mockFileService,
                movieCacheService: mockMovieCacheService,
                indexService: mockIndexService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.deleteMovie(services, 'invalid', {});

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('无效'));
        });
    });

    describe('movie status', () => {
        test('CLI-MOVIE-STATUS-001: 更新为unwatched', async () => {
            mockMovieService.getMovieDetail.mockResolvedValue({
                id: 'movie-test1',
                name: 'Test Movie',
                category: 'movie',
                path: path.join(MOVIES_DIR, 'movie', 'test1', 'movie.nfo')
            });
            mockFileService.readMovieNfo.mockResolvedValue({ name: 'Test Movie', status: 'watching' });
            mockFileService.writeMovieNfo.mockResolvedValue();
            mockMovieService.refreshCache.mockResolvedValue();

            const services = {
                movieService: mockMovieService,
                fileService: mockFileService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.updateStatus(services, 'movie-test1', 'unwatched');

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已更新'));
        });

        test('CLI-MOVIE-STATUS-004: 无效状态值', async () => {
            const services = {
                movieService: mockMovieService,
                fileService: mockFileService,
                getMoviesDir: () => MOVIES_DIR
            };

            await movieCommands.updateStatus(services, 'movie-test1', 'invalid');

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('无效'));
        });
    });
});
