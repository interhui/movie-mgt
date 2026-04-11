/**
 * Tag Commands
 */
const {
    outputTagList,
    outputSuccess,
    outputError
} = require('../utils/output');

/**
 * List all tags
 * @param {object} services - Loaded services
 * @param {object} options - Command options
 */
async function listTags(services, options = {}) {
    try {
        const { tagService, getMoviesDir, movieService } = services;
        const moviesDir = getMoviesDir();

        const tags = await tagService.loadTags();

        // Get movie count for each tag
        const tagData = [];
        for (const tag of tags) {
            const movies = await movieService.searchMovies('', moviesDir, { tagId: tag.id });
            tagData.push({
                ...tag,
                movieCount: movies.length
            });
        }

        if (options.format === 'json') {
            console.log(JSON.stringify(tagData, null, 2));
        } else {
            outputTagList(tagData);
        }
    } catch (error) {
        outputError(`获取标签列表失败: ${error.message}`);
        throw error;
    }
}

/**
 * Create a new tag
 * @param {object} services - Loaded services
 * @param {string} tagId - Tag ID
 * @param {string} tagName - Tag name
 */
async function createTag(services, tagId, tagName) {
    try {
        const { tagService } = services;

        const tags = await tagService.loadTags();

        // Check if tag already exists
        if (tags.find(t => t.id === tagId)) {
            outputError('标签已存在', `ID: ${tagId}`);
            return;
        }

        tags.push({ id: tagId, name: tagName });
        await tagService.saveTags(tags);

        outputSuccess('标签创建成功', {
            'ID': tagId,
            '名称': tagName
        });
    } catch (error) {
        outputError(`创建标签失败: ${error.message}`);
        throw error;
    }
}

/**
 * Delete a tag
 * @param {object} services - Loaded services
 * @param {string} tagId - Tag ID
 */
async function deleteTag(services, tagId) {
    try {
        const { tagService } = services;

        const tags = await tagService.loadTags();
        const index = tags.findIndex(t => t.id === tagId);

        if (index === -1) {
            outputError('标签不存在', `ID: ${tagId}`);
            return;
        }

        tags.splice(index, 1);
        await tagService.saveTags(tags);

        outputSuccess('标签已删除', { 'ID': tagId });
    } catch (error) {
        outputError(`删除标签失败: ${error.message}`);
        throw error;
    }
}

module.exports = {
    listTags,
    createTag,
    deleteTag
};
