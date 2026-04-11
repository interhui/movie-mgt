/**
 * CLI Box Commands Tests
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
const BOXES_DIR = path.join(TEST_DATA_DIR, 'boxes');

// Mock services
const mockBoxService = {
    getAllBoxes: jest.fn(),
    getBoxDetail: jest.fn(),
    createBox: jest.fn(),
    updateBox: jest.fn(),
    deleteBox: jest.fn(),
    addMovieToBox: jest.fn(),
    removeMovieFromBox: jest.fn()
};

const mockMovieService = {
    getMovieDetail: jest.fn()
};

const mockFileService = {
    readMovieNfo: jest.fn()
};

const mockServiceExports = {
    boxService: mockBoxService,
    movieService: mockMovieService,
    fileService: mockFileService,
    getMoviesDir: () => MOVIES_DIR,
    getMovieboxDir: () => BOXES_DIR
};

global.__CLI_MOCK_SERVICES__ = mockServiceExports;

jest.mock('../../src/cli/utils/service-loader', () => ({
    initializeServices: jest.fn().mockResolvedValue(global.__CLI_MOCK_SERVICES__)
}));

const boxCommands = require('../../src/cli/commands/box');

describe('CLI Box Commands', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('box list', () => {
        test('CLI-BOX-LIST-001: 列出所有盒子', async () => {
            mockBoxService.getAllBoxes.mockResolvedValue([
                { name: 'Test Box', description: 'Test', movieCount: 2, categories: ['movie'] }
            ]);

            const services = {
                boxService: mockBoxService,
                getMovieboxDir: () => BOXES_DIR
            };

            await boxCommands.listBoxes(services, {});

            expect(mockBoxService.getAllBoxes).toHaveBeenCalledWith(BOXES_DIR);
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        test('CLI-BOX-LIST-002: JSON格式输出', async () => {
            mockBoxService.getAllBoxes.mockResolvedValue([
                { name: 'Test Box', description: 'Test', movieCount: 2, categories: ['movie'] }
            ]);

            const services = {
                boxService: mockBoxService,
                getMovieboxDir: () => BOXES_DIR
            };

            await boxCommands.listBoxes(services, { format: 'json' });

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"name"'));
        });
    });

    describe('box show', () => {
        test('CLI-BOX-SHOW-001: 显示存在的盒子', async () => {
            mockBoxService.getBoxDetail.mockResolvedValue({
                name: 'Test Box',
                description: 'Test Description',
                movieCount: 1,
                categories: ['movie'],
                data: {
                    movie: [{ id: 'movie-test1' }]
                }
            });
            mockMovieService.getMovieDetail.mockResolvedValue({
                id: 'movie-test1',
                name: 'Test Movie',
                category: 'movie',
                userRating: 5,
                status: 'unplayed'
            });

            const services = {
                boxService: mockBoxService,
                movieService: mockMovieService,
                getMovieboxDir: () => BOXES_DIR,
                getMoviesDir: () => MOVIES_DIR
            };

            await boxCommands.showBox(services, 'Test Box', {});

            expect(consoleLogSpy).toHaveBeenCalled();
        });

        test('CLI-BOX-SHOW-002: 显示不存在的盒子', async () => {
            mockBoxService.getBoxDetail.mockResolvedValue(null);

            const services = {
                boxService: mockBoxService,
                movieService: mockMovieService,
                getMovieboxDir: () => BOXES_DIR,
                getMoviesDir: () => MOVIES_DIR
            };

            await boxCommands.showBox(services, 'NonExist', {});

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('不存在'));
        });
    });

    describe('box create', () => {
        test('CLI-BOX-CREATE-001: 基本创建', async () => {
            mockBoxService.createBox.mockResolvedValue({ success: true });

            const services = {
                boxService: mockBoxService,
                getMovieboxDir: () => BOXES_DIR
            };

            await boxCommands.createBox(services, 'New Box', {});

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('成功'));
        });

        test('CLI-BOX-CREATE-002: 带描述创建', async () => {
            mockBoxService.createBox.mockResolvedValue({ success: true });

            const services = {
                boxService: mockBoxService,
                getMovieboxDir: () => BOXES_DIR
            };

            await boxCommands.createBox(services, 'New Box', { description: 'Test description' });

            expect(mockBoxService.createBox).toHaveBeenCalled();
        });

        test('CLI-BOX-CREATE-003: 创建已存在盒子', async () => {
            mockBoxService.createBox.mockRejectedValue(new Error('盒子已存在'));

            const services = {
                boxService: mockBoxService,
                getMovieboxDir: () => BOXES_DIR
            };

            try {
                await boxCommands.createBox(services, 'Existing Box', {});
            } catch (e) {
                // Expected error
            }

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('已存在'));
        });
    });

    describe('box edit', () => {
        test('CLI-BOX-EDIT-001: 修改名称', async () => {
            mockBoxService.updateBox.mockResolvedValue();

            const services = {
                boxService: mockBoxService,
                getMovieboxDir: () => BOXES_DIR
            };

            await boxCommands.updateBox(services, 'Old Name', { name: 'New Name' });

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已更新'));
        });

        test('CLI-BOX-EDIT-003: 修改不存在的盒子', async () => {
            mockBoxService.updateBox.mockRejectedValue(new Error('盒子不存在'));

            const services = {
                boxService: mockBoxService,
                getMovieboxDir: () => BOXES_DIR
            };

            try {
                await boxCommands.updateBox(services, 'NonExist', { name: 'New Name' });
            } catch (e) {
                // Expected error
            }

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('不存在'));
        });
    });

    describe('box delete', () => {
        test('CLI-BOX-DELETE-001: 删除存在的盒子', async () => {
            mockBoxService.deleteBox.mockResolvedValue();

            const services = {
                boxService: mockBoxService,
                getMovieboxDir: () => BOXES_DIR
            };

            await boxCommands.deleteBox(services, 'Test Box', {});

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已删除'));
        });

        test('CLI-BOX-DELETE-002: 删除不存在的盒子', async () => {
            mockBoxService.deleteBox.mockRejectedValue(new Error('盒子不存在'));

            const services = {
                boxService: mockBoxService,
                getMovieboxDir: () => BOXES_DIR
            };

            try {
                await boxCommands.deleteBox(services, 'NonExist', {});
            } catch (e) {
                // Expected error
            }

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('不存在'));
        });
    });

    describe('box add', () => {
        test('CLI-BOX-ADD-001: 添加电影到盒子', async () => {
            mockMovieService.getMovieDetail.mockResolvedValue({
                id: 'movie-test1',
                name: 'Test Movie',
                category: 'movie',
                status: 'unplayed',
                playCount: 0,
                totalPlayTime: 0
            });
            mockBoxService.addMovieToBox.mockResolvedValue();

            const services = {
                boxService: mockBoxService,
                movieService: mockMovieService,
                getMovieboxDir: () => BOXES_DIR,
                getMoviesDir: () => MOVIES_DIR
            };

            await boxCommands.addMovieToBox(services, 'Test Box', 'movie-test1');

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已添加'));
        });

        test('CLI-BOX-ADD-002: 添加不存在的电影', async () => {
            mockMovieService.getMovieDetail.mockResolvedValue(null);

            const services = {
                boxService: mockBoxService,
                movieService: mockMovieService,
                getMovieboxDir: () => BOXES_DIR,
                getMoviesDir: () => MOVIES_DIR
            };

            await boxCommands.addMovieToBox(services, 'Test Box', 'movie-non-exist');

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('不存在'));
        });
    });

    describe('box remove', () => {
        test('CLI-BOX-REMOVE-001: 从盒子移除电影', async () => {
            mockBoxService.getBoxDetail.mockResolvedValue({
                name: 'Test Box',
                data: {
                    movie: [{ id: 'movie-test1' }]
                }
            });
            mockBoxService.removeMovieFromBox.mockResolvedValue();

            const services = {
                boxService: mockBoxService,
                getMovieboxDir: () => BOXES_DIR
            };

            await boxCommands.removeMovieFromBox(services, 'Test Box', 'movie-test1');

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已从盒子移除'));
        });

        test('CLI-BOX-REMOVE-002: 移除不在盒子中的电影', async () => {
            mockBoxService.getBoxDetail.mockResolvedValue({
                name: 'Test Box',
                data: {
                    movie: [{ id: 'movie-other' }]
                }
            });

            const services = {
                boxService: mockBoxService,
                getMovieboxDir: () => BOXES_DIR
            };

            await boxCommands.removeMovieFromBox(services, 'Test Box', 'movie-test1');

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('不在盒子中'));
        });
    });
});
