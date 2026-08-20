/**
 * 播放器服务
 * 负责管理播放列表、播放器窗口，以及快进 / 快退目标时间、音量调节目标值的计算。
 * 支持多播放器选择：默认使用自带（内置 HTML5）播放器，也可配置为 PotPlayer 外部播放器。
 */
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { spawn } = require('child_process');

/** 默认播放器类型：自带（内置 HTML5）播放器 */
const PLAYER_TYPE_BUILTIN = 'builtin';

/** 外部播放器类型：PotPlayer */
const PLAYER_TYPE_POTPLAYER = 'potplayer';

/**
 * 判断播放器配置是否要求使用 PotPlayer 外部播放器
 * 只有类型为 potplayer 且可执行文件路径非空时才视为启用，否则一律回退自带播放器。
 * @param {object} playerConfig - 播放器配置（settings.player）
 * @returns {boolean} 是否启用 PotPlayer
 */
function isPotplayerEnabled(playerConfig) {
    return Boolean(playerConfig
        && playerConfig.defaultPlayer === PLAYER_TYPE_POTPLAYER
        && typeof playerConfig.potplayerPath === 'string'
        && playerConfig.potplayerPath.trim() !== '');
}

/** 默认快进 / 快退间隔（秒） */
const DEFAULT_SEEK_STEP = 10;

/** 快退方向：向后跳转 */
const DIRECTION_BACKWARD = 'backward';

/** 快进方向：向前跳转 */
const DIRECTION_FORWARD = 'forward';

/**
 * 规整快进 / 快退间隔
 * 非数字或非正数一律回退为默认值，保证调用方始终拿到有效步长。
 * @param {any} seekStep - 原始步长
 * @returns {number} 有效的步长（秒）
 */
function normalizeSeekStep(seekStep) {
    return (typeof seekStep === 'number' && !isNaN(seekStep) && seekStep > 0)
        ? seekStep
        : DEFAULT_SEEK_STEP;
}

/**
 * 规整播放时间基线
 * 非数字或 NaN 一律按 0 处理，避免计算结果出现 NaN。
 * @param {any} time - 原始时间
 * @returns {number} 有效的播放时间（秒）
 */
function normalizeTime(time) {
    return (typeof time === 'number' && !isNaN(time)) ? time : 0;
}


/** 默认音量步长（百分比），方向键调节音量时的单次变化量 */
const DEFAULT_VOLUME_STEP = 5;

/** 音量下限（百分比） */
const VOLUME_MIN = 0;

/** 音量上限（百分比） */
const VOLUME_MAX = 100;

/** 音量增大方向：向上调节（对应方向键 ArrowUp） */
const VOLUME_DIRECTION_UP = 'up';

/** 音量减小方向：向下调节（对应方向键 ArrowDown） */
const VOLUME_DIRECTION_DOWN = 'down';

/**
 * 规整音量步长
 * 非数字或非正数一律回退为默认值，保证调用方始终拿到有效步长。
 * @param {any} volumeStep - 原始音量步长
 * @returns {number} 有效的音量步长（百分比）
 */
function normalizeVolumeStep(volumeStep) {
    return (typeof volumeStep === 'number' && !isNaN(volumeStep) && volumeStep > 0)
        ? volumeStep
        : DEFAULT_VOLUME_STEP;
}

/**
 * 规整音量基线
 * 非数字或 NaN 一律按 0 处理，避免计算结果出现 NaN。
 * @param {any} volume - 原始音量
 * @returns {number} 有效的音量（百分比）
 */
function normalizeVolume(volume) {
    return (typeof volume === 'number' && !isNaN(volume)) ? volume : 0;
}

/**
 * 将电影路径显式包裹在双引号中
 * 内部可能存在的双引号字符会被转义为 `\"`，避免与外层引号冲突。
 * 用于 PotPlayer 命令时统一每个电影路径都带引号的展示形式。
 * @param {string} moviePath - 原始电影路径
 * @returns {string} 包裹双引号后的路径
 */
function wrapMoviePathInQuotes(moviePath) {
    const stringValue = String(moviePath);
    return `"${stringValue.replace(/"/g, '\\"')}"`;
}

class PlayerService {
    /**
     * @param {Function} [launchExternalPlayer] - 外部进程启动函数（默认 child_process.spawn），
     *        参数为 (exePath, args, options)；注入是为了便于单元测试。
     */
    constructor(launchExternalPlayer = spawn) {
        this.currentPlaylist = [];
        this.currentIndex = 0;
        this.launchExternalPlayer = launchExternalPlayer;
    }

    /**
     * 从电影数据构建播放列表
     * 从 fileset 中提取所有 Main 类型的文件
     * @param {Object} movieData - 电影数据
     * @returns {Array} 播放列表
     */
    getPlaylist(movieData) {
        const playlist = [];

        if (movieData && movieData.fileset && Array.isArray(movieData.fileset)) {
            for (const file of movieData.fileset) {
                // 检查 type 或 fileType 字段
                const fileType = file.type || file.fileType;
                if (fileType === 'Main' && file.fullpath) {
                    playlist.push({
                        path: file.fullpath,
                        title: movieData.title || file.filename || path.basename(file.fullpath),
                        codec: file.codec || file.videoCodec || '',
                        resolution: file.resolution || (file.videoWidth ? `${file.videoWidth}x${file.videoHeight}` : ''),
                        movieId: movieData.id || null,
                        category: movieData.category || null
                    });
                }
            }
        }

        // 如果没有 fileset 或没有 Main 类型文件，尝试使用 original_filename
        if (playlist.length === 0 && movieData && movieData.original_filename) {
            playlist.push({
                path: movieData.original_filename,
                title: movieData.title || path.basename(movieData.original_filename),
                codec: movieData.videoCodec || '',
                resolution: movieData.videoWidth ? `${movieData.videoWidth}x${movieData.videoHeight}` : '',
                movieId: movieData.id || null,
                category: movieData.category || null
            });
        }

        return playlist;
    }

    /**
     * 打开播放器窗口
     * 当播放器配置启用 PotPlayer 时，改为调用外部 PotPlayer 播放；
     * 否则使用自带播放器窗口。
     * @param {Object} movieData - 电影数据
     * @param {Object} mainWindow - 主窗口引用
     * @param {Function} createPlayerWindow - 创建播放器窗口的函数
     * @param {number} [startTime] - 起始播放时间（秒），仅自带播放器使用
     * @param {Object} [playerConfig] - 播放器配置（settings.player）
     */
    openPlayerWindow(movieData, mainWindow, createPlayerWindow, startTime = 0, playerConfig = null) {
        const playlist = this.getPlaylist(movieData);
        if (playlist.length === 0) {
            throw new Error('没有可播放的文件');
        }

        // 启用 PotPlayer 时，将正片文件交给外部播放器
        if (isPotplayerEnabled(playerConfig)) {
            return this.playWithPotplayer(
                playerConfig.potplayerPath,
                playlist.map((item) => item.path)
            );
        }

        this.currentPlaylist = playlist;
        this.currentIndex = 0;

        const movieId = movieData && movieData.id ? movieData.id : null;
        const movieFolderPath = movieData && (movieData.basePath || movieData.path) ? (movieData.basePath || movieData.path) : null;

        if (typeof createPlayerWindow === 'function') {
            createPlayerWindow({
                playlist: playlist,
                currentIndex: 0,
                movieTitle: movieData.title || '电影播放',
                movieId: movieId,
                movieFolderPath: movieFolderPath,
                startTime: startTime
            });
        }
    }

    /**
     * 批量播放电影
     * 当播放器配置启用 PotPlayer 时，改为调用外部 PotPlayer 播放全部影片；
     * 否则使用自带播放器窗口。
     * @param {Array} playlistData - 播放列表（元素含 path 字段）
     * @param {Object} mainWindow - 主窗口引用
     * @param {Function} createPlayerWindow - 创建播放器窗口的函数
     * @param {Object} [playerConfig] - 播放器配置（settings.player）
     */
    openBatchPlayerWindow(playlistData, mainWindow, createPlayerWindow, playerConfig = null) {
        if (!playlistData || playlistData.length === 0) {
            throw new Error('没有可播放的文件');
        }

        // 启用 PotPlayer 时，将播放列表中的全部文件交给外部播放器
        if (isPotplayerEnabled(playerConfig)) {
            return this.playWithPotplayer(
                playerConfig.potplayerPath,
                playlistData.map((item) => item && item.path)
            );
        }

        this.currentPlaylist = playlistData;
        this.currentIndex = 0;

        if (typeof createPlayerWindow === 'function') {
            createPlayerWindow({
                playlist: playlistData,
                currentIndex: 0,
                movieTitle: '批量播放'
            });
        }
    }

    /**
     * 使用外部 PotPlayer 播放电影
     * 调用方式（单个文件）：
     *   "PotPlayer可执行文件路径" "电影路径1"
     * 调用方式（多个文件）：
     *   "PotPlayer可执行文件路径" "电影路径1" "电影路径2" "电影路径3" ...
     *
     * 无论传入 1 个还是多个电影路径，都以相同的"路径列表"形式传参，
     * 不在路径之间插入 /add 等额外参数，调用形式保持一致。
     *
     * 每一个电影路径都会被显式包裹双引号，保证命令中每个路径都带引号，
     * 形式统一为 `potplayerpath "movie1" "movie2"`。
     *
     * @param {string} potplayerPath - PotPlayer 可执行文件路径
     * @param {Array<string>} moviePaths - 电影文件路径列表
     * @returns {Object} 子进程对象
     */
    playWithPotplayer(potplayerPath, moviePaths) {
        // 过滤掉空 / 非法的路径条目，全部无效时与内部播放保持一致的错误提示
        const validMoviePaths = (Array.isArray(moviePaths) ? moviePaths : [])
            .filter((moviePath) => typeof moviePath === 'string' && moviePath.trim() !== '');

        if (validMoviePaths.length === 0) {
            throw new Error('没有可播放的文件');
        }

        // 构造 PotPlayer 命令行参数：每一个电影路径都显式包裹双引号，
        // 不在路径之间插入 /add 等额外标记，保证 1 个与多个文件的调用形式一致，
        // 且命令中每个路径都带引号。
        const spawnArgs = validMoviePaths.map(wrapMoviePathInQuotes);

        // 调试输出：打印实际将要执行的 PotPlayer 命令行，便于排查参数传递问题
        const commandPreview = this.buildPotplayerCommandPreview(potplayerPath, spawnArgs);
        console.log(`[PlayerService] 执行 PotPlayer 命令: ${commandPreview}`);

        // detached + stdio ignore + unref：让 PotPlayer 独立运行，不阻塞本应用退出
        const childProcess = this.launchExternalPlayer(potplayerPath, spawnArgs, {
            detached: true,
            stdio: 'ignore'
        });

        // 启动失败（如路径不存在）时仅记录日志，不影响主流程
        if (childProcess && typeof childProcess.on === 'function') {
            childProcess.on('error', (error) => {
                console.error('启动 PotPlayer 失败:', error.message || error);
            });
        }
        if (childProcess && typeof childProcess.unref === 'function') {
            childProcess.unref();
        }

        return childProcess;
    }

    /**
     * 构造 PotPlayer 命令行预览字符串
     * 仅用于调试日志展示：把可执行文件路径与参数按 Windows 习惯拼接成可读的命令行形式
     * （含空格的参数加双引号），不会影响实际 spawn 调用的参数数组。
     * @param {string} potplayerPath - PotPlayer 可执行文件路径
     * @param {Array<string>} args - 实际传给 spawn 的参数数组
     * @returns {string} 命令行预览字符串
     */
    buildPotplayerCommandPreview(potplayerPath, args) {
        const quote = (value) => {
            const stringValue = String(value);
            // 已显式包裹双引号的参数（如电影路径）按原样输出，避免重复转义
            if (stringValue.length >= 2 && stringValue.startsWith('"') && stringValue.endsWith('"')) {
                return stringValue;
            }
            // 含空格 / 制表符 / 双引号的参数统一加引号，保持与 Windows 命令行规范一致
            if (/[\s"]/.test(stringValue)) {
                return `"${stringValue.replace(/"/g, '\\"')}"`;
            }
            return stringValue;
        };

        return [potplayerPath, ...args].map(quote).join(' ');
    }

    /**
     * 获取当前播放列表
     */
    getCurrentPlaylist() {
        return this.currentPlaylist;
    }

    /**
     * 获取当前播放索引
     */
    getCurrentIndex() {
        return this.currentIndex;
    }

    /**
     * 下一首
     * @returns {Object|null} 下一首信息，如果没有下一首返回 null
     */
    next() {
        if (this.currentIndex < this.currentPlaylist.length - 1) {
            this.currentIndex++;
            return this.currentPlaylist[this.currentIndex];
        }
        return null;
    }

    /**
     * 上一首
     * @returns {Object|null} 上一首信息，如果没有上一首返回 null
     */
    previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.currentPlaylist[this.currentIndex];
        }
        return null;
    }

    /**
     * 跳转到指定索引
     * @param {number} index - 目标索引
     * @returns {Object|null} 目标视频信息
     */
    goTo(index) {
        if (index >= 0 && index < this.currentPlaylist.length) {
            this.currentIndex = index;
            return this.currentPlaylist[this.currentIndex];
        }
        return null;
    }

    /**
     * 是否有下一首
     */
    hasNext() {
        return this.currentIndex < this.currentPlaylist.length - 1;
    }

    /**
     * 是否有上一首
     */
    hasPrevious() {
        return this.currentIndex > 0;
    }

    /**
     * 查找视频文件同目录下的字幕文件
     * @param {string} videoPath - 视频文件路径
     * @returns {Promise<Array>} 字幕文件列表
     */
    async findSubtitleFiles(videoPath) {
        if (!videoPath) {
            return [];
        }

        try {
            const videoDir = path.dirname(videoPath);
            const videoBasename = path.basename(videoPath, path.extname(videoPath));
            
            const files = await fs.readdir(videoDir);
            
            const subtitleFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ext === '.srt' || ext === '.ass';
            }).map(file => ({
                filename: file,
                path: path.join(videoDir, file),
                basename: path.basename(file, path.extname(file)),
                ext: path.extname(file).toLowerCase()
            }));

            return subtitleFiles.sort((a, b) => a.filename.localeCompare(b.filename));
        } catch (error) {
            console.error('查找字幕文件失败:', error.message || error);
            return [];
        }
    }

    /**
     * 自动加载字幕文件
     * 优先级：同名.ass > 同名.srt > 其他.ass（按文件名排序） > 其他.srt（按文件名排序）
     * @param {string} videoPath - 视频文件路径
     * @returns {Promise<Object|null>} 字幕文件信息或null
     */
    async getAutoSubtitle(videoPath) {
        if (!videoPath) {
            return null;
        }

        const subtitleFiles = await this.findSubtitleFiles(videoPath);
        
        if (subtitleFiles.length === 0) {
            return null;
        }

        const videoBasename = path.basename(videoPath, path.extname(videoPath));
        
        const assFiles = subtitleFiles.filter(f => f.ext === '.ass');
        const srtFiles = subtitleFiles.filter(f => f.ext === '.srt');

        const sameNameAss = assFiles.find(f => f.basename === videoBasename);
        if (sameNameAss) {
            return sameNameAss;
        }

        const sameNameSrt = srtFiles.find(f => f.basename === videoBasename);
        if (sameNameSrt) {
            return sameNameSrt;
        }

        if (assFiles.length > 0) {
            return assFiles[0];
        }

        if (srtFiles.length > 0) {
            return srtFiles[0];
        }

        return null;
    }

    /**
     * 解析SRT格式字幕文件
     * @param {string} subtitlePath - 字幕文件路径
     * @returns {Promise<Array>} 字幕条目数组
     */
    async parseSRT(subtitlePath) {
        try {
            const content = await fs.readFile(subtitlePath, 'utf-8');
            const lines = content.split(/\r?\n/);
            const subtitles = [];
            
            let i = 0;
            while (i < lines.length) {
                while (i < lines.length && lines[i].trim() === '') {
                    i++;
                }
                
                if (i >= lines.length) break;
                
                const indexLine = lines[i].trim();
                if (!/^\d+$/.test(indexLine)) {
                    i++;
                    continue;
                }
                
                i++;
                if (i >= lines.length) break;
                
                const timeLine = lines[i].trim();
                const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
                if (!timeMatch) {
                    i++;
                    continue;
                }
                
                const startTime = parseInt(timeMatch[1]) * 3600000 + 
                                 parseInt(timeMatch[2]) * 60000 + 
                                 parseInt(timeMatch[3]) * 1000 + 
                                 parseInt(timeMatch[4]);
                const endTime = parseInt(timeMatch[5]) * 3600000 + 
                               parseInt(timeMatch[6]) * 60000 + 
                               parseInt(timeMatch[7]) * 1000 + 
                               parseInt(timeMatch[8]);
                
                i++;
                const textLines = [];
                while (i < lines.length && lines[i].trim() !== '') {
                    textLines.push(lines[i].trim());
                    i++;
                }
                
                if (textLines.length > 0) {
                    subtitles.push({
                        startTime: startTime / 1000,
                        endTime: endTime / 1000,
                        text: textLines.join('\n')
                    });
                }
            }
            
            return subtitles;
        } catch (error) {
            console.error('解析SRT字幕失败:', error.message || error);
            return [];
        }
    }

    /**
     * 解析ASS格式字幕文件
     * @param {string} subtitlePath - 字幕文件路径
     * @returns {Promise<Array>} 字幕条目数组
     */
    async parseASS(subtitlePath) {
        try {
            const content = await fs.readFile(subtitlePath, 'utf-8');
            const lines = content.split(/\r?\n/);
            const subtitles = [];
            
            for (const line of lines) {
                if (line.startsWith('Dialogue:')) {
                    const parts = line.substring('Dialogue:'.length).split(',');
                    
                    if (parts.length >= 10) {
                        const startTimeStr = parts[1].trim();
                        const endTimeStr = parts[2].trim();
                        const text = parts.slice(9).join(',').trim();
                        
                        const startTime = this.parseASSTime(startTimeStr);
                        const endTime = this.parseASSTime(endTimeStr);
                        
                        const cleanText = text
                            .replace(/\{[^}]*\}/g, '')
                            .replace(/\\N/g, '\n')
                            .replace(/\\n/g, '\n')
                            .trim();
                        
                        if (cleanText) {
                            subtitles.push({
                                startTime: startTime,
                                endTime: endTime,
                                text: cleanText
                            });
                        }
                    }
                }
            }
            
            return subtitles.sort((a, b) => a.startTime - b.startTime);
        } catch (error) {
            console.error('解析ASS字幕失败:', error.message || error);
            return [];
        }
    }

    /**
     * 解析ASS时间格式 (H:MM:SS.CC)
     * @param {string} timeStr - ASS时间字符串
     * @returns {number} 秒数
     */
    parseASSTime(timeStr) {
        const match = timeStr.match(/(\d+):(\d{2}):(\d{2})\.(\d{2})/);
        if (!match) return 0;
        
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const centiseconds = parseInt(match[4]);
        
        return hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
    }

    /**
     * 加载字幕文件
     * @param {string} subtitlePath - 字幕文件路径
     * @returns {Promise<Array>} 字幕条目数组
     */
    async loadSubtitle(subtitlePath) {
        if (!subtitlePath) {
            return [];
        }

        const ext = path.extname(subtitlePath).toLowerCase();

        if (ext === '.srt') {
            return await this.parseSRT(subtitlePath);
        } else if (ext === '.ass') {
            return await this.parseASS(subtitlePath);
        }

        return [];
    }

    /**
     * 计算快进 / 快退后的目标播放时间
     *
     * 边界规则：
     *   - 快退结果不低于 0；
     *   - 快进结果不超过 duration（duration 无效时不设上限，交由浏览器最终裁剪）；
     *   - 未知方向时保持当前播放时间不变。
     *
     * @param {number} currentTime - 当前播放时间（秒）
     * @param {number} duration - 视频总时长（秒）
     * @param {number} seekStep - 快进 / 快退间隔（秒）
     * @param {string} direction - 方向：DIRECTION_FORWARD（快进）/ DIRECTION_BACKWARD（快退）
     * @returns {number} 目标播放时间（秒）
     */
    calculateSeekTarget(currentTime, duration, seekStep, direction) {
        const step = normalizeSeekStep(seekStep);
        const baseTime = normalizeTime(currentTime);
        // duration 无效时使用 Infinity，使快进仅做加法、由浏览器裁剪到真实时长
        const maxTime = (typeof duration === 'number' && !isNaN(duration) && duration > 0)
            ? duration
            : Infinity;

        if (direction === DIRECTION_FORWARD) {
            // 快进：在当前时间基础上加步长，并裁剪到视频时长
            return Math.min(maxTime, baseTime + step);
        }

        if (direction === DIRECTION_BACKWARD) {
            // 快退：在当前时间基础上减步长，并裁剪到 0
            return Math.max(0, baseTime - step);
        }

        // 未知方向：保持原位
        return baseTime;
    }

    /**
     * 计算音量调节后的目标音量
     *
     * 边界规则：
     *   - 增大方向（up）结果不超过 VOLUME_MAX（100）；
     *   - 减小方向（down）结果不低于 VOLUME_MIN（0）；
     *   - 未知方向时保持当前音量不变。
     *
     * @param {number} currentVolume - 当前音量（百分比，0~100）
     * @param {number} volumeStep - 音量步长（百分比，正整数）
     * @param {string} direction - 方向：VOLUME_DIRECTION_UP（增大）/ VOLUME_DIRECTION_DOWN（减小）
     * @returns {number} 目标音量（百分比，0~100）
     */
    calculateVolumeTarget(currentVolume, volumeStep, direction) {
        const step = normalizeVolumeStep(volumeStep);
        const baseVolume = normalizeVolume(currentVolume);

        if (direction === VOLUME_DIRECTION_UP) {
            // 增大：在当前音量基础上加步长，并裁剪到上限 100
            return Math.min(VOLUME_MAX, baseVolume + step);
        }

        if (direction === VOLUME_DIRECTION_DOWN) {
            // 减小：在当前音量基础上减步长，并裁剪到下限 0
            return Math.max(VOLUME_MIN, baseVolume - step);
        }

        // 未知方向：保持原位
        return baseVolume;
    }
}

module.exports = PlayerService;
module.exports.DEFAULT_SEEK_STEP = DEFAULT_SEEK_STEP;
module.exports.DIRECTION_BACKWARD = DIRECTION_BACKWARD;
module.exports.DIRECTION_FORWARD = DIRECTION_FORWARD;
module.exports.DEFAULT_VOLUME_STEP = DEFAULT_VOLUME_STEP;
module.exports.VOLUME_MIN = VOLUME_MIN;
module.exports.VOLUME_MAX = VOLUME_MAX;
module.exports.VOLUME_DIRECTION_UP = VOLUME_DIRECTION_UP;
module.exports.VOLUME_DIRECTION_DOWN = VOLUME_DIRECTION_DOWN;
module.exports.PLAYER_TYPE_BUILTIN = PLAYER_TYPE_BUILTIN;
module.exports.PLAYER_TYPE_POTPLAYER = PLAYER_TYPE_POTPLAYER;
module.exports.isPotplayerEnabled = isPotplayerEnabled;