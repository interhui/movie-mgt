/**
 * 电影服务
 * 负责电影数据的业务逻辑处理
 */
const FileService = require('./FileService');
const HardCodeService = require('./HardCodeService');
const MovieCacheService = require('./MovieCacheService');
const IndexService = require('./IndexService');
const path = require('path');

class MovieService {
    constructor(categoryService = null) {
        this.fileService = new FileService();
        this.categoryService = categoryService;
        this.hardCodeService = new HardCodeService();
        this.cacheService = new MovieCacheService();
        this.indexService = new IndexService();
    }

    /**
     * 设置分类服务实例
     * @param {object} categoryService - CategoryService实例
     */
    setCategoryService(categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * 设置缓存服务实例
     * @param {object} cacheService - MovieCacheService实例
     */
    setCacheService(cacheService) {
        this.cacheService = cacheService;
    }

    /**
     * 获取缓存服务实例
     * @returns {object} MovieCacheService实例
     */
    getCacheService() {
        return this.cacheService;
    }

    /**
     * 检查缓存是否已初始化
     * @returns {boolean}
     */
    isCacheInitialized() {
        return this.cacheService.isCacheInitialized();
    }

    /**
     * 刷新电影库缓存
     * @param {string} moviesDir - 电影目录
     * @returns {Promise<object>} 缓存信息
     */
    async refreshCache(moviesDir) {
        // 清空缓存
        this.cacheService.clearCache();

        // 重新加载所有电影
        const allMovies = await this.loadAllMoviesFromFiles(moviesDir);

        // 初始化缓存
        this.cacheService.initializeCache(allMovies, moviesDir);

        // 重建所有分类的 index.json
        await this.indexService.rebuildAllIndexes(moviesDir);

        return this.cacheService.getCacheInfo();
    }

    /**
     * 从文件加载所有电影
     * @param {string} moviesDir - 电影目录
     * @returns {Promise<Array>} 电影列表
     */
    async loadAllMoviesFromFiles(moviesDir) {
        const categories = await this.fileService.getSimulatorFolders(moviesDir);
        const allMovies = [];

        for (const category of categories) {
            const categoryPath = path.join(moviesDir, category);
            const movieFolders = await this.fileService.getMovieFolders(categoryPath);

            for (const [folderName, folderPath] of Object.entries(movieFolders)) {
                const movieData = await this.fileService.readMovieNfo(folderPath);
                if (movieData) {
                    const movie = this.generateMovieData(movieData, folderName, category, folderPath);
                    movie.poster = await this.getMoviePoster(folderPath);
                    allMovies.push(movie);
                }
            }
        }

        return allMovies;
    }

    /**
     * 获取所有分类及其电影列表
     * @param {string} moviesDir - 电影存储目录
     * @returns {Promise<object>} 返回分类电影数据
     */
    async getAllCategories(moviesDir) {
        try {
            // 如果缓存未初始化，先初始化缓存
            if (!this.cacheService.isCacheInitialized()) {
                await this.refreshCache(moviesDir);
            }

            const categories = await this.fileService.getSimulatorFolders(moviesDir);
            const categoryData = {};

            for (const category of categories) {
                const movies = this.cacheService.getMoviesByCategory(category) || [];
                categoryData[category] = {
                    id: category,
                    name: this.getCategoryName(category),
                    movieCount: movies.length,
                    movies: this.sortMovies(movies, 'name', 'asc')
                };
            }

            return categoryData;
        } catch (error) {
            console.error('Error getting all categories:', error);
            throw error;
        }
    }

    /**
     * 获取分类统计数据
     * @param {string[]} categories - 分类列表
     * @param {string} moviesDir - 电影目录
     * @returns {Promise<object>} 分类统计
     */
    async getCategoryStats(categories, moviesDir) {
        try {
            // 如果缓存未初始化，先初始化缓存
            if (!this.cacheService.isCacheInitialized()) {
                await this.refreshCache(moviesDir);
            }

            const categoryData = [];

            for (const category of categories) {
                const movies = this.cacheService.getMoviesByCategory(category) || [];
                categoryData.push({
                    id: category,
                    name: this.getCategoryName(category),
                    shortName: this.getCategoryShortName(category),
                    movieCount: movies.length,
                    movies: this.sortMovies(movies, 'name', 'asc')
                });
            }

            return categoryData;
        } catch (error) {
            console.error('Error getting category stats:', error);
            throw error;
        }
    }

    /**
     * 根据分类获取电影列表
     * @param {string} category - 分类名称
     * @param {string} moviesDir - 电影存储目录
     * @param {object} options - 筛选和排序选项
     * @returns {Promise<Array>} 返回电影列表
     */
    async getMoviesByCategory(category, moviesDir, options = {}) {
        try {
            const { sortBy, sortOrder, tagId, rating } = options;

            // 如果缓存未初始化，先初始化缓存
            if (!this.cacheService.isCacheInitialized()) {
                await this.refreshCache(moviesDir);
            }

            // 如果有筛选条件，使用 searchMovies
            if (tagId || rating !== undefined && rating !== null && rating !== '') {
                const filters = { category, sortBy, sortOrder, tagId, rating };
                return this.cacheService.searchMovies(null, filters);
            }

            const movies = this.cacheService.getMoviesByCategory(category) || [];

            // 排序
            return this.sortMovies(movies, sortBy, sortOrder);
        } catch (error) {
            console.error('Error getting movies by category:', error);
            throw error;
        }
    }

    /**
     * 获取所有电影
     * @param {string} moviesDir - 电影存储目录
     * @param {object} options - 筛选和排序选项
     * @returns {Promise<Array>} 电影列表
     */
    async getAllMovies(moviesDir, options = {}) {
        try {
            // 如果缓存未初始化，先初始化缓存
            if (!this.cacheService.isCacheInitialized()) {
                await this.refreshCache(moviesDir);
            }

            const { sortBy, sortOrder, tagId, rating } = options;

            // 如果有筛选条件，使用 searchMovies
            if (tagId || rating !== undefined && rating !== null && rating !== '') {
                const filters = { sortBy, sortOrder, tagId, rating };
                return this.cacheService.searchMovies(null, filters);
            }

            const movies = this.cacheService.getAllMovies() || [];

            // 排序
            return this.sortMovies(movies, sortBy, sortOrder);
        } catch (error) {
            console.error('Error getting all movies:', error);
            throw error;
        }
    }

    /**
     * 从 index.json 快速加载所有电影元数据（用于首页卡片展示）
     * @param {string} moviesDir - 电影存储目录
     * @param {object} options - 筛选和排序选项
     * @returns {Promise<Array>} 电影列表（仅包含 index.json 中的字段）
     */
    async getAllMoviesFromIndex(moviesDir, options = {}) {
        try {
            const { sortBy, sortOrder } = options;

            // 从所有分类的 index.json 加载电影
            const allIndexMovies = await this.indexService.getAllCategoriesIndexMovies(moviesDir);
            const allMovies = [];

            for (const [category, movies] of Object.entries(allIndexMovies)) {
                for (const movie of movies) {
                    allMovies.push({
                        ...movie,
                        category: category
                    });
                }
            }

            // 排序
            return this.sortMovies(allMovies, sortBy, sortOrder);
        } catch (error) {
            console.error('Error getting all movies from index:', error);
            throw error;
        }
    }

    /**
     * 从 index.json 快速加载指定分类的电影元数据
     * @param {string} category - 分类名称
     * @param {string} moviesDir - 电影存储目录
     * @param {object} options - 筛选和排序选项
     * @returns {Promise<Array>} 电影列表
     */
    async getMoviesByCategoryFromIndex(category, moviesDir, options = {}) {
        try {
            const { sortBy, sortOrder } = options;

            const movies = await this.indexService.getMoviesFromIndex(category, moviesDir);
            const moviesWithCategory = movies.map(m => ({ ...m, category }));

            // 排序
            return this.sortMovies(moviesWithCategory, sortBy, sortOrder);
        } catch (error) {
            console.error('Error getting movies by category from index:', error);
            throw error;
        }
    }

    /**
     * 搜索电影
     * @param {string} keyword - 搜索关键词
     * @param {string} moviesDir - 电影存储目录
     * @param {object} filters - 筛选条件
     * @returns {Promise<Array>} 返回匹配的电影列表
     */
    async searchMovies(keyword, moviesDir, filters = {}) {
        try {
            // 如果缓存未初始化，先初始化缓存
            if (!this.cacheService.isCacheInitialized()) {
                await this.refreshCache(moviesDir);
            }

            // 使用缓存搜索
            return this.cacheService.searchMovies(keyword, filters);
        } catch (error) {
            console.error('Error searching movies:', error);
            throw error;
        }
    }

    /**
     * 获取单个电影详情
     * @param {string} movieId - 电影 ID
     * @param {string} moviesDir - 电影存储目录
     * @returns {Promise<object>} 返回电影详情
     */
    async getMovieDetail(movieId, moviesDir) {
        try {
            // 如果缓存未初始化，先初始化缓存
            if (!this.cacheService.isCacheInitialized()) {
                await this.refreshCache(moviesDir);
            }

            // 从缓存获取
            const movie = this.cacheService.getMovieById(movieId);
            return movie || null;
        } catch (error) {
            console.error('Error getting movie detail:', error);
            throw error;
        }
    }

    /**
     * 验证电影有效性
     * @param {string} moviePath - 电影路径
     * @returns {Promise<boolean>} 是否有效
     */
    async isMovieValid(moviePath) {
        try {
            const movieData = await this.fileService.readMovieNfo(moviePath);
            return movieData !== null && movieData.title !== undefined;
        } catch (error) {
            console.error('Error validating movie:', error);
            return false;
        }
    }

    /**
     * 保存用户评分
     * @param {string} movieId - 电影 ID
     * @param {number} rating - 评分 (1-5)
     * @param {string} comment - 评论
     * @param {string} moviesDir - 电影目录
     */
    async saveRating(movieId, rating, comment, moviesDir) {
        try {
            const movieDetail = await this.getMovieDetail(movieId, moviesDir);
            if (!movieDetail) {
                throw new Error('Movie not found');
            }

            const movieData = await this.fileService.readMovieNfo(movieDetail.path);
            if (!movieData) {
                throw new Error('Movie data not found');
            }

            movieData.userRating = rating;
            if (comment !== undefined) {
                movieData.userComment = comment;
            }

            await this.fileService.writeMovieNfo(movieDetail.path, movieData);

            // 更新缓存
            const updatedMovie = this.generateMovieData(movieData, movieDetail.folderName, movieDetail.category, movieDetail.path);
            updatedMovie.poster = movieDetail.poster;
            this.cacheService.updateMovieInCache(updatedMovie);

            // 更新 index.json
            await this.indexService.updateMovieIndex(updatedMovie, movieDetail.category, moviesDir);

            return { success: true };
        } catch (error) {
            console.error('Error saving rating:', error);
            throw error;
        }
    }

    /**
     * 批量切换收藏状态
     * @param {string[]} movieIds - 电影 ID 数组
     * @param {string} moviesDir - 电影目录
     * @returns {Promise<object>} 更新结果
     */
    /**
     * 批量删除电影
     * @param {string[]} movieIds - 电影 ID 数组
     * @param {string} moviesDir - 电影目录
     * @returns {Promise<object>} 删除结果
     */
    async batchDeleteMovies(movieIds, moviesDir) {
        try {
            const results = [];
            for (const movieId of movieIds) {
                const movieDetail = await this.getMovieDetail(movieId, moviesDir);
                if (movieDetail) {
                    await this.fileService.deleteDir(movieDetail.path);
                    // 从缓存中移除
                    this.cacheService.removeMovieFromCache(movieId);
                    // 从 index.json 中移除
                    await this.indexService.deleteMovieFromIndex(movieId, movieDetail.category, moviesDir);
                    results.push({ movieId, deleted: true });
                }
            }
            return { success: true, count: results.length };
        } catch (error) {
            console.error('Error batch deleting movies:', error);
            throw error;
        }
    }

    /**
     * 获取电影统计数据
     * @param {string} category - 分类筛选
     * @param {string} moviesDir - 电影目录
     * @returns {Promise<object>} 统计数据
     */
    async getStats(category, moviesDir) {
        try {
            let movies;
            if (category) {
                movies = await this.getMoviesByCategory(category, moviesDir);
            } else {
                movies = await this.getAllMovies(moviesDir);
            }

            const stats = {
                totalMovies: movies.length,
                avgRating: this.calculateAverageRating(movies)
            };

            return stats;
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    }

    /**
     * 生成完整的电影数据对象
     * @param {object} movieData - 电影 XML nfo 解析后的数据
     * @param {string} folderName - 文件夹名称
     * @param {string} category - 分类
     * @param {string} folderPath - 文件夹路径
     * @returns {object} 完整电影数据
     */
    generateMovieData(movieData, folderName, category, folderPath) {
        // 确保 folderName 有值
        const safeFolderName = folderName || 'unknown';

        // 生成 movieId：格式为 "分类-电影名称"，小写字母
        const movieId = movieData.movieId || this.generateMovieId(category, movieData.title || safeFolderName);

        return {
            id: movieData.id || `${category}-${safeFolderName}`,
            movieId: movieId,
            title: movieData.title || movieData.name || safeFolderName,
            name: movieData.name || movieData.title || '',
            year: movieData.year || '',
            outline: movieData.outline || '',
            description: movieData.description || movieData.outline || '',
            publishDate: movieData.publishDate || movieData.year || '',
            sorttitle: movieData.sorttitle || '',
            runtime: movieData.runtime || '',
            studio: movieData.studio || '',
            director: movieData.director || '',
            actors: movieData.actors || [],
            tag: movieData.tag || [],
            fileinfo: movieData.fileinfo || '',
            original_filename: movieData.original_filename || '',
            category: category,
            userRating: movieData.userRating || 0,
            userComment: movieData.userComment || '',
            tags: movieData.tags || [],
            customTags: movieData.customTags || [],
            notes: movieData.notes || '',
            path: folderPath,
            folderName: safeFolderName,
            fileset: movieData.fileset || [],
            poster: movieData.poster || null
        };
    }

    /**
     * 获取电影海报
     * @param {string} moviePath - 电影路径
     * @returns {Promise<string>} 海报路径或 base64
     */
    async getMoviePoster(moviePath) {
        const posterExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const posterNames = ['poster', 'cover', 'folder', 'movie'];

        for (const name of posterNames) {
            for (const ext of posterExtensions) {
                const posterPath = path.join(moviePath, `${name}${ext}`);
                if (await this.fileService.fileExists(posterPath)) {
                    return posterPath;
                }
            }
        }

        return null;
    }

    /**
     * 获取分类显示名称
     * @param {string} category - 分类标识
     * @returns {string} 显示名称
     */
    getCategoryName(category) {
        // 优先使用 CategoryService
        if (this.categoryService) {
            const name = this.categoryService.getCategoryName(category);
            if (name) return name;
        }
        // 回退到 HardCodeService 默认分类
        const defaultCategories = this.hardCodeService.getDefaultCategories();
        const found = defaultCategories.find(c => c.id === category);
        if (found) return found.name;
        return category;
    }

    /**
     * 获取分类短名称
     * @param {string} category - 分类标识
     * @returns {string} 短名称
     */
    getCategoryShortName(category) {
        // 优先使用 CategoryService
        if (this.categoryService) {
            const shortName = this.categoryService.getCategoryShortName(category);
            if (shortName) return shortName;
        }
        // 回退到 HardCodeService 默认分类
        const defaultCategories = this.hardCodeService.getDefaultCategories();
        const found = defaultCategories.find(c => c.id === category);
        if (found) return found.shortName;
        return category;
    }

    /**
     * 对电影列表进行排序
     * @param {Array} movies - 电影列表
     * @param {string} sortBy - 排序字段
     * @param {string} sortOrder - 排序方向
     * @returns {Array} 排序后的列表
     */
    sortMovies(movies, sortBy = 'name', sortOrder = 'asc') {
        if (!sortBy) {
            return movies;
        }

        const sorted = [...movies];

        sorted.sort((a, b) => {
            let valA, valB;

            switch (sortBy) {
                case 'name':
                    valA = a.title.toLowerCase();
                    valB = b.title.toLowerCase();
                    break;
                case 'rating':
                    valA = a.userRating || 0;
                    valB = b.userRating || 0;
                    break;
                case 'year':
                    valA = a.year || 0;
                    valB = b.year || 0;
                    break;
                default:
                    valA = a.title.toLowerCase();
                    valB = b.title.toLowerCase();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }

    /**
     * 计算平均评分
     * @param {Array} movies - 电影列表
     * @returns {number} 平均评分
     */
    calculateAverageRating(movies) {
        const ratedMovies = movies.filter(m => m.userRating && m.userRating > 0);
        if (ratedMovies.length === 0) return 0;
        const sum = ratedMovies.reduce((acc, m) => acc + m.userRating, 0);
        return (sum / ratedMovies.length).toFixed(1);
    }

    /**
     * 生成电影ID
     * 格式：分类-电影名称（小写字母）
     * @param {string} category - 分类标识
     * @param {string} movieName - 电影名称
     * @returns {string} 电影ID
     */
    generateMovieId(category, movieName) {
        // 去除特殊字符，只保留字母、数字、中文和连字符
        const normalizedName = movieName
            .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-') // 非字母数字中文转为连字符
            .replace(/-+/g, '-') // 多个连字符合并为一个
            .replace(/^-|-$/g, ''); // 去除首尾连字符

        return `${category}-${normalizedName}`;
    }

    /**
     * 生成电影文件夹名称
     * @param {string} movieName - 电影名称
     * @returns {string} 文件夹名称
     */
    generateFolderName(movieName) {
        // 将电影名称转换为小写，去除特殊字符，只保留字母、数字和连字符
        const normalizedName = movieName.toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-') // 非字母数字中文转为连字符
            .replace(/-+/g, '-') // 多个连字符合并为一个
            .replace(/^-|-$/g, ''); // 去除首尾连字符

        return normalizedName;
    }

    /**
     * 添加单个电影
     * @param {object} movieData - 电影数据
     * @param {string} movieData.title - 电影名称
     * @param {string} movieData.description - 电影描述
     * @param {string} movieData.category - 分类
     * @param {string} movieData.year - 发行年份
     * @param {string} movieData.director - 导演
     * @param {string[]} movieData.actors - 演员
     * @param {string} movieData.studio - 制作商
     * @param {string[]} movieData.tags - 标签
     * @param {Array} movieData.fileset - 电影关联文件列表
     * @param {string} coverImagePath - 封面图片路径
     * @param {string} moviesDir - 电影目录
     * @returns {Promise<object>} 创建的电影信息
     */
    async addMovie(movieData, coverImagePath, moviesDir) {
        try {
            const { title, description, category, year, director, actors, studio, tags, fileset } = movieData;

            // 生成电影ID和文件夹名称
            const movieId = this.generateMovieId(category, title);
            const folderName = this.generateFolderName(title);

            // 确保分类目录存在
            const categoryPath = path.join(moviesDir, category);
            await this.fileService.ensureDir(categoryPath);

            // 创建电影文件夹
            const moviePath = path.join(categoryPath, folderName);
            await this.fileService.ensureDir(moviePath);

            // 准备电影数据
            const newMovieData = {
                id: movieId,
                title: title,
                description: description || '',
                category: category,
                year: year || '',
                director: director || '',
                actors: actors || [],
                studio: studio || '',
                tags: tags || [],
                userRating: 0,
                userComment: '',
                fileset: fileset || []
            };

            // 写入 movie.nfo
            await this.fileService.writeMovieNfo(moviePath, newMovieData);

            // 如果有封面图片，复制到电影文件夹
            let poster = null;
            if (coverImagePath) {
                const ext = this.fileService.getFileExtension(coverImagePath);
                const coverDestPath = path.join(moviePath, `cover${ext}`);
                await this.fileService.copyFile(coverImagePath, coverDestPath);
                poster = coverDestPath;
            }

            // 生成电影对象
            const movie = this.generateMovieData(newMovieData, folderName, category, moviePath);
            movie.poster = poster;

            // 添加到缓存
            if (this.cacheService.isCacheInitialized()) {
                this.cacheService.addMovieToCache(movie);
            }

            // 更新 index.json
            await this.indexService.updateMovieIndex(movie, category, moviesDir);

            return {
                success: true,
                movie: movie
            };
        } catch (error) {
            console.error('Error adding movie:', error);
            throw error;
        }
    }

    /**
     * 扫描电影目录
     * @param {string} scanPath - 扫描路径（目录或文件）
     * @param {string} scanType - 扫描类型：'directory' 或 'file'
     * @param {string} category - 分类
     * @param {string} moviesDir - 电影目录
     * @returns {Promise<object>} 扫描结果
     */
    async scanMovieDirectory(scanPath, scanType, category, moviesDir) {
        try {
            let movieNames = [];

            if (scanType === 'directory') {
                // 扫描目录，将子文件夹作为电影名称
                movieNames = await this.fileService.scanDirectoryForMovies(scanPath);
            } else if (scanType === 'file') {
                // 读取文件，每行作为一个电影名称
                movieNames = await this.fileService.readMovieNamesFromFile(scanPath);
            }

            // 生成临时目录路径
            const timestamp = Date.now();
            const tempDir = path.join(moviesDir, `tmp-${timestamp}`);

            // 创建临时目录
            await this.fileService.ensureDir(tempDir);

            // 为每个电影创建临时目录和 movies.json
            const scannedMovies = [];
            for (const name of movieNames) {
                const folderName = this.generateFolderName(name);
                const movieTempDir = path.join(tempDir, folderName);
                await this.fileService.ensureDir(movieTempDir);

                const movieData = {
                    id: this.generateMovieId(category, name),
                    title: name,
                    category: category,
                    folderName: folderName,
                    userRating: 0,
                    userComment: '',
                    description: '',
                    year: '',
                    director: '',
                    actors: [],
                    studio: '',
                    tags: [],
                    fileset: []
                };

                await this.fileService.writeMovieNfo(movieTempDir, movieData);

                scannedMovies.push({
                    name: name,
                    folderName: folderName,
                    tempPath: movieTempDir,
                    movieData: movieData
                });
            }

            // 写入总览文件
            const overviewData = {
                scanTime: new Date().toISOString(),
                scanType: scanType,
                scanPath: scanPath,
                category: category,
                totalMovies: scannedMovies.length,
                movies: scannedMovies.map(m => ({
                    name: m.name,
                    folderName: m.folderName
                }))
            };
            await this.fileService.writeJson(path.join(tempDir, 'movies.json'), overviewData);

            return {
                success: true,
                tempDir: tempDir,
                movies: scannedMovies
            };
        } catch (error) {
            console.error('Error scanning movie directory:', error);
            throw error;
        }
    }

    /**
     * 更新临时电影信息
     * @param {string} tempPath - 临时电影目录路径
     * @param {object} movieData - 电影数据
     * @param {string} coverImagePath - 封面图片路径
     * @returns {Promise<object>} 更新结果
     */
    async updateTempMovie(tempPath, movieData, coverImagePath) {
        try {
            // 读取现有数据
            const existingData = await this.fileService.readMovieNfo(tempPath);

            // 合并数据
            const updatedData = {
                ...existingData,
                ...movieData,
                id: existingData.id || this.generateMovieId(existingData.category, movieData.title || existingData.title),
                title: movieData.title || existingData.title,
                description: movieData.description || existingData.description || '',
                year: movieData.year || existingData.year || '',
                director: movieData.director || existingData.director || '',
                actors: movieData.actors || existingData.actors || [],
                studio: movieData.studio || existingData.studio || '',
                tags: movieData.tags || existingData.tags || [],
                category: movieData.category || existingData.category
            };

            // 写入更新后的数据
            await this.fileService.writeMovieNfo(tempPath, updatedData);

            // 处理封面图片
            let poster = null;
            if (coverImagePath) {
                const ext = this.fileService.getFileExtension(coverImagePath);
                const coverDestPath = path.join(tempPath, `cover${ext}`);
                await this.fileService.copyFile(coverImagePath, coverDestPath);
                poster = coverDestPath;
            }

            return {
                success: true,
                movieData: updatedData,
                poster: poster
            };
        } catch (error) {
            console.error('Error updating temp movie:', error);
            throw error;
        }
    }

    /**
     * 导入扫描的电影到正式目录
     * @param {string} tempDir - 临时目录路径
     * @param {string} moviesDir - 电影目录
     * @returns {Promise<object>} 导入结果
     */
    async importScannedMovies(tempDir, moviesDir) {
        try {
            // 读取总览文件
            const overviewPath = path.join(tempDir, 'movies.json');
            const overview = await this.fileService.readJson(overviewPath);

            if (!overview || !overview.movies) {
                throw new Error('Invalid scan result: movies.json not found or invalid');
            }

            const results = {
                success: 0,
                failed: 0,
                errors: []
            };

            for (const movieInfo of overview.movies) {
                try {
                    const srcPath = path.join(tempDir, movieInfo.folderName);
                    const destPath = path.join(moviesDir, overview.category, movieInfo.folderName);

                    // 检查源目录是否存在
                    const exists = await this.fileService.fileExists(srcPath);
                    if (!exists) {
                        results.failed++;
                        results.errors.push(`电影 "${movieInfo.name}" 临时目录不存在，跳过`);
                        continue;
                    }

                    // 移动目录到目标位置
                    await this.fileService.moveDir(srcPath, destPath);

                    // 读取电影数据
                    const movieData = await this.fileService.readMovieNfo(destPath);

                    // 生成完整的电影对象
                    const movie = this.generateMovieData(movieData, movieInfo.folderName, overview.category, destPath);
                    movie.poster = await this.getMoviePoster(destPath);

                    // 添加到缓存
                    if (this.cacheService.isCacheInitialized()) {
                        this.cacheService.addMovieToCache(movie);
                    }

                    // 更新 index.json
                    await this.indexService.updateMovieIndex(movie, overview.category, moviesDir);

                    results.success++;
                } catch (err) {
                    results.failed++;
                    results.errors.push(`电影 "${movieInfo.name}" 导入失败: ${err.message}`);
                }
            }

            // 删除临时目录
            await this.fileService.deleteDir(tempDir);

            return results;
        } catch (error) {
            console.error('Error importing scanned movies:', error);
            throw error;
        }
    }

    /**
     * 获取临时扫描目录下的电影列表
     * @param {string} tempDir - 临时目录路径
     * @returns {Promise<object[]>} 电影列表
     */
    async getTempScannedMovies(tempDir) {
        try {
            const overviewPath = path.join(tempDir, 'movies.json');
            const overview = await this.fileService.readJson(overviewPath);

            if (!overview || !overview.movies) {
                return [];
            }

            const movies = [];
            for (const movieInfo of overview.movies) {
                const moviePath = path.join(tempDir, movieInfo.folderName);
                const movieData = await this.fileService.readMovieNfo(moviePath);
                if (movieData) {
                    movies.push({
                        ...movieData,
                        tempPath: moviePath
                    });
                }
            }

            return movies;
        } catch (error) {
            console.error('Error getting temp scanned movies:', error);
            return [];
        }
    }

    /**
     * 删除临时扫描目录
     * @param {string} tempDir - 临时目录路径
     */
    async deleteTempScanDir(tempDir) {
        try {
            await this.fileService.deleteDir(tempDir);
            return { success: true };
        } catch (error) {
            console.error('Error deleting temp scan dir:', error);
            throw error;
        }
    }
}

module.exports = MovieService;
