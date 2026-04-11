/**
 * 主界面逻辑
 */

// 状态管理
const state = {
    categories: [],
    boxes: [],
    movies: [],
    currentCategory: '',
    currentBox: '',
    currentSort: 'name-asc',
    searchKeyword: '',
    viewMode: 'grid',
    settings: {},
    selectedMovies: new Set(),
    detailEditModeLocked: false,
    tags: [],  // 标签缓存
    selectedTags: new Set(),  // 当前选中的标签（用于添加电影）
    sidebarSearchActive: false,  // 侧边栏是否处于搜索激活状态
    currentTag: '',  // 当前选中的标签筛选
    // 文件关联相关
    movieFiles: [],  // 当前电影的关联文件列表
    selectedFileIndex: -1,  // 当前选中的文件索引
    pendingFilePath: '',  // 待添加文件的路径
    // 目录扫描相关
    scanTempDir: '',  // 当前扫描的临时目录
    scanMovies: [],  // 当前扫描的电影列表
    currentEditMovie: null,  // 当前编辑的扫描电影
    // 演员相关
    actors: [],  // 演员列表缓存
    selectedActors: []  // 当前选中的演员（用于添加电影）
};

// DOM 元素
const elements = {
    categoryFilter: document.getElementById('category-filter'),
    sortSelect: document.getElementById('sort-select'),
    tagFilter: document.getElementById('tag-filter'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    viewToggle: document.getElementById('view-toggle'),
    refreshBtn: document.getElementById('refresh-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    categoryList: document.getElementById('category-list'),
    boxList: document.getElementById('box-list'),
    moviesGrid: document.getElementById('movies-grid'),
    emptyState: document.getElementById('empty-state'),
    statsBar: {
        total: document.getElementById('total-movies'),
        played: document.getElementById('played-movies'),
        playing: document.getElementById('playing-movies'),
        unplayed: document.getElementById('unplayed-movies')
    },
    settingsModal: document.getElementById('settings-modal'),
    closeSettings: document.getElementById('close-settings'),
    saveSettings: document.getElementById('save-settings'),
    cancelSettings: document.getElementById('cancel-settings'),
    themeSelect: document.getElementById('theme-select'),
    sidebarWidth: document.getElementById('sidebar-width'),
    posterSize: document.getElementById('poster-size'),
    moviesDirInput: document.getElementById('movies-dir-input'),
    selectDirBtn: document.getElementById('select-dir-btn'),
    movieboxDirInput: document.getElementById('moviebox-dir-input'),
    selectMovieboxDirBtn: document.getElementById('select-moviebox-dir-btn'),
    addBoxBtn: document.getElementById('add-box-btn'),
    boxList: document.getElementById('box-list'),
    createBoxModal: document.getElementById('create-box-modal'),
    boxNameInput: document.getElementById('box-name-input'),
    boxDescriptionInput: document.getElementById('box-description-input'),
    confirmCreateBox: document.getElementById('confirm-create-box'),
    cancelCreateBox: document.getElementById('cancel-create-box'),
    closeCreateBox: document.getElementById('close-create-box'),
    // 编辑盒子相关
    editBoxModal: document.getElementById('edit-box-modal'),
    editBoxNameInput: document.getElementById('edit-box-name-input'),
    editBoxDescriptionInput: document.getElementById('edit-box-description-input'),
    editBoxOriginalName: document.getElementById('edit-box-original-name'),
    confirmEditBox: document.getElementById('confirm-edit-box'),
    cancelEditBox: document.getElementById('cancel-edit-box'),
    closeEditBox: document.getElementById('close-edit-box'),
    // 删除盒子相关
    deleteBoxModal: document.getElementById('delete-box-modal'),
    confirmDeleteBox: document.getElementById('confirm-delete-box'),
    cancelDeleteBox: document.getElementById('cancel-delete-box'),
    closeDeleteBox: document.getElementById('close-delete-box'),
    // 批量添加相关
    batchAddBtn: document.getElementById('batch-add-btn'),
    batchAddModal: document.getElementById('batch-add-modal'),
    batchAddInfo: document.getElementById('batch-add-info'),
    batchBoxSelect: document.getElementById('batch-box-select'),
    confirmBatchAdd: document.getElementById('confirm-batch-add'),
    cancelBatchAdd: document.getElementById('cancel-batch-add'),
    closeBatchAdd: document.getElementById('close-batch-add'),
    // 批量删除相关
    batchDeleteBtn: document.getElementById('batch-delete-btn'),

    // 目录扫描相关
    scanDirBtn: document.getElementById('scan-dir-btn'),

    // 添加电影相关
    addMovieModal: document.getElementById('add-movie-modal'),
    closeAddMovie: document.getElementById('close-add-movie'),
    movieNameInput: document.getElementById('movie-name'),
    movieCategorySelect: document.getElementById('movie-category'),
    moviePublishDate: document.getElementById('movie-publish-date'),
    movieDirector: document.getElementById('movie-director'),
    movieStudio: document.getElementById('movie-publisher'),
    movieActors: document.getElementById('movie-actors'),
    movieDescription: document.getElementById('movie-description'),
    movieTags: document.getElementById('movie-tags'),
    selectCoverBtn: document.getElementById('select-cover-btn'),
    movieCoverInput: document.getElementById('movie-cover-input'),
    coverName: document.getElementById('cover-name'),
    coverPreview: document.getElementById('cover-preview'),
    confirmAddMovie: document.getElementById('confirm-add-movie'),
    cancelAddMovie: document.getElementById('cancel-add-movie'),
    addMovieFooter: document.getElementById('add-movie-footer'),

    // 演员选择相关
    actorSelectorModal: document.getElementById('actor-selector-modal'),
    closeActorSelector: document.getElementById('close-actor-selector'),
    actorSelectorList: document.getElementById('actor-selector-list'),
    confirmActorSelection: document.getElementById('confirm-actor-selection'),
    cancelActorSelection: document.getElementById('cancel-actor-selection'),

    // 电影文件管理相关
    addFileBtn: document.getElementById('add-file-btn'),
    fileList: document.getElementById('file-list'),
    fileDetails: document.getElementById('file-details'),
    fileName: document.getElementById('file-name'),
    fileFullpath: document.getElementById('file-fullpath'),
    fileSize: document.getElementById('file-size'),
    fileType: document.getElementById('file-type'),
    fileMemo: document.getElementById('file-memo'),
    addFileModal: document.getElementById('add-file-modal'),
    closeAddFile: document.getElementById('close-add-file'),
    selectFileBtn: document.getElementById('select-file-btn'),
    fileSelectInput: document.getElementById('file-select-input'),
    selectedFileName: document.getElementById('selected-file-name'),
    selectedFileInfo: document.getElementById('selected-file-info'),
    newFileName: document.getElementById('new-file-name'),
    newFileFullpath: document.getElementById('new-file-fullpath'),
    newFileSize: document.getElementById('new-file-size'),
    newFileType: document.getElementById('new-file-type'),
    newFileMemo: document.getElementById('new-file-memo'),
    confirmAddFile: document.getElementById('confirm-add-file'),
    cancelAddFile: document.getElementById('cancel-add-file'),

    // 目录扫描相关
    scanDirModal: document.getElementById('scan-dir-modal'),
    closeScanDir: document.getElementById('close-scan-dir'),
    scanPathInput: document.getElementById('scan-path-input'),
    selectScanPathBtn: document.getElementById('select-scan-path-btn'),
    scanCategorySelect: document.getElementById('scan-category-select'),
    confirmScanDir: document.getElementById('confirm-scan-dir'),
    cancelScanDir: document.getElementById('cancel-scan-dir'),

    // 扫描结果相关
    scanResultModal: document.getElementById('scan-result-modal'),
    closeScanResult: document.getElementById('close-scan-result'),
    scanResultInfo: document.getElementById('scan-result-info'),
    scanResultImport: document.getElementById('scan-result-import'),
    scanResultCancel: document.getElementById('scan-result-cancel'),
    scanMoviesList: document.getElementById('scan-movies-list'),

    // 单个电影编辑相关
    scanMovieEditModal: document.getElementById('scan-movie-edit-modal'),
    closeScanMovieEdit: document.getElementById('close-scan-movie-edit'),
    scanMovieTempPath: document.getElementById('scan-movie-temp-path'),
    scanMovieName: document.getElementById('scan-movie-name'),
    scanMoviePublishDate: document.getElementById('scan-movie-publish-date'),
    scanMovieDirector: document.getElementById('scan-movie-publisher'),
    scanMovieActors: null,
    scanMovieStudio: null,
    scanMovieDescription: document.getElementById('scan-movie-description'),
    scanSelectCoverBtn: document.getElementById('scan-select-cover-btn'),
    scanMovieCoverInput: document.getElementById('scan-movie-cover-input'),
    scanCoverPreview: document.getElementById('scan-cover-preview'),

    // 扫描电影标签相关
    scanMovieTags: document.getElementById('scan-movie-tags'),
    scanTagSelectorModal: document.getElementById('scan-tag-selector-modal'),
    closeScanTagSelector: document.getElementById('close-scan-tag-selector'),
    scanTagSelectorList: document.getElementById('scan-tag-selector-list'),
    confirmScanTagSelection: document.getElementById('confirm-scan-tag-selection'),
    cancelScanTagSelection: document.getElementById('cancel-scan-tag-selection'),

    confirmScanMovieEdit: document.getElementById('confirm-scan-movie-edit'),
    cancelScanMovieEdit: document.getElementById('cancel-scan-movie-edit')
};

/**
 * 初始化应用
 */
async function init() {
    console.log('Initializing app...');

    // 加载设置
    await loadSettings();

    // 加载标签
    await loadTags();

    // 加载演员列表
    await loadActors();

    // 加载分类列表
    await loadCategories();

    // 加载盒子列表
    await loadBoxes();

    // 加载电影
    await loadMovies();

    // 绑定事件
    bindEvents();

    // 初始化目录扫描事件
    initScanDirEvents();

    // 初始化分隔线拖动
    initSplitter();

    // 加载统计数据
    await loadStats();

    console.log('App initialized');
}

/**
 * 初始化分隔线拖动功能
 */
function initSplitter() {
    const splitter = document.getElementById('main-splitter');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('movie-wall');

    if (!splitter || !sidebar || !mainContent) {
        return;
    }

    let isResizing = false;
    let minWidth = 150;
    let maxWidth = 400;

    splitter.addEventListener('mousedown', (e) => {
        isResizing = true;
        splitter.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const containerRect = sidebar.parentElement.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;

        if (newWidth >= minWidth && newWidth <= maxWidth) {
            sidebar.style.width = `${newWidth}px`;
            sidebar.style.minWidth = `${newWidth}px`;
            document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            splitter.classList.remove('active');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

/**
 * 加载标签缓存
 */
async function loadTags() {
    try {
        const tags = await window.electronAPI.getTags();
        if (Array.isArray(tags)) {
            state.tags = tags;
            updateTagFilter();
        }
    } catch (error) {
        console.error('Error loading tags:', error);
    }
}

/**
 * 更新标签筛选下拉框
 */
function updateTagFilter() {
    elements.tagFilter.innerHTML = '<option value="">全部标签</option>';
    state.tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.id;
        option.textContent = tag.name;
        elements.tagFilter.appendChild(option);
    });
}

/**
 * 加载设置
 */
async function loadSettings() {
    try {
        state.settings = await window.electronAPI.getSettings();

        // 应用主题
        applyTheme(state.settings.appearance.theme);

        // 应用布局设置
        applyLayoutSettings(state.settings.layout);

        // 更新设置表单
        if (elements.themeSelect) elements.themeSelect.value = state.settings.appearance?.theme || 'dark';
        if (elements.sidebarWidth) elements.sidebarWidth.value = state.settings.layout?.sidebarWidth || 200;
        if (elements.posterSize) elements.posterSize.value = state.settings.layout?.posterSize || 'medium';
        if (elements.moviesDirInput) elements.moviesDirInput.value = state.settings.library?.moviesDir || '';
        if (elements.movieboxDirInput) elements.movieboxDirInput.value = state.settings.moviebox?.movieboxDir || '';

        state.viewMode = state.settings.layout.viewMode;
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

/**
 * 应用主题
 */
function applyTheme(theme) {
    // 找到所有 link 标签并找到主题 CSS
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    let themeLink = null;
    for (const link of links) {
        const href = link.getAttribute('href') || '';
        if (href.includes('themes/dark') || href.includes('themes/light')) {
            themeLink = link;
            break;
        }
    }
    if (themeLink) {
        // 替换 href 中的主题文件名
        const currentHref = themeLink.getAttribute('href');
        let newHref;
        if (theme === 'light') {
            newHref = currentHref.replace(/themes\/dark\.css$/, 'themes/light.css');
        } else {
            newHref = currentHref.replace(/themes\/light\.css$/, 'themes/dark.css');
        }
        themeLink.setAttribute('href', newHref);
    }
}

/**
 * 显示Toast提示
 */
function showToast(message, duration = 3000) {
    // 检查是否已存在toast容器
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; pointer-events: none;';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = 'background: rgba(0, 0, 0, 0.85); color: white; padding: 12px 24px; border-radius: 8px; margin-bottom: 8px; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); pointer-events: none;';
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * 应用布局设置
 */
function applyLayoutSettings(layout) {
    document.documentElement.style.setProperty('--sidebar-width', `${layout.sidebarWidth}px`);
    document.documentElement.style.setProperty('--poster-min-width', getPosterMinSize(layout.posterSize));
    document.documentElement.style.setProperty('--poster-max-width', getPosterMaxSize(layout.posterSize));

    // 使用 CSS Grid 的自动填充实现响应式布局
    // 不再使用固定列数，让浏览器根据窗口大小自动计算

    if (layout.viewMode === 'list') {
        elements.moviesGrid.classList.add('list-view');
    } else {
        elements.moviesGrid.classList.remove('list-view');
    }
}

/**
 * 获取海报尺寸
 */
function getPosterSize(size) {
    const sizes = {
        small: '120px',
        medium: '180px',
        large: '240px'
    };
    return sizes[size] || sizes.medium;
}

/**
 * 获取海报最小尺寸（用于自动响应式计算）
 */
function getPosterMinSize(size) {
    const sizes = {
        small: '100px',
        medium: '140px',
        large: '180px'
    };
    return sizes[size] || sizes.medium;
}

/**
 * 获取海报最大尺寸
 */
function getPosterMaxSize(size) {
    const sizes = {
        small: '150px',
        medium: '220px',
        large: '280px'
    };
    return sizes[size] || sizes.medium;
}

/**
 * 加载分类列表
 */
async function loadCategories() {
    try {
        const categories = await window.electronAPI.getCategories();

        if (categories.error) {
            console.error('Error loading categories:', categories.error);
            return;
        }

        state.categories = categories;

        // 更新筛选下拉框
        updateCategoryFilter(categories);

        // 更新侧边栏
        renderSidebar(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * 更新分类筛选下拉框
 */
function updateCategoryFilter(categories) {
    elements.categoryFilter.innerHTML = '<option value="">全部分类</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${category.name} (${category.movieCount})`;
        elements.categoryFilter.appendChild(option);
    });
}

/**
 * 更新侧边栏
 */
function renderSidebar(categories) {
    let html = `
        <li class="category-item active" data-category="">
            <span class="category-name">全部分类</span>
            <span class="movie-count">${getTotalMovieCount(categories)}</span>
        </li>
    `;

    categories.forEach(category => {
        html += `
            <li class="category-item" data-category="${category.id}">
                <span class="category-name">${category.name}</span>
                <span class="movie-count">${category.movieCount}</span>
            </li>
        `;
    });

    elements.categoryList.innerHTML = html;

    // 绑定点击事件
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            setCurrentCategory(item.dataset.category);
        });
    });
}

/**
 * 设置当前分类筛选
 * 统一处理左侧栏和下拉框的分类选择
 */
function setCurrentCategory(category) {
    // 如果有筛选条件被激活，点击分类时清除筛选条件
    if (state.currentTag) {
        state.currentTag = '';
        elements.tagFilter.value = '';
    }

    state.currentCategory = category;
    state.currentBox = ''; // 清除当前盒子

    // 更新左侧栏分类选中状态
    document.querySelectorAll('.category-item').forEach(item => {
        if (item.dataset.category === category) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 清除左侧栏盒子选中状态
    document.querySelectorAll('.box-item').forEach(i => i.classList.remove('active'));

    // 更新下拉框
    elements.categoryFilter.value = category;

    // 加载电影
    loadMovies();
}

/**
 * 获取电影总数
 */
function getTotalMovieCount(platforms) {
    return platforms.reduce((sum, p) => sum + p.movieCount, 0);
}

/**
 * 加载盒子列表
 */
async function loadBoxes() {
    try {
        const boxes = await window.electronAPI.getAllBoxes();
        state.boxes = boxes;
        updateBoxList(boxes);
    } catch (error) {
        console.error('Error loading boxes:', error);
    }
}

/**
 * 更新盒子列表
 */
function updateBoxList(boxes) {
    let html = '';

    boxes.forEach(box => {
        html += `
            <li class="box-item" data-box="${box.name}" data-original-name="${box.originalName || box.name}">
                <span class="box-name">${box.name}</span>
                <span class="box-count">${box.movieCount}</span>
                <div class="box-actions">
                    <button class="box-edit-btn" title="编辑" data-box="${box.originalName || box.name}">✎</button>
                    <button class="box-delete-btn" title="删除" data-box="${box.originalName || box.name}">✖</button>
                </div>
            </li>
        `;
    });

    elements.boxList.innerHTML = html;

    // 绑定盒子点击事件（打开盒子视图）
    document.querySelectorAll('.box-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // 如果点击的是按钮，不处理
            if (e.target.classList.contains('box-edit-btn') || e.target.classList.contains('box-delete-btn')) {
                return;
            }

            // 清除分类选中状态
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));

            // 清除之前的盒子选中状态
            document.querySelectorAll('.box-item').forEach(i => i.classList.remove('active'));

            // 设置当前盒子选中状态
            item.classList.add('active');
            state.currentBox = item.dataset.originalName || item.dataset.box;

            // 打开盒子视图（新窗口）
            openBoxView(state.currentBox);
        });
    });

    // 绑定编辑按钮点击事件
    document.querySelectorAll('.box-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const boxOriginalName = btn.dataset.box;
            openEditBoxModal(boxOriginalName);
        });
    });

    // 绑定删除按钮点击事件
    document.querySelectorAll('.box-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const boxOriginalName = btn.dataset.box;
            openDeleteBoxModal(boxOriginalName);
        });
    });
}

/**
 * 打开编辑盒子模态框
 */
async function openEditBoxModal(boxOriginalName) {
    try {
        const boxDetail = await window.electronAPI.getBoxDetail(boxOriginalName);
        if (boxDetail && !boxDetail.error) {
            document.getElementById('edit-box-original-name').value = boxOriginalName;
            document.getElementById('edit-box-name-input').value = boxDetail.name || boxOriginalName;
            document.getElementById('edit-box-description-input').value = boxDetail.description || '';
            elements.editBoxModal.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error opening edit box modal:', error);
    }
}

/**
 * 打开删除盒子确认模态框
 */
function openDeleteBoxModal(boxName) {
    document.getElementById('delete-box-name').textContent = boxName;
    elements.deleteBoxModal.style.display = 'flex';
}

/**
 * 打开盒子视图（新窗口）
 */
async function openBoxView(boxName) {
    try {
        await window.electronAPI.openBoxWindow(boxName);
    } catch (error) {
        console.error('Error opening box view:', error);
    }
}

/**
 * 加载电影列表
 */
async function loadMovies() {
    try {
        let movies;

        // 构建筛选条件
        const filterOptions = {
            sortBy: state.currentSort.split('-')[0],
            sortOrder: state.currentSort.split('-')[1],
            tagId: state.currentTag || undefined
        };

        if (state.searchKeyword) {
            // 搜索电影
            movies = await window.electronAPI.searchMovies({
                keyword: state.searchKeyword,
                filters: {
                    category: state.currentCategory,
                    sort: state.currentSort,
                    favorite: filterOptions.favorite,
                    tagId: filterOptions.tagId,
                    rating: filterOptions.rating
                }
            });
        } else if (state.currentCategory) {
            // 按分类加载
            movies = await window.electronAPI.getMoviesByCategory({
                category: state.currentCategory,
                sortBy: filterOptions.sortBy,
                sortOrder: filterOptions.sortOrder,
                favorite: filterOptions.favorite,
                tagId: filterOptions.tagId,
                rating: filterOptions.rating
            });
        } else {
            // 加载所有电影
            movies = await window.electronAPI.getAllMovies({
                sortBy: filterOptions.sortBy,
                sortOrder: filterOptions.sortOrder,
                favorite: filterOptions.favorite,
                tagId: filterOptions.tagId,
                rating: filterOptions.rating
            });
        }

        if (movies.error) {
            console.error('Error loading movies:', movies.error);
            return;
        }

        state.movies = movies;
        renderMovies(movies);

        // 检查是否有任何筛选条件激活
        const filtersActive = state.searchKeyword || state.currentTag;

        // 更新侧边栏分类计数
        if (filtersActive) {
            updateSidebarWithSearchResults(movies);
            state.sidebarSearchActive = true;
        } else if (state.sidebarSearchActive) {
            // 清除筛选后恢复原始侧边栏
            updateSidebar(state.categories);
            state.sidebarSearchActive = false;
        }
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

/**
 * 根据搜索结果更新侧边栏分类计数
 */
function updateSidebarWithSearchResults(movies) {
    // 按分类分组统计电影数量
    const platformCounts = {};
    movies.forEach(movie => {
        const categoryId = movie.category;
        platformCounts[platformId] = (platformCounts[platformId] || 0) + 1;
    });

    // 构建更新后的分类列表
    const totalCount = movies.length;
    let html = `
        <li class="category-item active" data-category="">
            <span class="category-name">全部分类</span>
            <span class="movie-count">${totalCount}</span>
        </li>
    `;

    state.categories.forEach(category => {
        const count = categoryCounts[category.id] || 0;
        // 只有有电影的分类才显示
        if (count > 0) {
            html += `
                <li class="category-item" data-category="${category.id}">
                    <span class="category-name">${category.name}</span>
                    <span class="movie-count">${count}</span>
                </li>
            `;
        }
    });

    elements.platformList.innerHTML = html;

    // 重新绑定点击事件
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            setCurrentCategory(item.dataset.category);
        });
    });
}

/**
 * 根据分类ID获取分类名称
 * @param {string} categoryId - 分类ID
 * @returns {string} 分类名称
 */
function getCategoryName(categoryId) {
    if (!categoryId) return '';
    const category = state.categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
}

/**
 * 渲染电影列表
 */
function renderMovies(movies) {
    if (!movies || movies.length === 0) {
        elements.moviesGrid.innerHTML = '';
        elements.emptyState.style.display = 'flex';
        return;
    }

    elements.emptyState.style.display = 'none';

    let html = '';

    if (state.viewMode === 'list') {
        // 列表视图 - 表格形式
        html += `
            <div class="list-view-header">
                <div class="movie-checkbox">
                    <input type="checkbox" id="select-all" ${state.selectedMovies.size === movies.length && movies.length > 0 ? 'checked' : ''}>
                </div>
                <div class="movie-icon"></div>
                <div class="movie-id-col">电影ID</div>
                <div class="movie-name">名称</div>
                <div class="movie-actors-col">主演</div>
                <div class="movie-description">描述</div>
                <div class="movie-publish-date">上映时间</div>
                <div class="movie-studio-col">发行商</div>
                <div class="movie-category-info">分类</div>
                <div class="movie-director-col">导演</div>
                <div class="movie-files-col">文件</div>
                <div class="movie-rating">评分</div>
            </div>
        `;
    }

    html += movies.map(movie => {
        const isSelected = state.selectedMovies.has(movie.id);

        if (state.viewMode === 'list') {
            // 列表视图 - 表格行
            const fileCount = movie.fileCount || 0;
            return `
                <div class="movie-card ${isSelected ? 'selected' : ''}" data-movie-id="${movie.id}">
                    <div class="movie-checkbox">
                        <input type="checkbox" class="movie-select-checkbox" data-movie-id="${movie.id}" ${isSelected ? 'checked' : ''}>
                    </div>
                    <div class="movie-icon">
                        ${movie.poster ?
                            `<img src="${movie.poster}" alt="${movie.name}">` :
                            `<div class="movie-icon-placeholder">🎬</div>`
                        }
                    </div>
                    <div class="movie-id-col">
                        ${movie.movieId || ''}
                    </div>
                    <div class="movie-name">
                        ${movie.favorite ? '<span class="movie-favorite">❤️</span>' : ''}
                        ${movie.name}
                    </div>
                    <div class="movie-actors-col">${movie.actors || '-'}</div>
                    <div class="movie-description">${movie.description ? (movie.description.length > 30 ? movie.description.substring(0, 30) + '...' : movie.description) : '-'}</div>
                    <div class="movie-publish-date">${movie.publishDate || '-'}</div>
                    <div class="movie-studio-col">${movie.studio || '-'}</div>
                    <div class="movie-category-info">${getCategoryName(movie.category)}</div>
                    <div class="movie-director-col">${movie.director || '-'}</div>
                    <div class="movie-files-col">${fileCount > 0 ? '📁 ' + fileCount : '-'}</div>
                    <div class="movie-rating">${movie.userRating ? '⭐'.repeat(movie.userRating) : '-'}</div>
                </div>
            `;
        } else {
            // 网格视图
            return `
                <div class="movie-card ${isSelected ? 'selected' : ''}" data-movie-id="${movie.id}">
                    <div class="movie-card-checkbox">
                        <input type="checkbox" class="movie-select-checkbox" data-movie-id="${movie.id}" ${isSelected ? 'checked' : ''}>
                    </div>
                    ${movie.poster ?
                        `<img class="movie-poster" src="${movie.poster}" alt="${movie.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="movie-poster-placeholder" style="display:none;">🎬</div>` :
                        `<div class="movie-poster-placeholder">🎬</div>`
                    }
                    <div class="movie-info">
                        <div class="movie-name">${movie.name}</div>
                        <div class="movie-extra">${movie.actors || '-'}</div>
                    </div>
                    ${(movie.year || movie.publishDate) ? `<div class="movie-year">${movie.year || movie.publishDate}</div>` : ''}
                </div>
            `;
        }
    }).join('');

    elements.moviesGrid.innerHTML = html;

    // 绑定电影卡片点击事件（排除复选框）
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // 如果点击的是复选框，不打开详情
            if (e.target.type === 'checkbox') return;
            const movieId = card.dataset.movieId;
            openMovieDetail(movieId);
        });
    });

    // 绑定复选框事件
    bindCheckboxEvents(movies);
}

/**
 * 绑定复选框事件
 */
function bindCheckboxEvents(movies) {
    // 全选复选框
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                movies.forEach(movie => state.selectedMovies.add(movie.id));
            } else {
                state.selectedMovies.clear();
            }
            renderMovies(movies);
            updateBatchAddButtonVisibility();
            updateBatchDeleteButtonVisibility();
        });
    }

    // 单个复选框
    document.querySelectorAll('.movie-select-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const movieId = checkbox.dataset.movieId;
            if (checkbox.checked) {
                state.selectedMovies.add(movieId);
            } else {
                state.selectedMovies.delete(movieId);
            }

            // 更新卡片选中状态
            const card = checkbox.closest('.movie-card');
            if (checkbox.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }

            // 更新全选复选框状态
            const selectAll = document.getElementById('select-all');
            if (selectAll) {
                selectAll.checked = state.selectedMovies.size === movies.length && movies.length > 0;
            }

            // 更新批量添加按钮可见性
            updateBatchAddButtonVisibility();
            updateBatchDeleteButtonVisibility();
        });
    });

    // 列表视图中的行点击可选中（点击复选框不触发）
    document.querySelectorAll('.movies-grid.list-view .movie-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // 如果点击的是复选框，不处理
            if (e.target.type === 'checkbox') return;

            const movieId = card.dataset.movieId;
            if (state.selectedMovies.has(movieId)) {
                state.selectedMovies.delete(movieId);
                card.classList.remove('selected');
            } else {
                state.selectedMovies.add(movieId);
                card.classList.add('selected');
            }

            // 更新复选框状态
            const checkbox = card.querySelector('.movie-select-checkbox');
            if (checkbox) {
                checkbox.checked = state.selectedMovies.has(movieId);
            }

            // 更新全选复选框状态
            const selectAll = document.getElementById('select-all');
            if (selectAll) {
                selectAll.checked = state.selectedMovies.size === movies.length && movies.length > 0;
            }

            // 更新批量添加按钮可见性
            updateBatchAddButtonVisibility();
            updateBatchDeleteButtonVisibility();
        });
    });
}

/**
 * 更新批量添加按钮可见性
 */
function updateBatchAddButtonVisibility() {
    if (state.selectedMovies.size > 0) {
        elements.batchAddBtn.style.display = 'block';
        elements.batchAddBtn.textContent = `批量添加 (${state.selectedMovies.size})`;
    } else {
        elements.batchAddBtn.style.display = 'none';
    }
}

/**
 * 更新批量删除按钮可见性
 */
function updateBatchDeleteButtonVisibility() {
    if (state.selectedMovies.size > 0) {
        elements.batchDeleteBtn.style.display = 'block';
        elements.batchDeleteBtn.textContent = `批量删除 (${state.selectedMovies.size})`;
    } else {
        elements.batchDeleteBtn.style.display = 'none';
    }
}

/**
 * 获取分类名称
 */
function getPlatformName(platformId) {
    const category = state.categories.find(c => c.id === categoryId);
    return category ? category.shortName : categoryId;
}

/**
 * 打开电影详情
 */
async function openMovieDetail(movieId) {
    // 检查详情窗口是否处于编辑模式，锁定状态下禁止点击
    if (state.detailEditModeLocked) {
        return;
    }
    try {
        const movie = state.movies.find(m => m.id === movieId);
        if (movie) {
            await window.electronAPI.openMovieDetail(movie);
        }
    } catch (error) {
        console.error('Error opening movie detail:', error);
    }
}

/**
 * 加载统计数据
 */
async function loadStats() {
    try {
        const stats = await window.electronAPI.getMovieStats();

        if (stats.error) {
            console.error('Error loading stats:', stats.error);
            return;
        }

        elements.statsBar.total.textContent = `电影总数：${stats.totalMovies || 0}`;
        elements.statsBar.played.textContent = `已看：${stats.watchedCount || 0}`;
        elements.statsBar.playing.textContent = `观看中：${stats.watchingCount || 0}`;
        elements.statsBar.unplayed.textContent = `未看：${stats.unwatchedCount || 0}`;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 分类筛选
    elements.categoryFilter.addEventListener('change', (e) => {
        setCurrentCategory(e.target.value);
    });

    // 排序
    elements.sortSelect.addEventListener('change', (e) => {
        state.currentSort = e.target.value;
        loadMovies();
    });

    // 标签筛选
    elements.tagFilter.addEventListener('change', (e) => {
        state.currentTag = e.target.value;
        loadMovies();
    });

    // 搜索
    elements.searchBtn.addEventListener('click', () => {
        state.searchKeyword = elements.searchInput.value.trim();
        loadMovies();
        updateClearButtonVisibility();
    });

    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            state.searchKeyword = e.target.value.trim();
            loadMovies();
            updateClearButtonVisibility();
        }
    });

    // 清除搜索
    elements.clearSearchBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.searchKeyword = '';
        loadMovies();
        updateClearButtonVisibility();
    });

    // 更新清除按钮可见性
    function updateClearButtonVisibility() {
        if (state.searchKeyword) {
            elements.clearSearchBtn.style.display = 'block';
        } else {
            elements.clearSearchBtn.style.display = 'none';
        }
    }

    // 视图切换
    elements.viewToggle.addEventListener('click', () => {
        state.viewMode = state.viewMode === 'grid' ? 'list' : 'grid';
        elements.moviesGrid.classList.toggle('list-view');
        renderMovies(state.movies);
    });

    // 清除所有筛选条件
    function clearAllFilters() {
        // 清除状态变量
        state.searchKeyword = '';
        state.currentTag = '';
        state.currentCategory = '';

        // 清除UI元素
        elements.searchInput.value = '';
        elements.tagFilter.value = '';
        elements.categoryFilter.value = '';
        elements.clearSearchBtn.style.display = 'none';

        // 更新左侧栏分类选中状态为"全部分类"
        document.querySelectorAll('.category-item').forEach(item => {
            if (item.dataset.platform === '') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 清除左侧栏盒子选中状态
        document.querySelectorAll('.box-item').forEach(i => i.classList.remove('active'));
    }

    // 刷新电影库按钮
    elements.refreshBtn.addEventListener('click', () => {
        clearAllFilters();
        loadCategories();
        loadMovies();
        loadStats();
    });

    // 设置按钮
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.style.display = 'flex';
    });

    // 关闭设置
    elements.closeSettings.addEventListener('click', () => {
        elements.settingsModal.style.display = 'none';
    });

    elements.cancelSettings.addEventListener('click', () => {
        elements.settingsModal.style.display = 'none';
    });

    // 保存设置
    elements.saveSettings.addEventListener('click', saveSettingsHandler);

    // 选择目录
    elements.selectDirBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.selectDirectory();
        if (!result.canceled && result.path) {
            elements.moviesDirInput.value = result.path;
        }
    });

    // 选择电影盒子目录
    elements.selectMovieboxDirBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.selectDirectory();
        if (!result.canceled && result.path) {
            elements.movieboxDirInput.value = result.path;
        }
    });

    // 监听刷新事件
    window.electronAPI.onRefreshLibrary(() => {
        clearAllFilters();
        loadCategories();
        loadMovies();
        loadStats();
    });

    // 监听详情窗口编辑模式变化（锁定/解锁电影卡片点击）
    window.electronAPI.onDetailEditModeChanged((isEditing) => {
        state.detailEditModeLocked = isEditing;
    });

    // 监听盒子更新事件
    window.electronAPI.onBoxUpdated(() => {
        loadBoxes();
    });

    // 监听设置事件
    window.electronAPI.onOpenSettings(() => {
        elements.settingsModal.style.display = 'flex';
    });

    // 监听添加电影事件
    window.electronAPI.onOpenAddMovie(() => {
        // 如果模态框正在显示，先隐藏它以重置状态
        if (elements.addMovieModal.style.display === 'flex') {
            elements.addMovieModal.style.display = 'none';
        }
        // 清除当前焦点状态，防止之前的焦点状态干扰
        if (document.activeElement) {
            document.activeElement.blur();
        }
        resetAddMovieForm();
        populateCategorySelect();
        populateTagsSelect();
        elements.addMovieModal.style.display = 'flex';
        // 使用 requestAnimationFrame 确保在下一帧设置焦点，此时模态框已完全显示
        requestAnimationFrame(() => {
            // 重新获取元素引用确保是最新的
            const movieNameInput = document.getElementById('movie-name');
            if (movieNameInput) {
                movieNameInput.focus();
            }
        });
        // 作为保底方案，50ms 后再次尝试设置焦点
        setTimeout(() => {
            const movieNameInput = document.getElementById('movie-name');
            if (movieNameInput && document.activeElement !== movieNameInput) {
                movieNameInput.focus();
            }
        }, 50);
    });

    // 监听主题变化
    window.electronAPI.onThemeChanged((theme) => {
        applyTheme(theme);
    });

    // 点击模态框外部关闭
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            elements.settingsModal.style.display = 'none';
        }
    });

    // 创建盒子按钮
    elements.addBoxBtn.addEventListener('click', () => {
        elements.boxNameInput.value = '';
        elements.createBoxModal.style.display = 'flex';
        elements.boxNameInput.focus();
    });

    // 确认创建盒子
    elements.confirmCreateBox.addEventListener('click', async () => {
        const boxName = elements.boxNameInput.value.trim();
        const description = elements.boxDescriptionInput.value.trim();

        if (!boxName) {
            alert('请输入盒子名称');
            return;
        }

        try {
            const result = await window.electronAPI.createBox({ boxName, description });

            if (!result.error) {
                elements.createBoxModal.style.display = 'none';
                elements.boxNameInput.value = '';
                elements.boxDescriptionInput.value = '';
                await loadBoxes();
            } else {
                alert('创建失败: ' + result.error);
            }
        } catch (error) {
            console.error('Error creating box:', error);
            alert('创建失败: ' + error.message);
        }
    });

    // 取消创建盒子
    elements.cancelCreateBox.addEventListener('click', () => {
        elements.createBoxModal.style.display = 'none';
    });

    // 关闭创建盒子模态框
    elements.closeCreateBox.addEventListener('click', () => {
        elements.createBoxModal.style.display = 'none';
    });

    // 点击模态框外部关闭
    elements.createBoxModal.addEventListener('click', (e) => {
        if (e.target === elements.createBoxModal) {
            elements.createBoxModal.style.display = 'none';
        }
    });

    // ==================== 编辑盒子相关事件 ====================

    // 确认编辑盒子
    elements.confirmEditBox.addEventListener('click', async () => {
        const originalName = elements.editBoxOriginalName.value;
        const newName = elements.editBoxNameInput.value.trim();
        const description = elements.editBoxDescriptionInput.value.trim();

        if (!newName) {
            alert('请输入盒子名称');
            return;
        }

        try {
            const result = await window.electronAPI.updateBox({ boxName: originalName, newName, description });

            if (!result.error) {
                elements.editBoxModal.style.display = 'none';
                await loadBoxes();
            } else {
                alert('编辑失败: ' + result.error);
            }
        } catch (error) {
            console.error('Error editing box:', error);
            alert('编辑失败: ' + error.message);
        }
    });

    // 取消编辑盒子
    elements.cancelEditBox.addEventListener('click', () => {
        elements.editBoxModal.style.display = 'none';
    });

    // 关闭编辑盒子模态框
    elements.closeEditBox.addEventListener('click', () => {
        elements.editBoxModal.style.display = 'none';
    });

    // 点击编辑模态框外部关闭
    elements.editBoxModal.addEventListener('click', (e) => {
        if (e.target === elements.editBoxModal) {
            elements.editBoxModal.style.display = 'none';
        }
    });

    // ==================== 删除盒子相关事件 ====================

    // 确认删除盒子
    elements.confirmDeleteBox.addEventListener('click', async () => {
        const deleteBoxName = document.getElementById('delete-box-name').textContent;

        try {
            const result = await window.electronAPI.deleteBox(deleteBoxName);

            if (!result.error) {
                elements.deleteBoxModal.style.display = 'none';
                await loadBoxes();
            } else {
                alert('删除失败: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting box:', error);
            alert('删除失败: ' + error.message);
        }
    });

    // 取消删除盒子
    elements.cancelDeleteBox.addEventListener('click', () => {
        elements.deleteBoxModal.style.display = 'none';
    });

    // 关闭删除盒子模态框
    elements.closeDeleteBox.addEventListener('click', () => {
        elements.deleteBoxModal.style.display = 'none';
    });

    // 点击删除模态框外部关闭
    elements.deleteBoxModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteBoxModal) {
            elements.deleteBoxModal.style.display = 'none';
        }
    });

    // ==================== 批量添加相关事件 ====================

    // 批量添加按钮
    elements.batchAddBtn.addEventListener('click', async () => {
        if (state.selectedMovies.size === 0) {
            alert('请先选择要添加的电影');
            return;
        }

        // 获取所有盒子
        const boxes = await window.electronAPI.getAllBoxes();

        if (!boxes || boxes.length === 0) {
            alert('请先创建电影盒子');
            return;
        }

        // 填充盒子选择下拉框
        elements.batchBoxSelect.innerHTML = '<option value="">选择电影盒子...</option>';
        boxes.forEach(box => {
            const option = document.createElement('option');
            option.value = box.name;
            option.textContent = `${box.name} (${box.movieCount}部电影)`;
            elements.batchBoxSelect.appendChild(option);
        });

        // 显示已选电影数量
        elements.batchAddInfo.textContent = `已选择 ${state.selectedMovies.size} 部电影`;

        // 显示模态框
        elements.batchAddModal.style.display = 'flex';
    });

    // 确认批量添加
    elements.confirmBatchAdd.addEventListener('click', async () => {
        const boxName = elements.batchBoxSelect.value;

        if (!boxName) {
            alert('请选择电影盒子');
            return;
        }

        try {
            let addedCount = 0;
            const selectedMovieIds = Array.from(state.selectedMovies);

            for (const movieId of selectedMovieIds) {
                const movie = state.movies.find(m => m.id === movieId);
                if (movie) {
                    const result = await window.electronAPI.addMovieToBox({
                        boxName: boxName,
                        platform: movie.platform,
                        movieInfo: {
                            id: movie.movieId,
                            status: 'unwatched',
                            firstWatched: '',
                            lastWatched: '',
                            totalWatchTime: 0,
                            watchCount: 0
                        }
                    });

                    if (!result.error) {
                        addedCount++;
                    }
                }
            }

            alert(`已经添加${addedCount}个到${boxName}`);

            // 关闭模态框
            elements.batchAddModal.style.display = 'none';

            // 清空选择
            state.selectedMovies.clear();
            updateBatchAddButtonVisibility();
            updateBatchDeleteButtonVisibility();
            await loadMovies();
        } catch (error) {
            console.error('Error batch adding to box:', error);
            alert('添加失败: ' + error.message);
        }
    });

    // 取消批量添加
    elements.cancelBatchAdd.addEventListener('click', () => {
        elements.batchAddModal.style.display = 'none';
    });

    // 关闭批量添加模态框
    elements.closeBatchAdd.addEventListener('click', () => {
        elements.batchAddModal.style.display = 'none';
    });

    // 点击模态框外部关闭
    elements.batchAddModal.addEventListener('click', (e) => {
        if (e.target === elements.batchAddModal) {
            elements.batchAddModal.style.display = 'none';
        }
    });

    // ==================== 批量删除相关事件 ====================

    // 批量删除按钮点击
    elements.batchDeleteBtn.addEventListener('click', async () => {
        if (state.selectedMovies.size === 0) {
            alert('请先选择要删除的电影');
            return;
        }

        const selectedCount = state.selectedMovies.size;
        const confirmed = confirm(`是否删除 ${selectedCount} 个电影？`);

        if (!confirmed) {
            return;
        }

        try {
            // 获取所有盒子信息
            const boxes = await window.electronAPI.getAllBoxes();
            const selectedMovieIds = Array.from(state.selectedMovies);

            // 先从所有盒子中移除这些电影
            for (const movieId of selectedMovieIds) {
                const movie = state.movies.find(m => m.id === movieId);
                if (!movie) continue;

                // 从所有盒子中移除该电影
                for (const box of boxes) {
                    const boxDetail = await window.electronAPI.getBoxDetail(box.name);
                    if (boxDetail && boxDetail.data && boxDetail.data[movie.platform]) {
                        const movieInBox = boxDetail.data[movie.platform].find(m => m.id === movie.movieId);
                        if (movieInBox) {
                            await window.electronAPI.removeMovieFromBox({
                                boxName: box.name,
                                platform: movie.platform,
                                movieId: movie.movieId
                            });
                        }
                    }
                }
            }

            // 批量删除电影
            await window.electronAPI.batchDeleteMovies({ movieIds: selectedMovieIds });

            alert(`已删除 ${selectedCount} 部电影`);

            // 清空选择
            state.selectedMovies.clear();
            updateBatchAddButtonVisibility();
            updateBatchDeleteButtonVisibility();

            // 刷新电影库、分类列表和电影盒子
            await loadMovies();
            await loadCategories();
            await loadBoxes();
            await loadStats();
        } catch (error) {
            console.error('Error batch deleting movies:', error);
            alert('删除失败: ' + error.message);
        }
    });

    // ==================== 目录扫描相关事件 ====================

    // 打开目录扫描模态框
    elements.scanDirBtn.addEventListener('click', () => {
        openScanDirModal();
    });

    // ==================== 添加电影相关事件 ====================

    // 关闭添加电影模态框
    elements.closeAddMovie.addEventListener('click', () => {
        elements.addMovieModal.style.display = 'none';
    });

    elements.cancelAddMovie.addEventListener('click', () => {
        elements.addMovieModal.style.display = 'none';
    });

    // 点击模态框外部关闭
    elements.addMovieModal.addEventListener('click', (e) => {
        // 如果点击目标是模态框本身（背景遮罩），则关闭
        // 点击任何内容区域（按钮、表单元素等）不关闭
        const modal = elements.addMovieModal;
        const modalContent = modal.querySelector('.modal-content');

        // 如果点击的是模态框背景（不是内容区域），则关闭
        // 只有直接点击 modal（背景）时才关闭，点击 modalContent 或其子元素时不关闭
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 选择封面图片
    elements.selectCoverBtn.addEventListener('click', () => {
        elements.movieCoverInput.click();
    });

    // 封面图片选择变化
    elements.movieCoverInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            elements.coverName.textContent = file.name;

            // 预览图片
            const reader = new FileReader();
            reader.onload = (event) => {
                elements.coverPreview.innerHTML = `<img src="${event.target.result}" alt="Cover Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // ==================== 电影文件管理相关事件 ====================

    // Tab 切换事件
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            // 切换 tab 按钮状态
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // 切换 tab 内容显示
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById('tab-' + tabName).classList.add('active');
            // 仅在电影信息 Tab 显示保存/取消按钮
            elements.addMovieFooter.style.display = (tabName === 'movie-info') ? 'flex' : 'none';
        });
    });

    // 打开添加文件弹窗
    elements.addFileBtn.addEventListener('click', () => {
        resetAddFileForm();
        elements.addFileModal.style.display = 'flex';
    });

    // 关闭添加文件弹窗
    elements.closeAddFile.addEventListener('click', () => {
        elements.addFileModal.style.display = 'none';
    });

    elements.cancelAddFile.addEventListener('click', () => {
        elements.addFileModal.style.display = 'none';
    });

    // 点击模态框外部关闭
    elements.addFileModal.addEventListener('click', (e) => {
        if (e.target === elements.addFileModal) {
            elements.addFileModal.style.display = 'none';
        }
    });

    // 选择文件按钮
    elements.selectFileBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.selectFile();
        if (!result.canceled && result.path) {
            const filePath = result.path;
            const fileName = result.name || filePath.split(/[/\\]/).pop();
            const fileSize = formatFileSize(result.size || 0);

            state.pendingFilePath = filePath;
            elements.selectedFileName.textContent = fileName;
            elements.newFileName.value = fileName;
            elements.newFileFullpath.value = filePath;
            elements.newFileSize.value = fileSize;
            elements.selectedFileInfo.style.display = 'block';
            elements.confirmAddFile.disabled = false;
        }
    });

    // 确认添加文件
    elements.confirmAddFile.addEventListener('click', () => {
        const fileEntry = {
            filename: elements.newFileName.value,
            fullpath: elements.newFileFullpath.value,
            size: elements.newFileSize.value,
            type: elements.newFileType.value,
            memo: elements.newFileMemo.value.trim()
        };

        state.movieFiles.push(fileEntry);
        renderFileList();

        // 选中新添加的文件
        state.selectedFileIndex = state.movieFiles.length - 1;
        showFileDetails(state.selectedFileIndex);

        elements.addFileModal.style.display = 'none';
        resetAddFileForm();

        // 切换到文件列表 tab 并高亮
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="movie-files"]').classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById('tab-movie-files').classList.add('active');
        elements.addMovieFooter.style.display = 'none';
    });

    // 确认添加电影
    elements.confirmAddMovie.addEventListener('click', async () => {
        const name = elements.movieNameInput.value.trim();
        const platform = elements.movieCategorySelect.value;

        if (!name) {
            alert('请输入电影名称');
            return;
        }

        if (!platform) {
            alert('请选择分类');
            return;
        }

        // 检查是否有同名电影（同分类）
        const existingMovie = state.movies.find(m =>
            m.name.toLowerCase() === name.toLowerCase() && m.platform === platform
        );

        if (existingMovie) {
            const confirmed = confirm(`电影库中已经拥有「${name}」电影，是否进行覆盖？`);
            if (!confirmed) {
                return;
            }
        }

        // 获取表单数据
        const movieData = {
            title: name,
            category: platform,
            description: elements.movieDescription ? elements.movieDescription.value.trim() : '',
            year: elements.moviePublishDate ? elements.moviePublishDate.value : '',
            director: elements.movieDirector ? elements.movieDirector.value.trim() : '',
            studio: elements.movieStudio ? elements.movieStudio.value.trim() : '',
            actors: [...state.selectedActors],
            tags: getSelectedTags(),
            fileset: [...state.movieFiles]  // 包含关联文件
        };

        // 处理封面图片
        const coverFile = elements.movieCoverInput.files[0];
        if (coverFile) {
            movieData.coverImage = await fileToBase64(coverFile);
        }

        try {
            const result = await window.electronAPI.addMovie(movieData);

            if (result.error) {
                alert('添加失败: ' + result.error);
            } else {
                elements.addMovieModal.style.display = 'none';
                await loadMovies();
                await loadCategories();
                await loadStats();
                // 自动打开新添加的电影的详情页面
                // result.movie 包含完整的电影数据
                if (result && result.movie) {
                    await window.electronAPI.openMovieDetail(result.movie);
                }
            }
        } catch (error) {
            console.error('Error adding movie:', error);
            alert('添加失败: ' + error.message);
        }
    });

    // ==================== 导入JSON相关事件 ====================

    // 标签选择弹窗事件
    const tagSelectorModal = document.getElementById('tag-selector-modal');
    const closeTagSelector = document.getElementById('close-tag-selector');
    const cancelTagSelection = document.getElementById('cancel-tag-selection');

    if (closeTagSelector) {
        closeTagSelector.addEventListener('click', () => {
            closeTagSelectorModal();
        });
    }

    if (cancelTagSelection) {
        cancelTagSelection.addEventListener('click', () => {
            closeTagSelectorModal();
        });
    }

    if (tagSelectorModal) {
        tagSelectorModal.addEventListener('click', (e) => {
            if (e.target === tagSelectorModal) {
                closeTagSelectorModal();
            }
        });
    }

    // 演员选择弹窗事件
    const closeActorSelector = document.getElementById('close-actor-selector');
    const cancelActorSelection = document.getElementById('cancel-actor-selection');

    if (closeActorSelector) {
        closeActorSelector.addEventListener('click', () => {
            closeActorSelectorModal();
        });
    }

    if (cancelActorSelection) {
        cancelActorSelection.addEventListener('click', () => {
            closeActorSelectorModal();
        });
    }

    if (elements.confirmActorSelection) {
        elements.confirmActorSelection.addEventListener('click', () => {
            confirmActorSelection();
        });
    }

    if (elements.actorSelectorModal) {
        elements.actorSelectorModal.addEventListener('click', (e) => {
            if (e.target === elements.actorSelectorModal) {
                closeActorSelectorModal();
            }
        });
    }
}

/**
 * 重置添加电影表单
 */
function resetAddMovieForm() {
    if (elements.movieNameInput) elements.movieNameInput.value = '';
    if (elements.movieCategorySelect) elements.movieCategorySelect.value = '';
    if (elements.moviePublishDate) elements.moviePublishDate.value = '';
    if (elements.movieDirector) elements.movieDirector.value = '';
    if (elements.movieStudio) elements.movieStudio.value = '';
    if (elements.movieDescription) elements.movieDescription.value = '';
    if (elements.movieCoverInput) elements.movieCoverInput.value = '';
    if (elements.coverName) elements.coverName.textContent = '';
    if (elements.coverPreview) elements.coverPreview.innerHTML = '<div class="cover-placeholder">选择封面图片</div>';

    // 清空标签选择
    state.selectedTags.clear();
    renderSelectedTags();

    // 清空演员选择
    state.selectedActors = [];
    renderSelectedActors();

    // 清空文件关联
    state.movieFiles = [];
    state.selectedFileIndex = -1;
    state.pendingFilePath = '';
    renderFileList();
    hideFileDetails();

    // 重置 Tab 到电影信息
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="movie-info"]').classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-movie-info').classList.add('active');
    elements.addMovieFooter.style.display = 'flex';
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小字符串
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 渲染文件列表
 */
function renderFileList() {
    if (state.movieFiles.length === 0) {
        elements.fileList.innerHTML = '<div class="file-list-empty">暂无关联文件</div>';
        return;
    }

    let html = '';
    state.movieFiles.forEach((file, index) => {
        const isSelected = index === state.selectedFileIndex;
        html += `
            <div class="file-item ${isSelected ? 'selected' : ''}" data-index="${index}">
                <span class="file-item-name" title="${file.filename}">${file.filename}</span>
                <span class="file-item-type">${file.type}</span>
                <span class="file-item-delete" data-index="${index}" title="删除">&times;</span>
            </div>
        `;
    });
    elements.fileList.innerHTML = html;

    // 绑定文件项点击事件
    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // 如果点击的是删除图标，不处理文件选中
            if (e.target.classList.contains('file-item-delete')) {
                return;
            }
            const index = parseInt(item.dataset.index);
            state.selectedFileIndex = index;
            showFileDetails(index);
            renderFileList();
        });
    });

    // 绑定删除图标点击事件
    document.querySelectorAll('.file-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            const confirmed = confirm('确定要删除此文件关联记录吗？\n注意：这不会删除原始文件。');
            if (confirmed) {
                state.movieFiles.splice(index, 1);
                if (state.selectedFileIndex >= state.movieFiles.length) {
                    state.selectedFileIndex = state.movieFiles.length - 1;
                }
                if (state.selectedFileIndex >= 0) {
                    showFileDetails(state.selectedFileIndex);
                } else {
                    hideFileDetails();
                }
                renderFileList();
            }
        });
    });
}

/**
 * 显示文件详情
 * @param {number} index - 文件索引
 */
function showFileDetails(index) {
    if (index < 0 || index >= state.movieFiles.length) {
        hideFileDetails();
        return;
    }

    const file = state.movieFiles[index];
    elements.fileName.value = file.filename;
    elements.fileFullpath.value = file.fullpath;
    elements.fileSize.value = file.size;
    elements.fileType.value = file.type;
    elements.fileMemo.value = file.memo || '';

    elements.fileDetails.style.display = 'block';
    document.querySelector('.file-details-empty').style.display = 'none';
}

/**
 * 隐藏文件详情
 */
function hideFileDetails() {
    elements.fileDetails.style.display = 'none';
    document.querySelector('.file-details-empty').style.display = 'flex';
}

/**
 * 选中文件项
 * @param {number} index - 文件索引
 */
function selectFileItem(index) {
    state.selectedFileIndex = index;
    document.querySelectorAll('.file-item').forEach(item => {
        const itemIndex = parseInt(item.dataset.index);
        if (itemIndex === index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

/**
 * 重置添加文件表单
 */
function resetAddFileForm() {
    elements.fileSelectInput.value = '';
    elements.selectedFileName.textContent = '';
    elements.selectedFileInfo.style.display = 'none';
    elements.newFileName.value = '';
    elements.newFileFullpath.value = '';
    elements.newFileSize.value = '';
    elements.newFileType.value = 'Main';
    elements.newFileMemo.value = '';
    elements.confirmAddFile.disabled = true;
    state.pendingFilePath = '';
}

/**
 * 填充分类选择下拉框
 */
function populateCategorySelect() {
    elements.movieCategorySelect.innerHTML = '<option value="">选择分类...</option>';
    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        elements.movieCategorySelect.appendChild(option);
    });
}

/**
 * 填充标签选择
 */
function populateTagsSelect() {
    // 清空已选标签
    state.selectedTags.clear();

    // 渲染标签选择区域（带X按钮和+按钮）
    renderSelectedTags();
}

/**
 * 渲染已选中的标签
 */
function renderSelectedTags() {
    let html = '';

    // 渲染已选中的标签
    state.selectedTags.forEach(tagId => {
        const tag = state.tags.find(t => t.id === tagId);
        if (tag) {
            html += `
                <span class="tag tag-with-remove" data-tag-id="${tagId}">
                    ${tag.name}
                    <span class="tag-remove" onclick="removeTagFromSelection('${tagId}')">&times;</span>
                </span>
            `;
        }
    });

    // 添加+按钮
    html += `<button class="tag-add-btn" onclick="openTagSelectorModal(); return false;">+</button>`;

    elements.movieTags.innerHTML = html;
}

/**
 * 从已选标签中移除
 */
function removeTagFromSelection(tagId) {
    state.selectedTags.delete(tagId);
    renderSelectedTags();
}

/**
 * 打开标签选择弹窗
 */
function openTagSelectorModal() {
    const modal = document.getElementById('tag-selector-modal');
    if (!modal) {
        console.error('Tag selector modal not found');
        return;
    }

    // 渲染标签选择列表
    const container = document.getElementById('tag-selector-list');
    let html = '';
    state.tags.forEach(tag => {
        const isSelected = state.selectedTags.has(tag.id);
        html += `
            <label class="tag-checkbox ${isSelected ? 'selected' : ''}">
                <input type="checkbox" value="${tag.id}" ${isSelected ? 'checked' : ''} onclick="toggleTagInSelection('${tag.id}')">
                <span>${tag.name}</span>
            </label>
        `;
    });
    container.innerHTML = html;

    modal.style.display = 'flex';
}

/**
 * 切换标签选中状态
 */
function toggleTagInSelection(tagId) {
    if (state.selectedTags.has(tagId)) {
        state.selectedTags.delete(tagId);
    } else {
        state.selectedTags.add(tagId);
    }
    // 更新标签显示
    renderSelectedTags();
    // 更新选择弹窗中的复选框状态
    const checkbox = document.querySelector(`#tag-selector-list input[value="${tagId}"]`);
    if (checkbox) {
        const label = checkbox.closest('.tag-checkbox');
        if (state.selectedTags.has(tagId)) {
            label.classList.add('selected');
        } else {
            label.classList.remove('selected');
        }
    }
}

/**
 * 关闭标签选择弹窗
 */
function closeTagSelectorModal() {
    const modal = document.getElementById('tag-selector-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 确认标签选择
 */
function confirmTagSelection() {
    closeTagSelectorModal();
}

/**
 * 获取选中的标签
 */
function getSelectedTags() {
    return Array.from(state.selectedTags);
}

/**
 * 渲染已选中的演员
 */
function renderSelectedActors() {
    let html = '';

    // 渲染已选中的演员
    state.selectedActors.forEach(actorName => {
        html += `
            <span class="tag tag-with-remove" data-actor-name="${actorName}">
                ${actorName}
                <span class="tag-remove" onclick="removeActorFromSelection('${actorName}'); return false;">&times;</span>
            </span>
        `;
    });

    // 添加+按钮
    html += `<button class="tag-add-btn" onclick="openActorSelectorModal(); return false;">+</button>`;

    elements.movieActors.innerHTML = html;
}

/**
 * 从已选演员中移除
 */
function removeActorFromSelection(actorName) {
    const index = state.selectedActors.indexOf(actorName);
    if (index > -1) {
        state.selectedActors.splice(index, 1);
    }
    renderSelectedActors();
}

/**
 * 打开演员选择弹窗
 */
function openActorSelectorModal() {
    const modal = document.getElementById('actor-selector-modal');
    if (!modal) {
        console.error('Actor selector modal not found');
        return;
    }

    // 渲染演员选择列表
    const container = document.getElementById('actor-selector-list');
    let html = '';
    state.actors.forEach(actor => {
        const isSelected = state.selectedActors.includes(actor.name);
        html += `
            <label class="tag-checkbox ${isSelected ? 'selected' : ''}">
                <input type="checkbox" value="${actor.name}" ${isSelected ? 'checked' : ''} onclick="toggleActorInSelection('${actor.name}')">
                <span>${actor.name}</span>
                ${actor.memo ? `<span style="color: var(--text-secondary); font-size: 12px;"> - ${actor.memo}</span>` : ''}
            </label>
        `;
    });
    container.innerHTML = html;

    modal.style.display = 'flex';
}

/**
 * 切换演员选中状态
 */
function toggleActorInSelection(actorName) {
    const index = state.selectedActors.indexOf(actorName);
    if (index > -1) {
        state.selectedActors.splice(index, 1);
    } else {
        state.selectedActors.push(actorName);
    }
    // 更新演员显示
    renderSelectedActors();
    // 更新选择弹窗中的复选框状态
    const checkbox = document.querySelector(`#actor-selector-list input[value="${actorName}"]`);
    if (checkbox) {
        const label = checkbox.closest('.tag-checkbox');
        if (state.selectedActors.includes(actorName)) {
            label.classList.add('selected');
        } else {
            label.classList.remove('selected');
        }
    }
}

/**
 * 关闭演员选择弹窗
 */
function closeActorSelectorModal() {
    const modal = document.getElementById('actor-selector-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 确认演员选择
 */
function confirmActorSelection() {
    closeActorSelectorModal();
}

/**
 * 加载演员列表
 */
async function loadActors() {
    try {
        const result = await window.electronAPI.getActors();
        if (result && !result.error) {
            state.actors = result.actors || [];
        } else {
            console.error('Failed to load actors:', result.error);
            state.actors = [];
        }
    } catch (error) {
        console.error('Error loading actors:', error);
        state.actors = [];
    }
}

/**
 * 将文件转换为 base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 保存设置处理器
 */
async function saveSettingsHandler() {
    try {
        const newSettings = {
            ...state.settings,
            emulators: state.settings.emulators,
            appearance: {
                ...state.settings.appearance,
                theme: elements.themeSelect.value
            },
            layout: {
                ...state.settings.layout,
                sidebarWidth: parseInt(elements.sidebarWidth.value),
                posterSize: elements.posterSize.value,
                viewMode: state.viewMode
            },
            library: {
                ...state.settings.library,
                moviesDir: elements.moviesDirInput.value
            },
            moviebox: {
                ...state.settings.moviebox,
                movieboxDir: elements.movieboxDirInput.value
            }
        };

        await window.electronAPI.saveSettings(newSettings);

        state.settings = newSettings;
        // 调用 setTheme 广播主题变化到所有窗口
        await window.electronAPI.setTheme(newSettings.appearance.theme);
        applyLayoutSettings(newSettings.layout);

        // 关闭模态框
        elements.settingsModal.style.display = 'none';

        // 重新加载所有电影
        await loadCategories();
        await loadMovies();
        await loadStats();
        // 重新加载盒子列表
        await loadBoxes();
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// ==================== 目录扫描相关函数 ====================

/**
 * 打开目录扫描模态框
 */
function openScanDirModal() {
    // 重置表单
    elements.scanPathInput.value = '';
    elements.scanCategorySelect.innerHTML = '<option value="">选择分类...</option>';
    elements.confirmScanDir.disabled = true;

    // 填充分类选择
    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        elements.scanCategorySelect.appendChild(option);
    });

    elements.scanDirModal.style.display = 'flex';
}

/**
 * 关闭目录扫描模态框
 */
function closeScanDirModal() {
    elements.scanDirModal.style.display = 'none';
}

/**
 * 处理扫描路径选择
 */
async function handleSelectScanPath() {
    const scanType = document.querySelector('input[name="scan-type"]:checked').value;

    if (scanType === 'directory') {
        const result = await window.electronAPI.selectDirectory();
        if (!result.canceled && result.path) {
            elements.scanPathInput.value = result.path;
            elements.scanPathInput.dataset.path = result.path;
            elements.scanPathInput.dataset.type = 'directory';
            updateScanConfirmButton();
        }
    } else {
        const result = await window.electronAPI.selectFile([
            { name: 'Text Files', extensions: ['txt', 'lst', 'movie'] }
        ]);
        if (!result.canceled && result.path) {
            elements.scanPathInput.value = result.path;
            elements.scanPathInput.dataset.path = result.path;
            elements.scanPathInput.dataset.type = 'file';
            updateScanConfirmButton();
        }
    }
}

/**
 * 更新扫描确认按钮状态
 */
function updateScanConfirmButton() {
    const path = elements.scanPathInput.dataset.path;
    const platform = elements.scanCategorySelect.value;
    elements.confirmScanDir.disabled = !path || !platform;
}

/**
 * 开始扫描目录
 */
async function startScanDirectory() {
    const scanPath = elements.scanPathInput.dataset.path;
    const scanType = elements.scanPathInput.dataset.type;
    const platform = elements.scanCategorySelect.value;

    if (!scanPath || !platform) {
        alert('请选择扫描路径和目标分类');
        return;
    }

    try {
        elements.confirmScanDir.disabled = true;
        elements.confirmScanDir.textContent = '扫描中...';

        const result = await window.electronAPI.scanMovieDirectory({
            scanPath: scanPath,
            scanType: scanType,
            platform: platform
        });

        if (result.error) {
            alert('扫描失败: ' + result.error);
            return;
        }

        // 保存临时目录和电影列表
        state.scanTempDir = result.tempDir;
        state.scanMovies = result.movies;

        // 关闭扫描设置模态框
        closeScanDirModal();

        // 显示扫描结果
        showScanResults(result.movies, platform);

    } catch (error) {
        console.error('Error scanning directory:', error);
        alert('扫描失败: ' + error.message);
    } finally {
        elements.confirmScanDir.disabled = false;
        elements.confirmScanDir.textContent = '开始扫描';
    }
}

/**
 * 显示扫描结果列表
 */
function showScanResults(movies, platform) {
    const platformName = state.categories.find(c => c.id === platform)?.name || platform;
    elements.scanResultInfo.textContent = `共扫描到 ${movies.length} 个电影（分类：${platformName}）`;
    elements.scanResultImport.disabled = true;

    // 渲染电影列表
    let html = '';
    movies.forEach((movie, index) => {
        html += `
            <div class="scan-movie-item" data-index="${index}">
                <div class="scan-movie-info">
                    <span class="scan-movie-name">${movie.name}</span>
                    <span class="scan-movie-status" id="status-${index}">待确认</span>
                </div>
                <div class="scan-movie-actions">
                    <button class="btn btn-secondary btn-small" onclick="editScanMovie(${index})">编辑</button>
                </div>
            </div>
        `;
    });

    elements.scanMoviesList.innerHTML = html;
    elements.scanResultModal.style.display = 'flex';
}

/**
 * 编辑扫描电影
 */
async function editScanMovie(index) {
    const movie = state.scanMovies[index];
    if (!movie) return;

    state.currentEditMovie = { index, movie };

    // 填充表单
    elements.scanMovieTempPath.value = movie.tempPath;

    // 尝试读取已有的 movie.json
    let movieData = movie.movieData;
    if (!movieData) {
        try {
            const movies = await window.electronAPI.getTempScannedMovies(state.scanTempDir);
            const existingMovie = movies.find(m => m.tempPath === movie.tempPath);
            if (existingMovie) {
                movieData = existingMovie;
                // 更新本地状态
                state.scanMovies[index].movieData = movieData;
            }
        } catch (error) {
            console.error('Error loading movie data:', error);
        }
    }

    // 填充表单数据
    if (elements.scanMovieName) elements.scanMovieName.value = movieData?.name || movie.name;
    if (elements.scanMoviePublishDate) elements.scanMoviePublishDate.value = movieData?.publishDate || '';
    // scanMoviePublisher 在 HTML 中是 scan-movie-publisher,但我们将其映射到 scanMovieDirector
    if (elements.scanMovieDirector) elements.scanMovieDirector.value = movieData?.publisher || '';
    if (elements.scanMovieDescription) elements.scanMovieDescription.value = movieData?.description || '';

    // 加载封面图片 - 查找 tempPath 下的 cover 文件
    let coverFound = false;
    const coverExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const coverNames = ['cover', 'poster', 'folder'];

    for (const coverName of coverNames) {
        for (const ext of coverExtensions) {
            const coverPath = `${movie.tempPath}/${coverName}${ext}`;
            try {
                const coverExists = await window.electronAPI.checkFileExists(coverPath);
                if (coverExists) {
                    const coverResponse = await fetch('file://' + coverPath);
                    const blob = await coverResponse.blob();
                    const base64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                    elements.scanCoverPreview.innerHTML = `<img src="${base64}" alt="Cover">`;
                    elements.scanMovieCoverInput.dataset.cover = base64;
                    coverFound = true;
                    break;
                }
            } catch (error) {
                // 继续尝试其他路径
            }
            if (coverFound) break;
        }
        if (coverFound) break;
    }

    if (!coverFound) {
        elements.scanCoverPreview.innerHTML = '<div class="cover-placeholder">选择封面图片</div>';
        delete elements.scanMovieCoverInput.dataset.cover;
    }
    delete elements.scanMovieCoverInput.dataset.icon;

    // 初始化标签
    state.scanEditTags = movieData?.tags || [];
    renderScanEditTags();

    elements.scanMovieEditModal.style.display = 'flex';
}

/**
 * 关闭电影编辑模态框
 */
function closeScanMovieEditModal() {
    elements.scanMovieEditModal.style.display = 'none';
    state.currentEditMovie = null;
}

/**
 * 处理扫描电影封面选择
 */
async function handleScanSelectCover() {
    elements.scanMovieCoverInput.click();
}

/**
 * 处理扫描电影封面文件变化
 */
async function handleScanCoverChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const base64 = await fileToBase64(file);
        elements.scanCoverPreview.innerHTML = `<img src="${base64}" alt="Cover" style="width: 100%; height: 100%; object-fit: cover;">`;
        elements.scanMovieCoverInput.dataset.cover = base64;
    } catch (error) {
        console.error('Error reading cover file:', error);
    }
}


/**
 * 渲染扫描电影编辑的标签
 */
function renderScanEditTags() {
    console.log('renderScanEditTags called with scanEditTags:', state.scanEditTags);
    
    let html = '';

    state.scanEditTags.forEach(tagId => {
        const tag = state.tags.find(t => t.id === tagId);
        if (tag) {
            html += `
                <span class="tag tag-with-remove" data-tag-id="${tagId}">
                    ${tag.name}
                    <span class="tag-remove" onclick="removeScanEditTag('${tagId}')">&times;</span>
                </span>
            `;
        }
    });

    console.log('About to add add-tag-btn button');
    html += `<button class="tag-add-btn" id="scan-tag-add-btn">+</button>`;

    elements.scanMovieTags.innerHTML = html;
    console.log('renderScanEditTags completed');
    
    // 绑定 add tag 按钮的事件
    const addButton = document.getElementById('scan-tag-add-btn');
    if (addButton) {
        // 移除旧的事件监听器
        const newButton = addButton.cloneNode(true);
        addButton.parentNode.replaceChild(newButton, addButton);
        
        // 使用新的方法绑定事件
        newButton.addEventListener('click', function(e) {
            console.log('Add tag button clicked via event listener');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // 检查当前模态框状态
            console.log('Current scan movie edit modal state:', {
                display: elements.scanMovieEditModal.style.display,
                isMovieEditModalOpen: elements.scanMovieEditModal.style.display === 'flex'
            });
            
            openScanTagSelector();
        });
        
        console.log('Add tag button event listener bound successfully');
    }
}

/**
 * 移除扫描电影编辑的标签
 */
function removeScanEditTag(tagId) {
    const index = state.scanEditTags.indexOf(tagId);
    if (index > -1) {
        state.scanEditTags.splice(index, 1);
        renderScanEditTags();
    }
}

/**
 * 打开扫描电影标签选择弹窗
 */
function openScanTagSelector() {
    console.log('openScanTagSelector called');
    console.log('Current scanEditTags:', state.scanEditTags);

    // 确保当前的扫描电影编辑模态框仍然打开
    if (elements.scanMovieEditModal.style.display !== 'flex') {
        console.error('Scan movie edit modal is not open! Current display:', elements.scanMovieEditModal.style.display);
        return;
    }
    
    const modal = elements.scanTagSelectorModal;
    if (!modal) {
        console.error('Tag selector modal not found');
        return;
    }

    const container = elements.scanTagSelectorList;
    let html = '';
    state.tags.forEach(tag => {
        const isSelected = state.scanEditTags.includes(tag.id);
        html += `
            <label class="tag-checkbox ${isSelected ? 'selected' : ''}">
                <input type="checkbox" value="${tag.id}" ${isSelected ? 'checked' : ''} onclick="toggleScanTagSelection('${tag.id}')">
                <span>${tag.name}</span>
            </label>
        `;
    });
    container.innerHTML = html;
    console.log('Tag selector modal content prepared');

    modal.style.display = 'flex';
    console.log('Tag selector modal displayed');
    
    // 使用 setTimeout 确保模态框显示后再添加事件监听
    setTimeout(() => {
        // 确保主编辑模态框仍然是打开的
        if (elements.scanMovieEditModal.style.display !== 'flex') {
            console.warn('Main modal was closed while opening tag selector!');
            return;
        }
        
        // 为标签选择器绑定专门的事件处理
        modal.addEventListener('click', function handleModalClick(e) {
            if (e.target === modal) {
                // 只有点击背景时才关闭
                console.log('Closing tag selector modal - clicked on background');
                closeScanTagSelector();
            }
        }, { once: true }); // 只绑定一次
    }, 100);
}

/**
 * 切换扫描电影标签选中状态
 */
function toggleScanTagSelection(tagId) {
    const index = state.scanEditTags.indexOf(tagId);
    if (index > -1) {
        state.scanEditTags.splice(index, 1);
    } else {
        state.scanEditTags.push(tagId);
    }
    renderScanEditTags();
    const checkbox = document.querySelector(`#scan-tag-selector-list input[value="${tagId}"]`);
    if (checkbox) {
        const label = checkbox.closest('.tag-checkbox');
        if (state.scanEditTags.includes(tagId)) {
            label.classList.add('selected');
        } else {
            label.classList.remove('selected');
        }
    }
}

/**
 * 关闭扫描电影标签选择弹窗
 */
function closeScanTagSelector() {
    elements.scanTagSelectorModal.style.display = 'none';
}

/**
 * 确认保存扫描电影编辑
 */
async function confirmScanMovieEdit() {
    if (!state.currentEditMovie) return;

    const { index, movie } = state.currentEditMovie;
    const tempPath = movie.tempPath;

    const movieData = {
        name: elements.scanMovieName ? elements.scanMovieName.value.trim() : '',
        publishDate: elements.scanMoviePublishDate ? elements.scanMoviePublishDate.value : '',
        publisher: elements.scanMovieDirector ? elements.scanMovieDirector.value : '',  // HTML中是publisher,映射到scanMovieDirector
        description: elements.scanMovieDescription ? elements.scanMovieDescription.value : '',
        tags: [...state.scanEditTags]
    };

    if (!movieData.name) {
        alert('请输入电影名称');
        return;
    }

    try {
        const coverImage = elements.scanMovieCoverInput.dataset.cover || '';
        const iconImage = elements.scanMovieCoverInput.dataset.icon || '';

        const result = await window.electronAPI.updateTempMovie({
            tempPath: tempPath,
            movieData: movieData,
            coverImage: coverImage,
            iconImage: iconImage
        });

        if (result.error) {
            alert('保存失败: ' + result.error);
            return;
        }

        // 更新本地状态
        state.scanMovies[index].name = movieData.name;
        state.scanMovies[index].movieData = result.movieData;

        // 更新列表显示
        const statusEl = document.getElementById(`status-${index}`);
        if (statusEl) {
            statusEl.textContent = '已确认';
            statusEl.classList.add('confirmed');
        }

        // 检查是否所有电影都已确认
        checkAllMoviesConfirmed();

        // 关闭模态框
        closeScanMovieEditModal();

    } catch (error) {
        console.error('Error saving scan movie:', error);
        alert('保存失败: ' + error.message);
    }
}

/**
 * 检查是否所有电影都已确认
 */
function checkAllMoviesConfirmed() {
    const allConfirmed = state.scanMovies.every(movie => movie.movieData);
    elements.scanResultImport.disabled = !allConfirmed;
}

/**
 * 导入所有扫描的电影
 */
async function importAllScannedMovies() {
    if (!state.scanTempDir) {
        alert('无效的扫描目录');
        return;
    }

    try {
        elements.scanResultImport.disabled = true;
        elements.scanResultImport.textContent = '导入中...';

        const result = await window.electronAPI.importScannedMovies(state.scanTempDir);

        if (result.error) {
            alert('导入失败: ' + result.error);
            return;
        }

        // 显示导入结果
        let message = `导入完成！成功: ${result.success} 个`;
        if (result.failed > 0) {
            message += `，失败: ${result.failed} 个`;
        }
        if (result.errors && result.errors.length > 0) {
            message += `\n错误: ${result.errors.join('; ')}`;
        }

        alert(message);

        // 关闭结果模态框
        closeScanResultModal();

        // 刷新电影库
        await loadMovies();
        await loadCategories();
        await loadStats();

    } catch (error) {
        console.error('Error importing scanned movies:', error);
        alert('导入失败: ' + error.message);
    } finally {
        elements.scanResultImport.disabled = false;
        elements.scanResultImport.textContent = '导入全部';
    }
}

/**
 * 取消扫描
 */
async function cancelScan() {
    if (state.scanTempDir) {
        try {
            await window.electronAPI.deleteTempScanDir(state.scanTempDir);
        } catch (error) {
            console.error('Error deleting temp scan dir:', error);
        }
    }

    state.scanTempDir = '';
    state.scanMovies = [];

    closeScanResultModal();
}

/**
 * 关闭扫描结果模态框
 */
function closeScanResultModal() {
    elements.scanResultModal.style.display = 'none';
    state.scanTempDir = '';
    state.scanMovies = [];
}

/**
 * 初始化目录扫描相关事件
 */
function initScanDirEvents() {
    // 扫描目录模态框事件
    elements.closeScanDir.addEventListener('click', closeScanDirModal);
    elements.cancelScanDir.addEventListener('click', closeScanDirModal);
    elements.scanDirModal.addEventListener('click', (e) => {
        if (e.target === elements.scanDirModal) {
            closeScanDirModal();
        }
    });

    // 选择扫描路径
    elements.selectScanPathBtn.addEventListener('click', handleSelectScanPath);

    // 扫描类型变化时清空路径
    document.querySelectorAll('input[name="scan-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            elements.scanPathInput.value = '';
            delete elements.scanPathInput.dataset.path;
            delete elements.scanPathInput.dataset.type;
            updateScanConfirmButton();
        });
    });

    // 分类选择变化
    elements.scanCategorySelect.addEventListener('change', updateScanConfirmButton);

    // 开始扫描
    elements.confirmScanDir.addEventListener('click', startScanDirectory);

    // 扫描结果模态框事件
    elements.closeScanResult.addEventListener('click', closeScanResultModal);
    elements.scanResultCancel.addEventListener('click', cancelScan);
    elements.scanResultImport.addEventListener('click', importAllScannedMovies);
    elements.scanResultModal.addEventListener('click', (e) => {
        if (e.target === elements.scanResultModal) {
            closeScanResultModal();
        }
    });

    // 电影编辑模态框事件
    elements.closeScanMovieEdit.addEventListener('click', closeScanMovieEditModal);
    elements.cancelScanMovieEdit.addEventListener('click', closeScanMovieEditModal);
    elements.scanMovieEditModal.addEventListener('click', (e) => {
        // 调试日志
        const target = e.target;
        const isBackground = target === elements.scanMovieEditModal;
        const isInsideContent = target.closest('.modal-content') !== null;
        const isAddTagBtn = target.matches('.tag-add-btn') || target.closest('.tag-add-btn');
        
        console.log('Scan movie edit modal clicked:', {
            target: target,
            targetClass: target.className,
            targetId: target.id,
            tagName: target.tagName,
            isBackground: isBackground,
            isInsideContent: isInsideContent,
            isAddTagBtn: isAddTagBtn
        });
        
        // 只有关闭按钮在 modal-content 内，所以我们需要特别处理
        // 如果点击的是背景遮罩（不是内容区域），则关闭
        if (isBackground) {
            console.log('Closing modal - clicked on background overlay');
            closeScanMovieEditModal();
        }
    });

    // 封面选择
    elements.scanSelectCoverBtn.addEventListener('click', handleScanSelectCover);
    elements.scanMovieCoverInput.addEventListener('change', handleScanCoverChange);

    // 标签选择弹窗事件
    elements.closeScanTagSelector.addEventListener('click', closeScanTagSelector);
    elements.cancelScanTagSelection.addEventListener('click', closeScanTagSelector);
    elements.confirmScanTagSelection.addEventListener('click', closeScanTagSelector);
    elements.scanTagSelectorModal.addEventListener('click', (e) => {
        if (e.target === elements.scanTagSelectorModal) {
            closeScanTagSelector();
        }
    });

    // 确认保存
    elements.confirmScanMovieEdit.addEventListener('click', confirmScanMovieEdit);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);
