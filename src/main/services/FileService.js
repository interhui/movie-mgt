/**
 * 文件系统服务
 * 负责所有文件系统的操作
 */
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

class FileService {
    constructor() {
        this.baseDir = path.join(__dirname, '..', '..');
    }

    /**
     * 获取指定目录下所有分类文件夹名称
     * @param {string} baseDir - 基础目录路径
     * @returns {Promise<string[]>} 返回文件夹名称数组
     */
    async getCategoryFolders(baseDir) {
        try {
            const fullPath = path.resolve(baseDir);
            const exists = await this.fileExists(fullPath);
            if (!exists) {
                return [];
            }

            const entries = await fs.readdir(fullPath, { withFileTypes: true });
            const folders = entries
                .filter(entry => entry.isDirectory())
                .map(entry => entry.name);

            return folders;
        } catch (error) {
            console.error('Error getting category folders:', error);
            throw error;
        }
    }

    /**
     * 获取指定目录下所有电影文件夹
     * @param {string} categoryDir - 分类目录路径
     * @returns {Promise<object>} 返回 {folderName: folderPath} 对象
     */
    async getMovieFolders(categoryDir) {
        try {
            const fullPath = path.resolve(categoryDir);
            const exists = await this.fileExists(fullPath);
            if (!exists) {
                return {};
            }

            const entries = await fs.readdir(fullPath, { withFileTypes: true });
            const movieFolders = {};

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    movieFolders[entry.name] = path.join(fullPath, entry.name);
                }
            }

            return movieFolders;
        } catch (error) {
            console.error('Error getting movie folders:', error);
            throw error;
        }
    }

    /**
     * 读取 movie.nfo 文件内容（XML格式）
     * @param {string} moviePath - 电影文件夹路径
     * @returns {Promise<object>} 返回电影信息对象
     */
    async readMovieNfo(moviePath) {
        try {
            const movieNfoPath = path.join(moviePath, 'movie.nfo');
            const exists = await this.fileExists(movieNfoPath);
            if (!exists) {
                return null;
            }

            const content = await fs.readFile(movieNfoPath, 'utf-8');
            return this.parseMovieNfo(content);
        } catch (error) {
            console.error('Error reading movie.nfo:', error);
            throw error;
        }
    }

    /**
     * 解析 movie.nfo XML 内容
     * @param {string} xmlContent - XML内容
     * @returns {object} 电影数据对象
     */
    parseMovieNfo(xmlContent) {
        const movie = {};

        // 解析简单文本字段
        const textFields = ['id', 'title', 'year', 'outline', 'sorttitle', 'runtime', 'studio', 'director', 'original_filename', 'description'];
        for (const field of textFields) {
            const regex = new RegExp(`<${field}>([^<]*)</${field}>`, 'i');
            const match = xmlContent.match(regex);
            if (match) {
                movie[field] = match[1];
            }
        }

        // 解析标签（可能有多个）
        const tagMatches = xmlContent.match(/<tag>([^<]*)<\/tag>/gi) || [];
        movie.tag = tagMatches.map(m => {
            const match = m.match(/<tag>([^<]*)<\/tag>/i);
            return match ? match[1] : '';
        }).filter(t => t);

        // 解析演员（可能有多个）
        const actorMatches = xmlContent.match(/<actor>[\s\S]*?<\/actor>/gi) || [];
        movie.actors = [];
        for (const actorBlock of actorMatches) {
            const nameMatches = actorBlock.match(/<name>([^<]*)<\/name>/gi) || [];
            for (const nameTag of nameMatches) {
                const match = nameTag.match(/<name>([^<]*)<\/name>/i);
                if (match && match[1]) {
                    movie.actors.push(match[1]);
                }
            }
        }

        // 解析 fileinfo - 包含视频信息
        const fileinfoMatch = xmlContent.match(/<fileinfo>([\s\S]*?)<\/fileinfo>/i);
        if (fileinfoMatch) {
            movie.fileinfo = fileinfoMatch[1];

            // 解析视频信息
            const videoMatch = fileinfoMatch[1].match(/<video>[\s\S]*?<\/video>/i);
            if (videoMatch) {
                const videoContent = videoMatch[0];

                // 解析 codec
                const codecMatch = videoContent.match(/<codec>([^<]*)<\/codec>/i);
                if (codecMatch) {
                    movie.videoCodec = codecMatch[1].toUpperCase();
                }

                // 解析 width
                const widthMatch = videoContent.match(/<width>([^<]*)<\/width>/i);
                if (widthMatch) {
                    movie.videoWidth = widthMatch[1];
                }

                // 解析 height
                const heightMatch = videoContent.match(/<height>([^<]*)<\/height>/i);
                if (heightMatch) {
                    movie.videoHeight = heightMatch[1];
                }

                // 解析 durationinseconds
                const durationMatch = videoContent.match(/<durationinseconds>([^<]*)<\/durationinseconds>/i);
                if (durationMatch) {
                    movie.videoDuration = durationMatch[1];
                }
            }
        }

        

        // 解析 fileset（关联文件列表）
        const filesetMatch = xmlContent.match(/<fileset>([\s\S]*?)<\/fileset>/i);
        if (filesetMatch) {
            const filesetContent = filesetMatch[1];
            const fileMatches = filesetContent.match(/<file>[\s\S]*?<\/file>/gi) || [];
            movie.fileset = [];
            for (const fileBlock of fileMatches) {
                const file = {};
                // 解析 filename
                const filenameMatch = fileBlock.match(/<filename>([^<]*)<\/filename>/i);
                if (filenameMatch) file.filename = filenameMatch[1];
                // 解析 fullpath
                const fullpathMatch = fileBlock.match(/<fullpath>([^<]*)<\/fullpath>/i);
                if (fullpathMatch) file.fullpath = fullpathMatch[1];
                // 解析 type
                const typeMatch = fileBlock.match(/<type>([^<]*)<\/type>/i);
                if (typeMatch) file.type = typeMatch[1];
                // 解析 videocodec
                const videocodecMatch = fileBlock.match(/<videocodec>([^<]*)<\/videocodec>/i);
                if (videocodecMatch) file.videoCodec = videocodecMatch[1].toUpperCase();
                // 解析 videowidth
                const videowidthMatch = fileBlock.match(/<videowidth>([^<]*)<\/videowidth>/i);
                if (videowidthMatch) file.videoWidth = videowidthMatch[1];
                // 解析 videoheight
                const videoheightMatch = fileBlock.match(/<videoheight>([^<]*)<\/videoheight>/i);
                if (videoheightMatch) file.videoHeight = videoheightMatch[1];
                // 解析 videoduration
                const videodurationMatch = fileBlock.match(/<videoduration>([^<]*)<\/videoduration>/i);
                if (videodurationMatch) file.videoDuration = videodurationMatch[1];
                // 解析 memo
                const memoMatch = fileBlock.match(/<memo>([^<]*)<\/memo>/i);
                if (memoMatch) file.memo = memoMatch[1];
                movie.fileset.push(file);
            }
        }

        return movie;
    }

    /**
     * 写入 movie.nfo 文件（XML格式）
     * @param {string} moviePath - 电影文件夹路径
     * @param {object} movieData - 电影数据对象
     */
    async writeMovieNfo(moviePath, movieData) {
        try {
            const movieNfoPath = path.join(moviePath, 'movie.nfo');
            const xmlContent = this.generateMovieNfo(movieData);
            await fs.writeFile(movieNfoPath, xmlContent, 'utf-8');
        } catch (error) {
            console.error('Error writing movie.nfo:', error);
            throw error;
        }
    }

    /**
     * 生成 movie.nfo XML 内容
     * @param {object} movieData - 电影数据对象
     * @returns {string} XML内容
     */
    generateMovieNfo(movieData) {
        let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<movie>\n';

        // 从 fileset 中提取 Main 文件的信息，写入到 movie 级别
        let mainFile = null;
        const nonMainFiles = [];
        if (movieData.fileset && Array.isArray(movieData.fileset)) {
            for (const file of movieData.fileset) {
                if (file.type === 'Main') {
                    mainFile = file;
                } else {
                    nonMainFiles.push(file);
                }
            }
        }

        // 写入简单字段（注意：如果有 Main 文件，original_filename 从 Main 文件获取）
        const textFields = ['id', 'title', 'year', 'outline', 'sorttitle', 'runtime', 'studio', 'director', 'description'];
        for (const field of textFields) {
            if (movieData[field]) {
                xml += `    <${field}>${this.escapeXml(movieData[field])}</${field}>\n`;
            }
        }

        // 写入 original_filename（如果存在 Main 文件，使用 Main 文件的 fullpath）
        if (mainFile && mainFile.fullpath) {
            xml += `    <original_filename>${this.escapeXml(mainFile.fullpath)}</original_filename>\n`;
        } else if (movieData.original_filename) {
            xml += `    <original_filename>${this.escapeXml(movieData.original_filename)}</original_filename>\n`;
        }

        // 写入标签
        if (movieData.tags && Array.isArray(movieData.tags)) {
            for (const tag of movieData.tags) {
                xml += `    <tag>${this.escapeXml(tag)}</tag>\n`;
            }
        }

        // 写入演员
        if (movieData.actors && Array.isArray(movieData.actors)) {
            xml += '    <actor>\n';
            for (const actor of movieData.actors) {
                xml += `        <name>${this.escapeXml(actor)}</name>\n`;
            }
            xml += '    </actor>\n';
        }

        // 写入 fileinfo（包含视频信息，从 Main 文件获取）
        const videoCodec = mainFile ? (mainFile.videoCodec || movieData.videoCodec || '') : (movieData.videoCodec || '');
        const videoWidth = mainFile ? (mainFile.videoWidth || movieData.videoWidth || '') : (movieData.videoWidth || '');
        const videoHeight = mainFile ? (mainFile.videoHeight || movieData.videoHeight || '') : (movieData.videoHeight || '');
        const videoDuration = mainFile ? (mainFile.videoDuration || movieData.videoDuration || '') : (movieData.videoDuration || '');

        if (videoCodec || videoWidth || videoHeight || videoDuration) {
            xml += '    <fileinfo>\n';
            xml += '        <streamdetails>\n';
            xml += '            <video>\n';
            if (videoCodec) {
                xml += `                <codec>${this.escapeXml(videoCodec)}</codec>\n`;
            }
            if (videoWidth) {
                xml += `                <width>${this.escapeXml(videoWidth)}</width>\n`;
            }
            if (videoHeight) {
                xml += `                <height>${this.escapeXml(videoHeight)}</height>\n`;
            }
            if (videoDuration) {
                xml += `                <durationinseconds>${this.escapeXml(videoDuration)}</durationinseconds>\n`;
            }
            xml += '            </video>\n';
            xml += '        </streamdetails>\n';
            xml += '    </fileinfo>\n';
        } else if (movieData.fileinfo) {
            // 如果没有独立的视频信息字段但有原始fileinfo字符串
            xml += `    <fileinfo>${movieData.fileinfo}</fileinfo>\n`;
        }

        // 写入 fileset（仅包含非 Main 类型的文件）
        if (nonMainFiles.length > 0) {
            xml += '    <fileset>\n';
            for (const file of nonMainFiles) {
                xml += '        <file>\n';
                if (file.filename) {
                    xml += `            <filename>${this.escapeXml(file.filename)}</filename>\n`;
                }
                if (file.fullpath) {
                    xml += `            <fullpath>${this.escapeXml(file.fullpath)}</fullpath>\n`;
                }
                if (file.type) {
                    xml += `            <type>${this.escapeXml(file.type)}</type>\n`;
                }
                if (file.videoCodec) {
                    xml += `            <videocodec>${this.escapeXml(file.videoCodec)}</videocodec>\n`;
                }
                if (file.videoWidth) {
                    xml += `            <videowidth>${this.escapeXml(file.videoWidth)}</videowidth>\n`;
                }
                if (file.videoHeight) {
                    xml += `            <videoheight>${this.escapeXml(file.videoHeight)}</videoheight>\n`;
                }
                if (file.videoDuration) {
                    xml += `            <videoduration>${this.escapeXml(file.videoDuration)}</videoduration>\n`;
                }
                if (file.memo) {
                    xml += `            <memo>${this.escapeXml(file.memo)}</memo>\n`;
                }
                xml += '        </file>\n';
            }
            xml += '    </fileset>\n';
        }

        

        xml += '</movie>';
        return xml;
    }

    /**
     * XML转义
     * @param {string} str - 原始字符串
     * @returns {string} 转义后的字符串
     */
    escapeXml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * 检查文件是否存在
     * @param {string} filePath - 文件路径
     * @returns {Promise<boolean>} 是否存在
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 检查文件是否存在（同步版本）
     * @param {string} filePath - 文件路径
     * @returns {boolean} 是否存在
     */
    fileExistsSync(filePath) {
        return fsSync.existsSync(filePath);
    }

    /**
     * 读取目录内容
     * @param {string} dirPath - 目录路径
     * @returns {Promise<string[]>} 文件列表
     */
    async readDir(dirPath) {
        try {
            const exists = await this.fileExists(dirPath);
            if (!exists) {
                return [];
            }
            return await fs.readdir(dirPath);
        } catch (error) {
            console.error('Error reading directory:', error);
            throw error;
        }
    }

    /**
     * 创建目录
     * @param {string} dirPath - 目录路径
     */
    async createDir(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            console.error('Error creating directory:', error);
            throw error;
        }
    }

    /**
     * 确保目录存在（如果不存在则创建）
     * @param {string} dirPath - 目录路径
     */
    async ensureDir(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            // 忽略目录已存在的错误
            if (error.code !== 'EEXIST') {
                console.error('Error ensuring directory:', error);
                throw error;
            }
        }
    }

    /**
     * 写入文件
     * @param {string} filePath - 文件路径
     * @param {string} content - 文件内容
     */
    async writeFile(filePath, content) {
        try {
            await fs.writeFile(filePath, content, 'utf-8');
        } catch (error) {
            console.error('Error writing file:', error);
            throw error;
        }
    }

    /**
     * 读取文件
     * @param {string} filePath - 文件路径
     * @returns {Promise<string>} 文件内容
     */
    async readFile(filePath) {
        try {
            return await fs.readFile(filePath, 'utf-8');
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }

    /**
     * 删除文件
     * @param {string} filePath - 文件路径
     */
    async deleteFile(filePath) {
        try {
            const exists = await this.fileExists(filePath);
            if (exists) {
                await fs.unlink(filePath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    /**
     * 删除目录
     * @param {string} dirPath - 目录路径
     */
    async deleteDir(dirPath) {
        try {
            const exists = await this.fileExists(dirPath);
            if (exists) {
                await fs.rm(dirPath, { recursive: true, force: true });
            }
        } catch (error) {
            console.error('Error deleting directory:', error);
            throw error;
        }
    }

    /**
     * 复制文件
     * @param {string} srcPath - 源路径
     * @param {string} destPath - 目标路径
     */
    async copyFile(srcPath, destPath) {
        try {
            await fs.copyFile(srcPath, destPath);
        } catch (error) {
            console.error('Error copying file:', error);
            throw error;
        }
    }

    /**
     * 读取 JSON 文件
     * @param {string} filePath - 文件路径
     * @returns {Promise<object>} JSON 对象
     */
    async readJson(filePath) {
        try {
            const exists = await this.fileExists(filePath);
            if (!exists) {
                return null;
            }
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            console.error('Error reading JSON file:', error);
            throw error;
        }
    }

    /**
     * 写入 JSON 文件
     * @param {string} filePath - 文件路径
     * @param {object} data - 数据对象
     */
    async writeJson(filePath, data) {
        try {
            const dir = path.dirname(filePath);
            await this.createDir(dir);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error('Error writing JSON file:', error);
            throw error;
        }
    }

    /**
     * 获取分类配置文件
     * @returns {Promise<object>} 分类配置
     */
    async getCategoryConfig() {
        const configPath = path.join(this.baseDir, 'config', 'categories.json');
        return await this.readJson(configPath);
    }

    /**
     * 保存分类配置文件
     * @param {object} config - 分类配置
     */
    async saveCategoryConfig(config) {
        const configPath = path.join(this.baseDir, 'config', 'categories.json');
        await this.writeJson(configPath, config);
    }

    /**
     * 获取文件扩展名
     * @param {string} filePath - 文件路径
     * @returns {string} 扩展名
     */
    getFileExtension(filePath) {
        return path.extname(filePath).toLowerCase();
    }

    /**
     * 获取文件名（不含扩展名）
     * @param {string} filePath - 文件路径
     * @returns {string} 文件名
     */
    getFileNameWithoutExtension(filePath) {
        return path.basename(filePath, path.extname(filePath));
    }

    /**
     * 读取图片文件为 base64
     * @param {string} imagePath - 图片路径
     * @returns {Promise<string>} base64 字符串
     */
    async readImageAsBase64(imagePath) {
        try {
            const exists = await this.fileExists(imagePath);
            if (!exists) {
                return null;
            }
            const buffer = await fs.readFile(imagePath);
            const ext = this.getFileExtension(imagePath);
            const mimeType = this.getMimeType(ext);
            return `data:${mimeType};base64,${buffer.toString('base64')}`;
        } catch (error) {
            console.error('Error reading image:', error);
            return null;
        }
    }

    /**
     * 获取 MIME 类型
     * @param {string} ext - 扩展名
     * @returns {string} MIME 类型
     */
    getMimeType(ext) {
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * 扫描目录获取所有子文件夹名称
     * @param {string} dirPath - 目录路径
     * @returns {Promise<string[]>} 子文件夹名称数组
     */
    async scanDirectoryForMovies(dirPath) {
        try {
            const fullPath = path.resolve(dirPath);
            const exists = await this.fileExists(fullPath);
            if (!exists) {
                return [];
            }

            const entries = await fs.readdir(fullPath, { withFileTypes: true });
            const folders = entries
                .filter(entry => entry.isDirectory())
                .map(entry => entry.name);

            return folders;
        } catch (error) {
            console.error('Error scanning directory for movies:', error);
            throw error;
        }
    }

    /**
     * 从文本文件读取电影名称（每行一个）
     * @param {string} filePath - 文本文件路径
     * @returns {Promise<string[]>} 电影名称数组
     */
    async readMovieNamesFromFile(filePath) {
        try {
            const exists = await this.fileExists(filePath);
            if (!exists) {
                return [];
            }

            const content = await fs.readFile(filePath, 'utf-8');
            // 按行分割并过滤空行
            const names = content.split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line.length > 0);

            return names;
        } catch (error) {
            console.error('Error reading movie names from file:', error);
            throw error;
        }
    }

    /**
     * 复制目录到目标路径
     * @param {string} srcPath - 源路径
     * @param {string} destPath - 目标路径
     */
    async copyDir(srcPath, destPath) {
        try {
            await this.ensureDir(destPath);
            const entries = await fs.readdir(srcPath, { withFileTypes: true });

            for (const entry of entries) {
                const srcEntry = path.join(srcPath, entry.name);
                const destEntry = path.join(destPath, entry.name);

                if (entry.isDirectory()) {
                    await this.copyDir(srcEntry, destEntry);
                } else {
                    await this.copyFile(srcEntry, destEntry);
                }
            }
        } catch (error) {
            console.error('Error copying directory:', error);
            throw error;
        }
    }

    /**
     * 移动目录到目标路径
     * @param {string} srcPath - 源路径
     * @param {string} destPath - 目标路径
     */
    async moveDir(srcPath, destPath) {
        try {
            // 确保目标目录存在
            await this.ensureDir(path.dirname(destPath));
            // 删除目标目录（如果存在）
            await this.deleteDir(destPath);
            // 重命名/移动目录
            await fs.rename(srcPath, destPath);
        } catch (error) {
            // 如果 rename 失败（跨设备），尝试复制后删除
            if (error.code === 'EXDEV' || error.code === 'EPERM') {
                console.log('Cross-device move detected, using copy+delete approach');
                await this.copyDir(srcPath, destPath);
                await this.deleteDir(srcPath);
            } else {
                console.error('Error moving directory:', error);
                throw error;
            }
        }
    }

    /**
     * 递归扫描目录，查找包含movie.nfo的文件夹
     * @param {string} dirPath - 目录路径
     * @returns {Promise<object[]>} 包含movie.nfo的文件夹信息数组
     */
    async scanDirectoryRecursively(dirPath) {
        const movieFolders = [];

        /**
         * 递归扫描函数
         * @param {string} currentDir - 当前目录
         */
        async function scanRecursive(currentDir) {
            try {
                const exists = await this.fileExists(currentDir);
                if (!exists) {
                    return;
                }

                const entries = await fs.readdir(currentDir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(currentDir, entry.name);

                    if (entry.isDirectory()) {
                        // 检查是否是电影文件夹（包含movie.nfo）
                        const nfoPath = path.join(fullPath, 'movie.nfo');
                        const hasNfo = await this.fileExists(nfoPath);

                        if (hasNfo) {
                            // 找到电影文件夹，查找海报文件
                            const posterInfo = await this.findMoviePoster(fullPath);
                            movieFolders.push({
                                folderPath: fullPath,
                                folderName: entry.name,
                                nfoPath: nfoPath,
                                posterPath: posterInfo.posterPath,
                                posterExt: posterInfo.posterExt
                            });
                        } else {
                            // 继续递归扫描子文件夹
                            await scanRecursive.call(this, fullPath);
                        }
                    }
                }
            } catch (error) {
                console.error('Error scanning directory recursively:', error);
            }
        }

        await scanRecursive.call(this, dirPath);
        return movieFolders;
    }

    /**
     * 查找文件夹中的海报文件
     * 支持的命名模式：*-poster.jpg, poster.jpg, cover.jpg, folder.jpg
     * @param {string} folderPath - 文件夹路径
     * @returns {Promise<object>} 海报信息 {posterPath, posterExt}
     */
    async findMoviePoster(folderPath) {
        const posterPatterns = [
            /-poster\.jpg$/i,
            /-poster\.jpeg$/i,
            /-poster\.png$/i,
            /-poster\.webp$/i,
            /^poster\.jpg$/i,
            /^poster\.jpeg$/i,
            /^cover\.jpg$/i,
            /^cover\.jpeg$/i,
            /^folder\.jpg$/i,
            /^folder\.jpeg$/i
        ];

        try {
            const exists = await this.fileExists(folderPath);
            if (!exists) {
                return { posterPath: null, posterExt: null };
            }

            const entries = await fs.readdir(folderPath, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isFile()) {
                    for (const pattern of posterPatterns) {
                        if (pattern.test(entry.name)) {
                            const posterPath = path.join(folderPath, entry.name);
                            const ext = path.extname(entry.name).toLowerCase();
                            return { posterPath, posterExt: ext };
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error finding movie poster:', error);
        }

        return { posterPath: null, posterExt: null };
    }

    /**
     * 解析CSV格式的电影数据文件
     * CSV列：电影ID、电影名称、电影描述、排序标题、演员(|分割)、导演、上映时间、发行商、电影时长(分钟)、标签、文件地址、视频编码、视频宽度、视频高度、视频时间
     * @param {string} filePath - CSV文件路径
     * @returns {Promise<object[]>} 电影数据数组
     */
    async parseCsvFile(filePath) {
        const movies = [];

        try {
            const exists = await this.fileExists(filePath);
            if (!exists) {
                return movies;
            }

            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

            // 跳过表头
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // 简单CSV解析（处理带引号的值）
                const values = this.parseCsvLine(line);

                if (values.length >= 14) {
                    const [
                        movieId,
                        title,
                        description,
                        sortTitle,
                        actorsStr,
                        director,
                        year,
                        studio,
                        runtime,
                        tagsStr,
                        fileAddress,
                        videoCodec,
                        videoWidth,
                        videoHeight,
                        videoDuration
                    ] = values;

                    // 解析演员数组
                    const actors = actorsStr ? actorsStr.split('|').map(a => a.trim()).filter(a => a) : [];

                    // 解析标签数组
                    const tags = tagsStr ? tagsStr.split('|').map(t => t.trim()).filter(t => t) : [];

                    movies.push({
                        movieId: movieId?.trim() || '',
                        title: title?.trim() || '',
                        description: description?.trim() || '',
                        sortTitle: sortTitle?.trim() || '',
                        actors: actors,
                        director: director?.trim() || '',
                        year: year?.trim() || '',
                        studio: studio?.trim() || '',
                        runtime: runtime?.trim() || '',
                        tags: tags,
                        fileAddress: fileAddress?.trim() || '',
                        videoCodec: videoCodec?.trim() || '',
                        videoWidth: videoWidth?.trim() || '',
                        videoHeight: videoHeight?.trim() || '',
                        videoDuration: videoDuration?.trim() || '',
                        // 内部使用字段
                        fileset: fileAddress ? [{
                            type: 'Main',
                            fullpath: fileAddress.trim(),
                            filename: path.basename(fileAddress.trim()),
                            videoCodec: videoCodec?.trim() || '',
                            videoWidth: videoWidth?.trim() || '',
                            videoHeight: videoHeight?.trim() || '',
                            videoDuration: videoDuration?.trim() || ''
                        }] : []
                    });
                }
            }
        } catch (error) {
            console.error('Error parsing CSV file:', error);
        }

        return movies;
    }

    /**
     * 解析CSV行，支持带引号的值
     * @param {string} line - CSV行
     * @returns {string[]} 解析后的值数组
     */
    parseCsvLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (inQuotes) {
                if (char === '"' && nextChar === '"') {
                    // 转义的双引号
                    current += '"';
                    i++;
                } else if (char === '"') {
                    // 结束引号
                    inQuotes = false;
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    // 开始引号
                    inQuotes = true;
                } else if (char === ',') {
                    // 分隔符
                    values.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
        }

        values.push(current);
        return values;
    }

    /**
     * 复制文件到目标路径
     * @param {string} srcPath - 源文件路径
     * @param {string} destPath - 目标文件路径
     * @returns {Promise<string>} 目标文件路径
     */
    async copyFile(srcPath, destPath) {
        try {
            const destDir = path.dirname(destPath);
            await this.ensureDir(destDir);
            await fs.copyFile(srcPath, destPath);
            return destPath;
        } catch (error) {
            console.error('Error copying file:', error);
            throw error;
        }
    }

    /**
     * 读取文件内容
     * @param {string} filePath - 文件路径
     * @returns {Promise<string>} 文件内容
     */
    async readFile(filePath) {
        try {
            return await fs.readFile(filePath, 'utf-8');
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }

    /**
     * 写入文件内容
     * @param {string} filePath - 文件路径
     * @param {string} content - 文件内容
     */
    async writeFile(filePath, content) {
        try {
            await this.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, content, 'utf-8');
        } catch (error) {
            console.error('Error writing file:', error);
            throw error;
        }
    }
}

module.exports = FileService;
