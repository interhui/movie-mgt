/**
 * 演员管理页面逻辑
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 获取DOM元素
    const searchInput = document.getElementById('search-input');
    const addActorBtn = document.getElementById('add-actor-btn');
    const viewCardBtn = document.getElementById('view-card-btn');
    const viewTableBtn = document.getElementById('view-table-btn');
    const closeBtn = document.getElementById('close-btn');

    const cardView = document.getElementById('card-view');
    const tableView = document.getElementById('table-view');
    const actorCards = document.getElementById('actor-cards');
    const actorTableBody = document.getElementById('actor-table-body');
    const emptyCardList = document.getElementById('empty-card-list');
    const emptyTableList = document.getElementById('empty-table-list');

    const actorModal = document.getElementById('actor-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModal = document.getElementById('close-modal');
    const actorForm = document.getElementById('actor-form');
    const originalNameInput = document.getElementById('original-name');
    const actorNameInput = document.getElementById('actor-name');
    const actorNicknameInput = document.getElementById('actor-nickname');
    const actorBirthdayInput = document.getElementById('actor-birthday');
    const actorMemoInput = document.getElementById('actor-memo');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn');

    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const selectPhotoBtn = document.getElementById('select-photo-btn');
    const removePhotoBtn = document.getElementById('remove-photo-btn');

    const photoViewModal = document.getElementById('photo-view-modal');
    const closePhotoView = document.getElementById('close-photo-view');
    const photoViewImg = document.getElementById('photo-view-img');
    const photoViewTitle = document.getElementById('photo-view-title');

    // 状态
    let actors = [];
    let currentView = 'card'; // 'card' or 'table'
    let selectedActor = null;
    let isCreating = false;
    let currentPhotoBase64 = '';
    let currentPhotoFileName = '';

    // 加载主题
    async function loadTheme() {
        try {
            const settings = await window.electronAPI.getSettings();
            if (settings && settings.appearance) {
                applyTheme(settings.appearance.theme);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    }

    // 关闭窗口
    closeBtn.addEventListener('click', () => {
        window.close();
    });

    // 监听主题变化
    window.electronAPI.onThemeChanged((theme) => {
        applyTheme(theme);
    });

    // 加载演员列表
    async function loadActors() {
        try {
            const result = await window.electronAPI.getActors();
            if (result.error) {
                console.error('Error loading actors:', result.error);
                actors = [];
            } else {
                actors = result.actors || [];
            }
            renderActors();
        } catch (error) {
            console.error('Error loading actors:', error);
            actors = [];
            renderActors();
        }
    }

    // 渲染演员列表
    function renderActors(filter = '') {
        const filteredActors = filter
            ? actors.filter(a =>
                (a.name && a.name.toLowerCase().includes(filter.toLowerCase())) ||
                (a.nickname && a.nickname.toLowerCase().includes(filter.toLowerCase()))
            )
            : actors;

        if (currentView === 'card') {
            renderCardView(filteredActors);
        } else {
            renderTableView(filteredActors);
        }
    }

    // 渲染卡片视图
    function renderCardView(actorList) {
        if (actorList.length === 0) {
            actorCards.innerHTML = '';
            emptyCardList.style.display = 'flex';
            return;
        }

        emptyCardList.style.display = 'none';
        actorCards.innerHTML = actorList.map(actor => `
            <div class="actor-card" data-name="${escapeHtml(actor.name)}">
                <div class="actor-card-photo">
                    ${actor.photo
                        ? `<img src="file://${actor.photo}" alt="${escapeHtml(actor.name)}" onclick="viewPhoto('${escapeHtml(actor.name)}', '${escapeHtml(actor.photo)}')">`
                        : `<div class="actor-card-placeholder">${escapeHtml(actor.name.charAt(0))}</div>`
                    }
                </div>
                <div class="actor-card-info">
                    <div class="actor-card-name">${escapeHtml(actor.name)}</div>
                    ${actor.nickname ? `<div class="actor-card-nickname">${escapeHtml(actor.nickname)}</div>` : ''}
                </div>
            </div>
        `).join('');

        // 绑定点击事件
        actorCards.querySelectorAll('.actor-card').forEach(card => {
            card.addEventListener('click', () => editActor(card.dataset.name));
        });
    }

    // 渲染表格视图
    function renderTableView(actorList) {
        if (actorList.length === 0) {
            actorTableBody.innerHTML = '';
            emptyTableList.style.display = 'flex';
            return;
        }

        emptyTableList.style.display = 'none';
        actorTableBody.innerHTML = actorList.map(actor => `
            <tr data-name="${escapeHtml(actor.name)}">
                <td class="actor-table-photo">
                    ${actor.photo
                        ? `<img src="file://${actor.photo}" alt="${escapeHtml(actor.name)}" onclick="viewPhoto('${escapeHtml(actor.name)}', '${escapeHtml(actor.photo)}')">`
                        : `<div class="actor-table-placeholder">${escapeHtml(actor.name.charAt(0))}</div>`
                    }
                </td>
                <td>${escapeHtml(actor.name)}</td>
                <td>${escapeHtml(actor.nickname || '')}</td>
                <td>${escapeHtml(actor.birthday || '')}</td>
                <td>${escapeHtml(actor.memo || '')}</td>
                <td class="actor-table-actions">
                    <button class="btn btn-small" onclick="editActor('${escapeHtml(actor.name)}')">编辑</button>
                    <button class="btn btn-small btn-danger" onclick="deleteActorConfirm('${escapeHtml(actor.name)}')">删除</button>
                </td>
            </tr>
        `).join('');
    }

    // 查看照片
    window.viewPhoto = function(name, photoPath) {
        photoViewTitle.textContent = name;
        photoViewImg.src = photoPath ? `file://${photoPath}` : '';
        photoViewModal.style.display = 'flex';
    };

    // 关闭照片查看
    closePhotoView.addEventListener('click', () => {
        photoViewModal.style.display = 'none';
    });

    photoViewModal.addEventListener('click', (e) => {
        if (e.target === photoViewModal) {
            photoViewModal.style.display = 'none';
        }
    });

    // 切换视图
    function switchView(view) {
        currentView = view;
        if (view === 'card') {
            cardView.style.display = 'block';
            tableView.style.display = 'none';
            viewCardBtn.classList.add('active');
            viewTableBtn.classList.remove('active');
        } else {
            cardView.style.display = 'none';
            tableView.style.display = 'block';
            viewCardBtn.classList.remove('active');
            viewTableBtn.classList.add('active');
        }
        renderActors(searchInput.value);
    }

    viewCardBtn.addEventListener('click', () => switchView('card'));
    viewTableBtn.addEventListener('click', () => switchView('table'));

    // 搜索
    searchInput.addEventListener('input', (e) => {
        renderActors(e.target.value);
    });

    // 新建演员
    addActorBtn.addEventListener('click', () => {
        isCreating = true;
        selectedActor = null;
        resetForm();
        modalTitle.textContent = '新建演员';
        deleteBtn.style.display = 'none';
        showModal();
    });

    // 编辑演员
    window.editActor = function(name) {
        const actor = actors.find(a => a.name === name);
        if (!actor) return;

        isCreating = false;
        selectedActor = actor;
        originalNameInput.value = actor.name;
        actorNameInput.value = actor.name;
        actorNicknameInput.value = actor.nickname || '';
        actorBirthdayInput.value = actor.birthday || '';
        actorMemoInput.value = actor.memo || '';
        currentPhotoBase64 = '';
        currentPhotoFileName = '';

        if (actor.photo) {
            photoPreview.innerHTML = `<img src="file://${actor.photo}" alt="${escapeHtml(actor.name)}">`;
            removePhotoBtn.style.display = 'block';
        } else {
            photoPreview.innerHTML = '<div class="photo-placeholder">点击上传照片</div>';
            removePhotoBtn.style.display = 'none';
        }

        modalTitle.textContent = '编辑演员';
        deleteBtn.style.display = 'block';
        showModal();
    };

    // 删除演员确认
    window.deleteActorConfirm = function(name) {
        if (!confirm(`确定要删除演员"${name}"吗？`)) {
            return;
        }
        deleteActor(name);
    };

    // 删除演员
    async function deleteActor(name) {
        try {
            const result = await window.electronAPI.deleteActor(name);
            if (result.error) {
                alert(result.error);
                return;
            }
            await loadActors();
            hideModal();
        } catch (error) {
            console.error('Error deleting actor:', error);
            alert('删除失败: ' + error.message);
        }
    }

    // 显示模态框
    function showModal() {
        actorModal.style.display = 'flex';
        actorNameInput.focus();
    }

    // 隐藏模态框
    function hideModal() {
        actorModal.style.display = 'none';
        resetForm();
    }

    // 重置表单
    function resetForm() {
        originalNameInput.value = '';
        actorNameInput.value = '';
        actorNicknameInput.value = '';
        actorBirthdayInput.value = '';
        actorMemoInput.value = '';
        currentPhotoBase64 = '';
        currentPhotoFileName = '';
        photoPreview.innerHTML = '<div class="photo-placeholder">点击上传照片</div>';
        removePhotoBtn.style.display = 'none';
        actorForm.reset();
    }

    // 选择照片
    selectPhotoBtn.addEventListener('click', () => {
        photoInput.click();
    });

    photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const base64 = await fileToBase64(file);
            currentPhotoBase64 = base64.split(',')[1]; // 去掉 data:image/...;base64, 前缀
            currentPhotoFileName = `${Date.now()}_${file.name}`;
            photoPreview.innerHTML = `<img src="${base64}" alt="照片预览">`;
            removePhotoBtn.style.display = 'block';
        } catch (error) {
            console.error('Error reading file:', error);
            alert('读取照片失败');
        }
    });

    // 移除照片
    removePhotoBtn.addEventListener('click', () => {
        currentPhotoBase64 = '';
        currentPhotoFileName = '';
        photoPreview.innerHTML = '<div class="photo-placeholder">点击上传照片</div>';
        removePhotoBtn.style.display = 'none';
        photoInput.value = '';
    });

    // 保存演员
    async function saveActor() {
        const name = actorNameInput.value.trim();
        const nickname = actorNicknameInput.value.trim();
        const birthday = actorBirthdayInput.value;
        const memo = actorMemoInput.value.trim();

        if (!name) {
            alert('请填写演员姓名');
            return;
        }

        try {
            let photoPath = selectedActor ? selectedActor.photo : '';

            // 如果有新照片，先保存照片
            if (currentPhotoBase64) {
                const photoResult = await window.electronAPI.saveActorPhoto({
                    base64Data: currentPhotoBase64,
                    fileName: currentPhotoFileName
                });
                if (photoResult.error) {
                    alert(photoResult.error);
                    return;
                }
                photoPath = photoResult.filePath;
            }

            const actorData = {
                name,
                nickname,
                birthday,
                memo,
                photo: photoPath
            };

            let result;
            if (isCreating) {
                result = await window.electronAPI.createActor(actorData);
            } else {
                result = await window.electronAPI.updateActor({
                    oldName: originalNameInput.value,
                    newActor: actorData
                });
            }

            if (result.error) {
                alert(result.error);
                return;
            }

            await loadActors();
            hideModal();
        } catch (error) {
            console.error('Error saving actor:', error);
            alert('保存失败: ' + error.message);
        }
    }

    // 事件绑定
    closeModal.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveActor();
    });
    deleteBtn.addEventListener('click', () => {
        if (selectedActor) {
            deleteActorConfirm(selectedActor.name);
        }
    });

    actorModal.addEventListener('click', (e) => {
        if (e.target === actorModal) {
            hideModal();
        }
    });

    // 监听演员更新事件
    window.electronAPI.onActorsUpdated(() => {
        loadActors();
    });

    // 初始加载
    loadTheme();
    loadActors();
});
