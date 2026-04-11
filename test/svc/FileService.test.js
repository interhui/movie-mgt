/**
 * FileService 单元测试
 */
const FileService = require('../../src/main/services/FileService');
const path = require('path');
const fs = require('fs');

describe('FileService', () => {
    let service;
    let testDataDir;

    beforeEach(() => {
        service = new FileService();
        testDataDir = path.join(__dirname, 'test-data', 'fileservice');
        if (!fs.existsSync(testDataDir)) {
            fs.mkdirSync(testDataDir, { recursive: true });
        }
    });

    afterEach(() => {
        // Clean up test files
        if (fs.existsSync(testDataDir)) {
            fs.rmSync(testDataDir, { recursive: true, force: true });
        }
    });

    describe('constructor', () => {
        test('SVC-FILE-001: 创建实例', () => {
            expect(service).toBeDefined();
            expect(service.baseDir).toBeDefined();
        });
    });

    describe('fileExists', () => {
        test('SVC-FILE-002: 文件存在返回true', async () => {
            const testFile = path.join(testDataDir, 'exists.txt');
            fs.writeFileSync(testFile, 'test content');
            const result = await service.fileExists(testFile);
            expect(result).toBe(true);
        });

        test('SVC-FILE-003: 文件不存在返回false', async () => {
            const result = await service.fileExists(path.join(testDataDir, 'notexists.txt'));
            expect(result).toBe(false);
        });
    });

    describe('fileExistsSync', () => {
        test('SVC-FILE-004: 存在返回true', () => {
            const testFile = path.join(testDataDir, 'syncexists.txt');
            fs.writeFileSync(testFile, 'test');
            expect(service.fileExistsSync(testFile)).toBe(true);
        });

        test('SVC-FILE-005: 不存在返回false', () => {
            expect(service.fileExistsSync(path.join(testDataDir, 'notexists.txt'))).toBe(false);
        });
    });

    describe('getSimulatorFolders', () => {
        test('SVC-FILE-006: 返回文件夹列表', async () => {
            fs.mkdirSync(path.join(testDataDir, 'folder1'));
            fs.mkdirSync(path.join(testDataDir, 'folder2'));
            const result = await service.getSimulatorFolders(testDataDir);
            expect(result).toContain('folder1');
            expect(result).toContain('folder2');
        });

        test('SVC-FILE-007: 目录不存在返回空', async () => {
            const result = await service.getSimulatorFolders(path.join(testDataDir, 'notexists'));
            expect(result).toEqual([]);
        });
    });

    describe('getMovieFolders', () => {
        test('SVC-FILE-008: 返回电影文件夹映射', async () => {
            const movieDir = path.join(testDataDir, 'movie1');
            fs.mkdirSync(movieDir);
            const result = await service.getMovieFolders(testDataDir);
            expect(result).toHaveProperty('movie1');
            expect(result.movie1).toBe(movieDir);
        });

        test('SVC-FILE-009: 目录不存在返回空对象', async () => {
            const result = await service.getMovieFolders(path.join(testDataDir, 'notexists'));
            expect(result).toEqual({});
        });
    });

    describe('readMovieNfo', () => {
        test('SVC-FILE-010: 正确读取NFO', async () => {
            const movieDir = path.join(testDataDir, 'TestMovie');
            fs.mkdirSync(movieDir);
            const nfoContent = `<?xml version="1.0" encoding="UTF-8"?>
<movie>
    <id>test-id</id>
    <title>Test Movie</title>
    <year>2024</year>
    <outline>Test outline</outline>
    <director>Test Director</director>
    <actor><name>Actor 1</name></actor>
    <actor><name>Actor 2</name></actor>
    <tag>action</tag>
    <tag>drama</tag>
    <favorite>true</favorite>
    <userRating>5</userRating>
</movie>`;
            fs.writeFileSync(path.join(movieDir, 'movie.nfo'), nfoContent);
            const result = await service.readMovieNfo(movieDir);
            expect(result.id).toBe('test-id');
            expect(result.title).toBe('Test Movie');
            expect(result.year).toBe('2024');
        });

        test('SVC-FILE-011: 文件不存在返回null', async () => {
            const result = await service.readMovieNfo(path.join(testDataDir, 'notexists'));
            expect(result).toBeNull();
        });
    });

    describe('writeMovieNfo', () => {
        test('SVC-FILE-012: 正确写入NFO文件', async () => {
            const movieDir = path.join(testDataDir, 'WriteTest');
            fs.mkdirSync(movieDir);
            const movieData = {
                id: 'write-test',
                title: 'Write Test Movie',
                year: '2024'
            };
            await service.writeMovieNfo(movieDir, movieData);
            const nfoPath = path.join(movieDir, 'movie.nfo');
            expect(fs.existsSync(nfoPath)).toBe(true);
            const content = fs.readFileSync(nfoPath, 'utf-8');
            expect(content).toContain('Write Test Movie');
        });
    });

    describe('parseMovieNfo', () => {
        test('SVC-FILE-013: 解析所有字段', () => {
            const xml = `<?xml version="1.0"?>
<movie>
    <id>test-id</id>
    <title>Test Movie</title>
    <year>2024</year>
    <outline>Test outline</outline>
    <director>Director</director>
</movie>`;
            const result = service.parseMovieNfo(xml);
            expect(result.id).toBe('test-id');
            expect(result.title).toBe('Test Movie');
            expect(result.year).toBe('2024');
        });

        test('SVC-FILE-014: 处理缺失字段', () => {
            const xml = `<?xml version="1.0"?><movie><title>Only Title</title></movie>`;
            const result = service.parseMovieNfo(xml);
            expect(result.title).toBe('Only Title');
            expect(result.director).toBeUndefined();
        });

        test('SVC-FILE-015: 解析多个标签', () => {
            const xml = `<?xml version="1.0"?><movie><tag>action</tag><tag>drama</tag><tag>comedy</tag></movie>`;
            const result = service.parseMovieNfo(xml);
            expect(result.tag).toEqual(['action', 'drama', 'comedy']);
        });

        test('SVC-FILE-016: 解析多个演员', () => {
            const xml = `<?xml version="1.0"?><movie>
                <actor><name>Actor 1</name></actor>
                <actor><name>Actor 2</name></actor>
            </movie>`;
            const result = service.parseMovieNfo(xml);
            expect(result.actors).toEqual(['Actor 1', 'Actor 2']);
        });
    });

    describe('generateMovieNfo', () => {
        test('SVC-FILE-017: 生成完整XML', () => {
            const data = {
                id: 'gen-test',
                title: 'Generate Test',
                year: '2024',
                director: 'Director',
                actors: ['Actor 1'],
                tag: ['action'],
                favorite: true,
                userRating: 5
            };
            const xml = service.generateMovieNfo(data);
            expect(xml).toContain('<id>gen-test</id>');
            expect(xml).toContain('<title>Generate Test</title>');
            expect(xml).toContain('<favorite>true</favorite>');
        });

        test('SVC-FILE-018: XML转义特殊字符', () => {
            const data = { title: 'Title with & < > " quotes' };
            const xml = service.generateMovieNfo(data);
            expect(xml).toContain('&amp;');
            expect(xml).toContain('&lt;');
            expect(xml).toContain('&gt;');
        });
    });

    describe('readDir', () => {
        test('SVC-FILE-019: 返回文件列表', async () => {
            fs.writeFileSync(path.join(testDataDir, 'file1.txt'), '');
            fs.writeFileSync(path.join(testDataDir, 'file2.txt'), '');
            const result = await service.readDir(testDataDir);
            expect(result).toContain('file1.txt');
            expect(result).toContain('file2.txt');
        });

        test('SVC-FILE-020: 目录不存在返回空', async () => {
            const result = await service.readDir(path.join(testDataDir, 'notexists'));
            expect(result).toEqual([]);
        });
    });

    describe('createDir', () => {
        test('SVC-FILE-021: 创建目录成功', async () => {
            const newDir = path.join(testDataDir, 'newdir', 'subdir');
            await service.createDir(newDir);
            expect(fs.existsSync(newDir)).toBe(true);
        });
    });

    describe('ensureDir', () => {
        test('SVC-FILE-022: 目录不存在时创建', async () => {
            const newDir = path.join(testDataDir, 'ensure', 'nested');
            await service.ensureDir(newDir);
            expect(fs.existsSync(newDir)).toBe(true);
        });

        test('SVC-FILE-023: 已存在不报错', async () => {
            const existingDir = path.join(testDataDir, 'existing');
            fs.mkdirSync(existingDir);
            await expect(service.ensureDir(existingDir)).resolves.not.toThrow();
        });
    });

    describe('writeFile', () => {
        test('SVC-FILE-024: 写入文件成功', async () => {
            const filePath = path.join(testDataDir, 'write.txt');
            await service.writeFile(filePath, 'test content');
            expect(fs.readFileSync(filePath, 'utf-8')).toBe('test content');
        });
    });

    describe('readFile', () => {
        test('SVC-FILE-025: 读取文件内容', async () => {
            const filePath = path.join(testDataDir, 'read.txt');
            fs.writeFileSync(filePath, 'read content');
            const result = await service.readFile(filePath);
            expect(result).toBe('read content');
        });

        test('SVC-FILE-026: 文件不存在抛错误', async () => {
            await expect(service.readFile(path.join(testDataDir, 'notexists.txt')))
                .rejects.toThrow();
        });
    });

    describe('deleteFile', () => {
        test('SVC-FILE-027: 删除文件成功', async () => {
            const filePath = path.join(testDataDir, 'delete.txt');
            fs.writeFileSync(filePath, '');
            await service.deleteFile(filePath);
            expect(fs.existsSync(filePath)).toBe(false);
        });

        test('SVC-FILE-028: 不存在不报错', async () => {
            await expect(service.deleteFile(path.join(testDataDir, 'notexists.txt')))
                .resolves.not.toThrow();
        });
    });

    describe('copyFile', () => {
        test('SVC-FILE-030: 复制文件成功', async () => {
            const src = path.join(testDataDir, 'source.txt');
            const dest = path.join(testDataDir, 'dest.txt');
            fs.writeFileSync(src, 'copy content');
            await service.copyFile(src, dest);
            expect(fs.existsSync(dest)).toBe(true);
            expect(fs.readFileSync(dest, 'utf-8')).toBe('copy content');
        });

        test('SVC-FILE-031: 源不存在抛错误', async () => {
            await expect(service.copyFile(
                path.join(testDataDir, 'notexists.txt'),
                path.join(testDataDir, 'dest.txt')
            )).rejects.toThrow();
        });
    });

    describe('readJson', () => {
        test('SVC-FILE-032: 正确读取JSON', async () => {
            const filePath = path.join(testDataDir, 'test.json');
            fs.writeFileSync(filePath, JSON.stringify({ key: 'value' }));
            const result = await service.readJson(filePath);
            expect(result.key).toBe('value');
        });

        test('SVC-FILE-033: 文件不存在返回null', async () => {
            const result = await service.readJson(path.join(testDataDir, 'notexists.json'));
            expect(result).toBeNull();
        });
    });

    describe('writeJson', () => {
        test('SVC-FILE-034: 正确写入JSON', async () => {
            const filePath = path.join(testDataDir, 'write.json');
            await service.writeJson(filePath, { test: 'data' });
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            expect(content.test).toBe('data');
        });
    });

    describe('getFileExtension', () => {
        test('SVC-FILE-035: 正确返回扩展名', () => {
            expect(service.getFileExtension('test.jpg')).toBe('.jpg');
        });

        test('SVC-FILE-036: 大写转小写', () => {
            expect(service.getFileExtension('test.PNG')).toBe('.png');
        });

        test('SVC-FILE-037: 无扩展名返回空', () => {
            expect(service.getFileExtension('noextension')).toBe('');
        });
    });

    describe('getFileNameWithoutExtension', () => {
        test('SVC-FILE-038: 返回无扩展名文件名', () => {
            expect(service.getFileNameWithoutExtension('test.jpg')).toBe('test');
        });
    });

    describe('readImageAsBase64', () => {
        test('SVC-FILE-039: 返回base64字符串', async () => {
            const imgPath = path.join(testDataDir, 'test.jpg');
            fs.writeFileSync(imgPath, Buffer.from([0xFF, 0xD8, 0xFF]));
            const result = await service.readImageAsBase64(imgPath);
            expect(result).toContain('data:image/jpeg;base64,');
        });

        test('SVC-FILE-040: 文件不存在返回null', async () => {
            const result = await service.readImageAsBase64(path.join(testDataDir, 'notexists.jpg'));
            expect(result).toBeNull();
        });
    });

    describe('getMimeType', () => {
        test('SVC-FILE-041: 返回正确MIME类型', () => {
            expect(service.getMimeType('.jpg')).toBe('image/jpeg');
            expect(service.getMimeType('.png')).toBe('image/png');
        });

        test('SVC-FILE-042: 未知类型返回默认', () => {
            expect(service.getMimeType('.unknown')).toBe('application/octet-stream');
        });
    });

    describe('scanDirectoryForMovies', () => {
        test('SVC-FILE-043: 返回子文件夹列表', async () => {
            fs.mkdirSync(path.join(testDataDir, 'movie1'));
            fs.mkdirSync(path.join(testDataDir, 'movie2'));
            const result = await service.scanDirectoryForMovies(testDataDir);
            expect(result).toContain('movie1');
            expect(result).toContain('movie2');
        });
    });

    describe('readMovieNamesFromFile', () => {
        test('SVC-FILE-044: 返回电影名数组', async () => {
            const filePath = path.join(testDataDir, 'movies.txt');
            fs.writeFileSync(filePath, 'Movie 1\nMovie 2\nMovie 3');
            const result = await service.readMovieNamesFromFile(filePath);
            expect(result).toEqual(['Movie 1', 'Movie 2', 'Movie 3']);
        });

        test('SVC-FILE-045: 过滤空行', async () => {
            const filePath = path.join(testDataDir, 'movies.txt');
            fs.writeFileSync(filePath, 'Movie 1\n\nMovie 2\n');
            const result = await service.readMovieNamesFromFile(filePath);
            expect(result).toEqual(['Movie 1', 'Movie 2']);
        });

        test('SVC-FILE-046: 文件不存在返回空', async () => {
            const result = await service.readMovieNamesFromFile(path.join(testDataDir, 'notexists.txt'));
            expect(result).toEqual([]);
        });
    });

    describe('copyDir', () => {
        test('SVC-FILE-047: 复制目录成功', async () => {
            const srcDir = path.join(testDataDir, 'copySrc');
            const destDir = path.join(testDataDir, 'copyDest');
            fs.mkdirSync(srcDir);
            fs.writeFileSync(path.join(srcDir, 'file.txt'), 'content');
            await service.copyDir(srcDir, destDir);
            expect(fs.existsSync(path.join(destDir, 'file.txt'))).toBe(true);
        });
    });

    describe('moveDir', () => {
        test('SVC-FILE-048: 移动目录成功', async () => {
            const srcDir = path.join(testDataDir, 'moveSrc');
            const destDir = path.join(testDataDir, 'moveDest');
            fs.mkdirSync(srcDir);
            fs.writeFileSync(path.join(srcDir, 'file.txt'), 'content');
            await service.moveDir(srcDir, destDir);
            expect(fs.existsSync(path.join(destDir, 'file.txt'))).toBe(true);
            expect(fs.existsSync(srcDir)).toBe(false);
        });
    });
});
