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
     * 获取指定目录下所有子文件夹名称
     * @param {string} baseDir - 基础目录路径
     * @returns {Promise<string[]>} 返回文件夹名称数组
     */
    async getSimulatorFolders(baseDir) {
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
            console.error('Error getting simulator folders:', error);
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

        // 解析 fileinfo
        const fileinfoMatch = xmlContent.match(/<fileinfo>([\s\S]*?)<\/fileinfo>/i);
        if (fileinfoMatch) {
            movie.fileinfo = fileinfoMatch[1];
        }

        // 解析 favorite（布尔值）
        movie.favorite = xmlContent.includes('<favorite>true</favorite>');

        // 解析 userRating（数字）
        const ratingMatch = xmlContent.match(/<userRating>(\d+)<\/userRating>/i);
        if (ratingMatch) {
            movie.userRating = parseInt(ratingMatch[1], 10);
        }

        // 解析 userComment
        const commentMatch = xmlContent.match(/<userComment>([^<]*)<\/userComment>/i);
        if (commentMatch) {
            movie.userComment = commentMatch[1];
        }

        // 解析 tags（兼容性）
        const tagsMatch = xmlContent.match(/<tags>([^<]*)<\/tags>/i);
        if (tagsMatch && tagsMatch[1]) {
            movie.tags = tagsMatch[1].split(',').map(t => t.trim()).filter(t => t);
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

        // 写入简单字段
        const textFields = ['id', 'title', 'year', 'outline', 'sorttitle', 'runtime', 'studio', 'director', 'original_filename', 'description'];
        for (const field of textFields) {
            if (movieData[field]) {
                xml += `    <${field}>${this.escapeXml(movieData[field])}</${field}>\n`;
            }
        }

        // 写入标签
        if (movieData.tag && Array.isArray(movieData.tag)) {
            for (const tag of movieData.tag) {
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

        // 写入 fileinfo
        if (movieData.fileinfo) {
            xml += `    <fileinfo>${movieData.fileinfo}</fileinfo>\n`;
        }

        // 写入收藏状态
        xml += `    <favorite>${movieData.favorite ? 'true' : 'false'}</favorite>\n`;

        // 写入用户评分
        if (movieData.userRating !== undefined) {
            xml += `    <userRating>${movieData.userRating}</userRating>\n`;
        }

        // 写入用户评论
        if (movieData.userComment) {
            xml += `    <userComment>${this.escapeXml(movieData.userComment)}</userComment>\n`;
        }

        // 写入 tags（兼容性）
        if (movieData.tags && Array.isArray(movieData.tags)) {
            xml += `    <tags>${movieData.tags.join(',')}</tags>\n`;
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
}

module.exports = FileService;
