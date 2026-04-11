/**
 * CLI Validation Utilities
 */

/**
 * Validate movie ID format
 * @param {string} movieId - Movie ID
 * @returns {boolean} Is valid
 */
function validateMovieId(movieId) {
    if (!movieId || typeof movieId !== 'string') {
        return false;
    }
    // Movie ID format: category-movieName (e.g., movie-spider-man)
    const parts = movieId.split('-');
    return parts.length >= 2;
}

/**
 * Validate category ID
 * @param {string} categoryId - Category ID
 * @param {Array} validCategories - Valid category list
 * @returns {boolean} Is valid
 */
function validateCategory(categoryId, validCategories = []) {
    if (!categoryId || typeof categoryId !== 'string') {
        return false;
    }
    if (validCategories.length === 0) {
        return true; // Skip validation if no valid categories provided
    }
    return validCategories.includes(categoryId);
}

/**
 * Validate rating value
 * @param {number} rating - Rating value
 * @returns {boolean} Is valid
 */
function validateRating(rating) {
    const num = parseInt(rating, 10);
    return !isNaN(num) && num >= 0 && num <= 5;
}

/**
 * Validate status value
 * @param {string} status - Status value
 * @returns {boolean} Is valid
 */
function validateStatus(status) {
    const validStatuses = ['unplayed', 'playing', 'completed'];
    return validStatuses.includes(status);
}

/**
 * Validate movie data for import
 * @param {object} movieData - Movie data
 * @param {Array} validCategories - Valid category list
 * @returns {object} Validation result
 */
function validateMovieData(movieData, validCategories = []) {
    const errors = [];

    if (!movieData.name || typeof movieData.name !== 'string') {
        errors.push('缺少必填字段 name');
    }

    if (!movieData.category || typeof movieData.category !== 'string') {
        errors.push('缺少必填字段 category');
    } else if (validCategories.length > 0 && !validCategories.includes(movieData.category)) {
        errors.push(`分类 "${movieData.category}" 不存在`);
    }

    if (movieData.publishDate && !isValidDate(movieData.publishDate)) {
        errors.push('发行日期格式错误（应为 YYYY-MM-DD）');
    }

    if (movieData.userRating && !validateRating(movieData.userRating)) {
        errors.push('评分必须在 0-5 之间');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate date string format
 * @param {string} dateStr - Date string
 * @returns {boolean} Is valid
 */
function isValidDate(dateStr) {
    if (!dateStr) return false;
    // YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
}

/**
 * Parse tags from comma-separated string
 * @param {string} tagsStr - Tags string
 * @returns {Array} Tag array
 */
function parseTags(tagsStr) {
    if (!tagsStr) return [];
    return tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
}

module.exports = {
    validateMovieId,
    validateCategory,
    validateRating,
    validateStatus,
    validateMovieData,
    isValidDate,
    parseTags
};
