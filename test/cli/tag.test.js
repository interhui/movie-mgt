/**
 * CLI Tag Commands Tests
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

// Mock services
const mockTagService = {
    loadTags: jest.fn(),
    saveTags: jest.fn()
};

const mockMovieService = {
    searchMovies: jest.fn()
};

const mockServiceExports = {
    tagService: mockTagService,
    movieService: mockMovieService,
    getMoviesDir: () => MOVIES_DIR
};

global.__CLI_MOCK_SERVICES__ = mockServiceExports;

jest.mock('../../src/cli/utils/service-loader', () => ({
    initializeServices: jest.fn().mockResolvedValue(global.__CLI_MOCK_SERVICES__)
}));

const tagCommands = require('../../src/cli/commands/tag');

describe('CLI Tag Commands', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('tag list', () => {
        test('CLI-TAG-LIST-001: 列出所有标签', async () => {
            mockTagService.loadTags.mockResolvedValue([
                { id: 'action', name: '动作' },
                { id: 'comedy', name: '喜剧' }
            ]);
            mockMovieService.searchMovies.mockResolvedValue([{ id: 'movie-test1' }]);

            const services = {
                tagService: mockTagService,
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await tagCommands.listTags(services, {});

            expect(mockTagService.loadTags).toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        test('CLI-TAG-LIST-002: JSON格式输出', async () => {
            mockTagService.loadTags.mockResolvedValue([
                { id: 'action', name: '动作', movieCount: 1 }
            ]);
            mockMovieService.searchMovies.mockResolvedValue([{ id: 'movie-test1' }]);

            const services = {
                tagService: mockTagService,
                movieService: mockMovieService,
                getMoviesDir: () => MOVIES_DIR
            };

            await tagCommands.listTags(services, { format: 'json' });

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"id"'));
        });
    });

    describe('tag create', () => {
        test('CLI-TAG-CREATE-001: 创建新标签', async () => {
            mockTagService.loadTags.mockResolvedValue([
                { id: 'action', name: '动作' }
            ]);
            mockTagService.saveTags.mockResolvedValue();

            const services = {
                tagService: mockTagService
            };

            await tagCommands.createTag(services, 'newtag', '新标签');

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('成功'));
        });

        test('CLI-TAG-CREATE-002: 创建已存在的标签', async () => {
            mockTagService.loadTags.mockResolvedValue([
                { id: 'action', name: '动作' }
            ]);

            const services = {
                tagService: mockTagService
            };

            await tagCommands.createTag(services, 'action', '动作');

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('已存在'));
        });
    });

    describe('tag delete', () => {
        test('CLI-TAG-DELETE-001: 删除存在的标签', async () => {
            mockTagService.loadTags.mockResolvedValue([
                { id: 'action', name: '动作' },
                { id: 'comedy', name: '喜剧' }
            ]);
            mockTagService.saveTags.mockResolvedValue();

            const services = {
                tagService: mockTagService
            };

            await tagCommands.deleteTag(services, 'action');

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已删除'));
        });

        test('CLI-TAG-DELETE-002: 删除不存在的标签', async () => {
            mockTagService.loadTags.mockResolvedValue([
                { id: 'action', name: '动作' }
            ]);

            const services = {
                tagService: mockTagService
            };

            await tagCommands.deleteTag(services, 'non-exist');

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('不存在'));
        });
    });
});
