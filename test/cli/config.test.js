/**
 * CLI Config Commands Tests
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

const testDataDir = path.join(__dirname, 'test-data');

// Mock services
const mockSettingsService = {
    getSettings: jest.fn(),
    saveSettings: jest.fn(),
    resetToDefaults: jest.fn()
};

jest.mock('../../src/cli/utils/service-loader', () => ({
    initializeServices: jest.fn().mockResolvedValue({
        settingsService: mockSettingsService
    })
}));

const configCommands = require('../../src/cli/commands/config');

describe('CLI Config Commands', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('config show', () => {
        test('CLI-CONFIG-SHOW-001: 显示当前配置', async () => {
            mockSettingsService.getSettings.mockReturnValue({
                library: { moviesDir: '/path/to/movies' },
                moviebox: { movieboxDir: '/path/to/boxes' },
                appearance: { theme: 'dark', language: 'zh-CN' }
            });

            const services = {
                settingsService: mockSettingsService
            };

            await configCommands.showConfig(services, {});

            expect(consoleLogSpy).toHaveBeenCalled();
        });

        test('CLI-CONFIG-SHOW-002: JSON格式输出', async () => {
            mockSettingsService.getSettings.mockReturnValue({
                library: { moviesDir: '/path/to/movies' },
                appearance: { theme: 'dark' }
            });

            const services = {
                settingsService: mockSettingsService
            };

            await configCommands.showConfig(services, { format: 'json' });

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"library"'));
        });
    });

    describe('config get', () => {
        test('CLI-CONFIG-GET-001: 获取moviesDir', async () => {
            mockSettingsService.getSettings.mockReturnValue({
                library: { moviesDir: '/path/to/movies' }
            });

            const services = {
                settingsService: mockSettingsService
            };

            await configCommands.getConfig(services, 'moviesDir');

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('/path/to/movies'));
        });

        test('CLI-CONFIG-GET-002: 获取theme', async () => {
            mockSettingsService.getSettings.mockReturnValue({
                appearance: { theme: 'dark' }
            });

            const services = {
                settingsService: mockSettingsService
            };

            await configCommands.getConfig(services, 'theme');

            expect(consoleLogSpy).toHaveBeenCalledWith('dark');
        });

        test('CLI-CONFIG-GET-003: 获取不存在的键', async () => {
            mockSettingsService.getSettings.mockReturnValue({
                appearance: { theme: 'dark' }
            });

            const services = {
                settingsService: mockSettingsService
            };

            await configCommands.getConfig(services, 'nonExist');

            expect(consoleLogSpy).toHaveBeenCalledWith('');
        });
    });

    describe('config set', () => {
        test('CLI-CONFIG-SET-001: 设置theme', async () => {
            mockSettingsService.getSettings.mockReturnValue({
                appearance: { theme: 'dark' }
            });
            mockSettingsService.saveSettings.mockReturnValue();

            const services = {
                settingsService: mockSettingsService
            };

            await configCommands.setConfig(services, 'theme', 'light');

            expect(mockSettingsService.saveSettings).toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已更新'));
        });

        test('CLI-CONFIG-SET-002: 设置moviesDir', async () => {
            mockSettingsService.getSettings.mockReturnValue({
                library: { moviesDir: '/old/path' }
            });
            mockSettingsService.saveSettings.mockReturnValue();

            const services = {
                settingsService: mockSettingsService
            };

            await configCommands.setConfig(services, 'moviesDir', '/new/path');

            expect(mockSettingsService.saveSettings).toHaveBeenCalled();
        });

        test('CLI-CONFIG-SET-003: 设置language', async () => {
            mockSettingsService.getSettings.mockReturnValue({
                appearance: { language: 'zh-CN' }
            });
            mockSettingsService.saveSettings.mockReturnValue();

            const services = {
                settingsService: mockSettingsService
            };

            await configCommands.setConfig(services, 'language', 'en-US');

            expect(mockSettingsService.saveSettings).toHaveBeenCalled();
        });
    });

    describe('config reset', () => {
        test('CLI-CONFIG-RESET-001: 重置配置', async () => {
            mockSettingsService.resetToDefaults.mockReturnValue();

            const services = {
                settingsService: mockSettingsService
            };

            await configCommands.resetConfig(services);

            expect(mockSettingsService.resetToDefaults).toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已重置'));
        });
    });
});
