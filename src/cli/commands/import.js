/**
 * Import Commands
 */
const fs = require('fs');
const path = require('path');
const {
    outputSuccess,
    outputError,
    outputImportResult
} = require('../utils/output');
const { validateMovieData } = require('../utils/validation');

/**
 * Import movies from JSON file
 * @param {object} services - Loaded services
 * @param {string} filePath - JSON file path
 * @param {object} options - Command options
 */
async function importJson(services, filePath, options = {}) {
    try {
        const { movieService, getMoviesDir, categoryService } = services;
        const moviesDir = getMoviesDir();

        // Read JSON file
        if (!fs.existsSync(filePath)) {
            outputError('文件不存在', `路径: ${filePath}`);
            return;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        let moviesData;

        try {
            moviesData = JSON.parse(content);
        } catch (e) {
            outputError('JSON 解析失败', '请检查文件格式是否正确');
            return;
        }

        // Ensure it's an array
        if (!Array.isArray(moviesData)) {
            moviesData = [moviesData];
        }

        // Get valid categories
        const categories = await categoryService.loadCategories();
        const validCategories = categories.map(c => c.id);

        // Validate and import each movie
        const result = {
            success: 0,
            failed: 0,
            errors: []
        };

        console.log(`\n正在导入 ${filePath}...`);

        for (const movieData of moviesData) {
            const validation = validateMovieData(movieData, validCategories);

            if (!validation.valid) {
                result.failed++;
                result.errors.push(`电影 "${movieData.name || '未知'}" : ${validation.errors.join(', ')}`);
                continue;
            }

            try {
                const importResult = await movieService.batchImportMovies([movieData], moviesDir);
                if (importResult.success > 0) {
                    result.success++;
                } else {
                    result.failed++;
                    result.errors.push(`电影 "${movieData.name}" 导入失败`);
                }
            } catch (err) {
                result.failed++;
                result.errors.push(`电影 "${movieData.name}" : ${err.message}`);
            }
        }

        outputImportResult(result);
    } catch (error) {
        outputError(`JSON 导入失败: ${error.message}`);
        throw error;
    }
}

/**
 * Generate JSON import template
 */
function generateTemplate() {
    const template = [
        {
            name: '示例电影',
            category: 'movie',
            description: '电影描述',
            publisher: '发行商',
            publishDate: '2024-01-01',
            developer: '开发商',
            tags: ['action', 'drama']
        }
    ];

    console.log(JSON.stringify(template, null, 2));
}

module.exports = {
    importJson,
    generateTemplate
};
