/**
 * Category Commands
 */
const {
    outputCategoryList,
    outputTagList,
    outputStats,
    outputError
} = require('../utils/output');

/**
 * List all categories
 * @param {object} services - Loaded services
 * @param {object} options - Command options
 */
async function listCategories(services, options = {}) {
    try {
        const { categoryService, fileService, getMoviesDir } = services;
        const moviesDir = getMoviesDir();

        const categories = await categoryService.loadCategories();

        // Get movie counts for each category
        const categoryData = [];
        for (const category of categories) {
            const categoryPath = path.join(moviesDir, category.id);
            let movieCount = 0;
            try {
                if (await fileService.fileExists(categoryPath)) {
                    const folders = await fileService.getMovieFolders(categoryPath);
                    movieCount = Object.keys(folders).length;
                }
            } catch (e) {
                // Ignore errors
            }
            categoryData.push({
                ...category,
                movieCount
            });
        }

        if (options.format === 'json') {
            console.log(JSON.stringify(categoryData, null, 2));
        } else {
            outputCategoryList(categoryData);
        }
    } catch (error) {
        outputError(`获取分类列表失败: ${error.message}`);
        throw error;
    }
}

/**
 * Show category detail
 * @param {object} services - Loaded services
 * @param {string} categoryId - Category ID
 */
async function showCategory(services, categoryId) {
    try {
        const { categoryService } = services;

        const category = categoryService.getCategoryById(categoryId);

        if (!category) {
            outputError('分类不存在', `ID: ${categoryId}`);
            return;
        }

        console.log('\n分类详情:');
        console.log(`  ID: ${category.id}`);
        console.log(`  名称: ${category.name}`);
        console.log(`  缩写: ${category.shortName || '-'}`);
        console.log(`  图标: ${category.icon || '-'}`);
        console.log(`  颜色: ${category.color || '-'}`);
    } catch (error) {
        outputError(`获取分类详情失败: ${error.message}`);
        throw error;
    }
}

const path = require('path');

module.exports = {
    listCategories,
    showCategory
};
