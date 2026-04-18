/**
 * MovieCacheService 单元测试
 */
const MovieCacheService = require('../../src/main/services/MovieCacheService');

describe('MovieCacheService', () => {
    let service;
    let testMovies;

    beforeEach(() => {
        service = new MovieCacheService();
        testMovies = [
            {
                id: 'movie-1',
                name: 'Action Movie',
                title: 'Action Movie',
                category: 'movie',
                userRating: 5,
                tags: ['action'],
                actors: ['李连杰', '成龙'],
                year: 2024
            },
            {
                id: 'movie-2',
                name: 'Drama Movie',
                title: 'Drama Movie',
                category: 'movie',
                userRating: 3,
                tags: ['drama'],
                actors: ['周星驰', '刘亦菲'],
                year: 2023
            },
            {
                id: 'movie-3',
                name: 'TV Show',
                title: 'TV Show',
                category: 'tv',
                userRating: 4,
                tags: ['drama'],
                actors: ['李连杰', '周星驰'],
                year: 2024
            }
        ];
    });

    describe('constructor', () => {
        test('SVC-CACHE-001: 创建实例', () => {
            expect(service).toBeDefined();
            expect(service.cache).toBeNull();
            expect(service.isInitialized).toBe(false);
        });
    });

    describe('initializeCache', () => {
        test('SVC-CACHE-002: 正确初始化缓存', () => {
            service.initializeCache(testMovies, '/movies');
            expect(service.isCacheInitialized()).toBe(true);
            expect(service.getAllMovies()).toHaveLength(3);
        });

        test('SVC-CACHE-003: 能获取所有电影', () => {
            service.initializeCache(testMovies, '/movies');
            expect(service.getAllMovies()).toHaveLength(3);
        });

        test('SVC-CACHE-004: 能按分类获取', () => {
            service.initializeCache(testMovies, '/movies');
            const movieCategory = service.getMoviesByCategory('movie');
            expect(movieCategory).toHaveLength(2);
        });

        test('SVC-CACHE-005: 能通过ID获取', () => {
            service.initializeCache(testMovies, '/movies');
            const movie = service.getMovieById('movie-1');
            expect(movie).toBeDefined();
            expect(movie.title).toBe('Action Movie');
        });
    });

    describe('isCacheInitialized / isCacheEmpty', () => {
        test('SVC-CACHE-006: 未初始化返回正确状态', () => {
            expect(service.isCacheInitialized()).toBe(false);
            expect(service.isCacheEmpty()).toBe(true);
        });

        test('SVC-CACHE-007: 初始化后返回正确状态', () => {
            service.initializeCache(testMovies, '/movies');
            expect(service.isCacheInitialized()).toBe(true);
            expect(service.isCacheEmpty()).toBe(false);
        });
    });

    describe('getCacheInfo', () => {
        test('SVC-CACHE-008: 未初始化返回null', () => {
            expect(service.getCacheInfo()).toBeNull();
        });

        test('SVC-CACHE-009: 返回缓存统计', () => {
            service.initializeCache(testMovies, '/movies');
            const info = service.getCacheInfo();
            expect(info.totalMovies).toBe(3);
            expect(info.categoryCount).toBe(2);
            expect(info.moviesDir).toBe('/movies');
        });
    });

    describe('clearCache', () => {
        test('SVC-CACHE-010: 清空缓存', () => {
            service.initializeCache(testMovies, '/movies');
            service.clearCache();
            expect(service.isCacheInitialized()).toBe(false);
            expect(service.getAllMovies()).toBeNull();
        });
    });

    describe('addMovieToCache', () => {
        test('SVC-CACHE-011: 添加电影成功', () => {
            service.initializeCache([testMovies[0]], '/movies');
            service.addMovieToCache(testMovies[1]);
            expect(service.getAllMovies()).toHaveLength(2);
        });

        test('SVC-CACHE-012: 未初始化抛错误', () => {
            expect(() => service.addMovieToCache(testMovies[0])).toThrow();
        });
    });

    describe('updateMovieInCache', () => {
        test('SVC-CACHE-013: 更新电影成功', () => {
            service.initializeCache(testMovies, '/movies');
            const updated = { ...testMovies[0], title: 'Updated Title' };
            service.updateMovieInCache(updated);
            expect(service.getMovieById('movie-1').title).toBe('Updated Title');
        });

        test('SVC-CACHE-014: 电影不存在抛错误', () => {
            service.initializeCache([testMovies[0]], '/movies');
            const notExists = { id: 'not-exists', title: 'Not Exists', category: 'movie' };
            expect(() => service.updateMovieInCache(notExists)).toThrow();
        });
    });

    describe('removeMovieFromCache', () => {
        test('SVC-CACHE-015: 移除电影成功', () => {
            service.initializeCache(testMovies, '/movies');
            service.removeMovieFromCache('movie-1');
            expect(service.getAllMovies()).toHaveLength(2);
            expect(service.getMovieById('movie-1')).toBeNull();
        });

        test('SVC-CACHE-016: 移除不存在不报错', () => {
            service.initializeCache(testMovies, '/movies');
            expect(() => service.removeMovieFromCache('not-exists')).not.toThrow();
        });
    });

    describe('searchMovies', () => {
        beforeEach(() => {
            service.initializeCache(testMovies, '/movies');
        });

        test('SVC-CACHE-017: 关键字搜索', () => {
            const results = service.searchMovies('Action');
            expect(results.length).toBe(1);
            expect(results[0].title).toBe('Action Movie');
        });

        test('SVC-CACHE-018: 分类筛选', () => {
            const results = service.searchMovies(null, { category: 'movie' });
            expect(results.length).toBe(2);
        });

        test('SVC-CACHE-019: 标签筛选', () => {
            const results = service.searchMovies(null, { tagId: 'action' });
            expect(results.length).toBe(1);
            expect(results[0].tags).toContain('action');
        });

        test('SVC-CACHE-021: 评分筛选', () => {
            const results = service.searchMovies(null, { rating: 5 });
            expect(results.length).toBe(1);
            expect(results[0].userRating).toBe(5);
        });

        test('SVC-CACHE-022: 无匹配返回空', () => {
            const results = service.searchMovies(null, { rating: 1 });
            expect(results).toEqual([]);
        });

        test('SVC-CACHE-023: 演员筛选-单演员', () => {
            const results = service.searchMovies(null, { actors: ['李连杰'] });
            expect(results.length).toBe(2);
            expect(results[0].actors).toContain('李连杰');
            expect(results[1].actors).toContain('李连杰');
        });

        test('SVC-CACHE-024: 演员筛选-多演员', () => {
            // OR逻辑：返回包含任一演员的电影
            // movie-1包含李连杰，movie-2包含刘亦菲，movie-3包含李连杰
            const results = service.searchMovies(null, { actors: ['李连杰', '刘亦菲'] });
            expect(results.length).toBe(3);
        });

        test('SVC-CACHE-025: 演员筛选-空数组返回全部', () => {
            const results = service.searchMovies(null, { actors: [] });
            expect(results.length).toBe(3);
        });

        test('SVC-CACHE-026: 演员筛选-无匹配演员返回空', () => {
            const results = service.searchMovies(null, { actors: ['不存在的演员'] });
            expect(results).toEqual([]);
        });

        test('SVC-CACHE-027: 组合筛选-演员+分类', () => {
            const results = service.searchMovies(null, { actors: ['李连杰'], category: 'movie' });
            expect(results.length).toBe(1);
            expect(results[0].title).toBe('Action Movie');
        });

        test('SVC-CACHE-028: 组合筛选-演员+标签', () => {
            // movie-2和movie-3都包含周星驰且标签是drama
            const results = service.searchMovies(null, { actors: ['周星驰'], tagId: 'drama' });
            expect(results.length).toBe(2);
            expect(results.map(r => r.title).sort()).toEqual(['Drama Movie', 'TV Show']);
        });

        test('SVC-CACHE-029: 组合筛选-演员+评分', () => {
            const results = service.searchMovies(null, { actors: ['李连杰'], rating: 5 });
            expect(results.length).toBe(1);
            expect(results[0].userRating).toBe(5);
        });
    });

    describe('sortMovies', () => {
        beforeEach(() => {
            service.initializeCache(testMovies, '/movies');
        });

        test('SVC-CACHE-022: 按名称升序', () => {
            const results = service.sortMovies([...testMovies], 'name', 'asc');
            expect(results[0].title).toBe('Action Movie');
        });

        test('SVC-CACHE-023: 按名称降序', () => {
            const results = service.sortMovies([...testMovies], 'name', 'desc');
            expect(results[0].title).toBe('TV Show');
        });

        test('SVC-CACHE-024: 按评分排序', () => {
            const results = service.sortMovies([...testMovies], 'rating', 'desc');
            expect(results[0].userRating).toBe(5);
        });

        test('SVC-CACHE-025: 空列表返回空', () => {
            const results = service.sortMovies([], 'name', 'asc');
            expect(results).toEqual([]);
        });
    });

    describe('addMoviesToCache / removeMoviesFromCache', () => {
        test('SVC-CACHE-026: 批量添加电影', () => {
            service.initializeCache([testMovies[0]], '/movies');
            service.addMoviesToCache([testMovies[1], testMovies[2]]);
            expect(service.getAllMovies()).toHaveLength(3);
        });

        test('SVC-CACHE-027: 批量移除电影', () => {
            service.initializeCache(testMovies, '/movies');
            service.removeMoviesFromCache(['movie-1', 'movie-2']);
            expect(service.getAllMovies()).toHaveLength(1);
        });
    });

    describe('getMoviesPaginated', () => {
        beforeEach(() => {
            service.initializeCache(testMovies, '/movies');
        });

        test('SVC-CACHE-030: 获取第一页数据', () => {
            const result = service.getMoviesPaginated(1, 2);
            expect(result.movies).toHaveLength(2);
            expect(result.total).toBe(3);
            expect(result.page).toBe(1);
            expect(result.pageSize).toBe(2);
            expect(result.totalPages).toBe(2);
        });

        test('SVC-CACHE-031: 获取第二页数据', () => {
            const result = service.getMoviesPaginated(2, 2);
            expect(result.movies).toHaveLength(1);
            expect(result.total).toBe(3);
            expect(result.page).toBe(2);
        });

        test('SVC-CACHE-032: 最后一页不足pageSize', () => {
            const result = service.getMoviesPaginated(2, 2);
            expect(result.movies).toHaveLength(1);
        });

        test('SVC-CACHE-033: pageSize大于总数据量', () => {
            const result = service.getMoviesPaginated(1, 10);
            expect(result.movies).toHaveLength(3);
            expect(result.totalPages).toBe(1);
        });

        test('SVC-CACHE-034: 带分类筛选的分页', () => {
            const result = service.getMoviesPaginated(1, 10, { category: 'movie' });
            expect(result.movies).toHaveLength(2);
            expect(result.total).toBe(2);
        });

        test('SVC-CACHE-035: 带标签筛选的分页', () => {
            const result = service.getMoviesPaginated(1, 10, { tagId: 'action' });
            expect(result.movies).toHaveLength(1);
            expect(result.movies[0].tags).toContain('action');
        });

        test('SVC-CACHE-036: 带评分筛选的分页', () => {
            const result = service.getMoviesPaginated(1, 10, { rating: 5 });
            expect(result.movies).toHaveLength(1);
            expect(result.movies[0].userRating).toBe(5);
        });

        test('SVC-CACHE-037: 带演员筛选的分页', () => {
            const result = service.getMoviesPaginated(1, 10, { actors: ['李连杰'] });
            expect(result.movies).toHaveLength(2);
        });

        test('SVC-CACHE-038: 组合筛选-演员+分类', () => {
            const result = service.getMoviesPaginated(1, 10, { actors: ['李连杰'], category: 'movie' });
            expect(result.movies).toHaveLength(1);
            expect(result.movies[0].title).toBe('Action Movie');
        });

        test('SVC-CACHE-039: 分页时排序生效', () => {
            // 按评分降序
            const result = service.getMoviesPaginated(1, 10, { sortBy: 'rating', sortOrder: 'desc' });
            expect(result.movies[0].userRating).toBe(5);
        });

        test('SVC-CACHE-040: page为0返回空', () => {
            const result = service.getMoviesPaginated(0, 2);
            expect(result.movies).toHaveLength(0);
        });

        test('SVC-CACHE-041: page超出范围返回空', () => {
            const result = service.getMoviesPaginated(100, 2);
            expect(result.movies).toHaveLength(0);
        });

        test('SVC-CACHE-042: 未初始化缓存返回空', () => {
            const newService = new MovieCacheService();
            const result = newService.getMoviesPaginated(1, 2);
            expect(result.movies).toHaveLength(0);
            expect(result.total).toBe(0);
        });
    });
});
