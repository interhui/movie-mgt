# 电影管理软件设计文档

## 1. 产品特性

### 1.1 核心功能概述

电影管理软件是一个基于Express.js和SQLite数据库的多用户电影收藏管理系统，提供电影库的展示、搜索、管理、评分、收藏等功能。系统支持用户注册登录，每个用户可以独立管理自己的电影收藏、评分和电影盒子。

### 1.2 功能特性列表

#### 1.2.1 用户管理
- **用户注册与登录**：
  - 用户名/密码注册
  - 用户名唯一性检查
  - 密码加密存储（bcrypt）
  - JWT Token认证
- **用户角色**：
  - 普通用户（user）：可以浏览电影、评分、收藏、创建盒子
  - 管理员（admin）：可以管理电影库、用户、系统设置
- **用户个人中心**：
  - 修改个人信息（昵称、邮箱、头像）
  - 修改密码
  - 查看个人统计数据

#### 1.2.2 首页展示
- **左右分栏布局**：
  - 左侧侧边栏：电影分类（MovieCategory）列表 + 电影盒子（MovieBox）列表
  - 右侧主区域：电影海报墙（类似游戏管理软件的游戏海报墙）
- **电影海报展示**：
  - 支持大、中、小三种尺寸调整
  - 海报下方显示：电影名称、主要演员、上映日期
  - 支持多选功能（复选框），用于批量操作
  - 显示用户个性化数据（评分、收藏状态）

#### 1.2.3 电影筛选与搜索
- **筛选条件**：
  - 按演员筛选
  - 按上映日期筛选（年份）
  - 按电影标签筛选
  - 按我的收藏筛选（登录后）
- **模糊搜索**：
  - 支持搜索字段：电影名称、电影介绍、演员名称、电影ID、电影标签、发行日期
  - 实时搜索，即时显示结果

#### 1.2.4 电影详情页
- **详情页布局**：
  - Header：电影名称
  - 左侧：电影海报（固定尺寸300px宽 × 400px高）
  - 右侧：电影属性信息表格
- **电影属性**：
  - ID（电影ID）
  - 电影介绍
  - 电影标签（关联tags表）
  - 电影出品方（studio）
  - 电影分类（关联category表）
  - 主要演员列表
  - 导演
  - 上映日期
  - 视频文件列表（支持多视频版本，采用列表方式展示，包括文件路径，视频类型（正片，花絮，预告）、视频编码（如H264），视频高，视频宽，视频长度）
- **用户个性化数据**：
  - 我的评分（1-5星）
  - 我的收藏状态
  - 我的观看记录
  - 我的备注
- **统计数据**：
  - 平均评分
  - 评分人数
  - 收藏人数
- **详情页操作**：
  - 编辑电影信息（管理员）
  - 评分（1-5星）
  - 收藏/取消收藏
  - 添加到电影盒子
  - 删除电影（管理员）

#### 1.2.5 评分与收藏
- **评分功能**：
  - 在海报上或详情页中评分（1-5星）
  - 星级可视化展示
  - 每个用户独立的评分系统
- **收藏功能**：
  - 点击海报上的收藏按钮进行收藏/取消收藏
  - 收藏状态有明显的视觉标识
  - 支持筛选已收藏的电影
  - 每个用户独立的收藏列表

#### 1.2.6 电影盒子
- **电影盒子功能**：
  - 创建个人电影盒子（类似播放列表）
  - 将喜欢的电影添加到电影盒子
  - 在电影盒子中管理电影（移除、调整顺序）
  - 电影盒子列表展示在侧边栏
  - 支持设置盒子公开/私密
- **盒子管理**：
  - 用户只能管理自己的盒子
  - 支持批量添加电影到盒子

#### 1.2.7 电影管理（管理员功能）
- **手动添加电影**：
  - 填写电影信息：电影名称、主演、导演、上映日期、电影标签、电影分类
  - 上传电影海报图片
  - 关联视频文件
- **视频文件管理**：
  - 支持为同一部电影添加多个视频文件（如不同清晰度版本）
  - 设置主视频文件
  - 区分正片、预告片、花絮等类型，视频文件类型采用下拉选择方式
- **批量删除**：
  - 多选后点击批量删除按钮
  - 确认提示后删除多部电影

#### 1.2.8 批量导入（管理员功能）
- **扫描目录导入**：
  - 选择包含电影的目录进行扫描
  - 目录结构要求：
    - 子文件夹代表一部电影
    - 每个子文件夹包含：
      - `movie.nfo` - 电影信息文件（XML格式）
      - `*-poster.jpg` - 电影海报图片
      - `*.mp4/mkv/avi` - 电影视频文件
- **NFO文件解析**：
  - 解析XML格式的movie.nfo文件
  - 提取：电影ID、电影名称、发行日期、电影介绍、时长、制作商、导演、标签、演员、视频信息、原始文件路径
  - 自动关联海报和视频文件

#### 1.2.9 批量操作
- **多选功能**：
  - 海报墙上支持复选框多选
  - 选中的电影高亮显示
- **批量操作类型**：
  - 批量删除（管理员）
  - 批量收藏
  - 批量添加到电影盒子

#### 1.2.10 用户管理（管理员功能）
- **用户列表**：
  - 查看所有注册用户
  - 搜索用户（用户名、邮箱）
- **用户管理操作**：
  - 启用/禁用用户账户
  - 修改用户角色
  - 重置用户密码
  - 删除用户

---

## 2. 代码结构

### 2.1 项目目录结构

```
movie-mgt/
├── app.js                        # Express应用入口
├── package.json                  # 项目配置
├── config/
│   ├── settings.json             # 应用设置（电影目录、盒子目录等）
│   ├── categories.json           # 电影分类配置
│   ├── tags.json                 # 电影标签配置
│   └── jwt.js                    # JWT配置（密钥、过期时间）
├── database/
│   ├── database.db               # SQLite数据库文件
│   └── init.js                   # 数据库初始化脚本
├── public/
│   ├── index.html                # 首页（电影海报墙）
│   ├── detail.html               # 电影详情页
│   ├── box.html                  # 电影盒子页面
│   ├── login.html                # 登录页面
│   ├── register.html             # 注册页面
│   ├── profile.html              # 个人中心页面
│   ├── admin.html                # 管理员后台页面
│   ├── css/
│   │   ├── themes/
│   │   │   ├── dark.css          # 深色主题
│   │   │   └── light.css         # 浅色主题
│   │   ├── main.css              # 主样式
│   │   ├── detail.css            # 详情页样式
│   │   ├── box.css               # 盒子页面样式
│   │   ├── auth.css              # 认证页面样式（登录/注册）
│   │   ├── profile.css           # 个人中心样式
│   │   └── admin.css             # 管理员后台样式
│   └── js/
│   │   ├── main.js               # 首页脚本
│   │   ├── detail.js             # 详情页脚本
│   │   ├── box.js                # 盒子页面脚本
│   │   ├── login.js              # 登录页脚本
│   │   ├── register.js           # 注册页脚本
│   │   ├── profile.js            # 个人中心脚本
│   │   ├── admin.js              # 管理员后台脚本
│   │   └── utils.js              # 公共工具函数（token管理、请求封装等）
│   └── images/                   # 公共图片资源
│       └── avatars/              # 默认头像资源
├── routes/
│   ├── index.js                  # 路由入口
│   ├── auth.js                   # 认证API路由（登录、注册、登出）
│   ├── movies.js                 # 电影API路由
│   ├── videos.js                 # 视频文件API路由
│   ├── categories.js             # 分类API路由
│   ├── tags.js                   # 标签API路由
│   ├── boxes.js                  # 电影盒子API路由
│   ├── users.js                  # 用户API路由（个人信息、密码修改）
│   ├── admin.js                  # 管理员API路由（用户管理、系统管理）
│   ├── stats.js                  # 统计数据API路由
│   └── settings.js               # 设置API路由
├── services/
│   ├── MovieService.js           # 电影业务逻辑
│   ├── VideoService.js           # 视频文件业务逻辑
│   ├── CategoryService.js        # 分类业务逻辑
│   ├── TagService.js             # 标签业务逻辑
│   ├── BoxService.js             # 电影盒子业务逻辑
│   ├── UserService.js            # 用户业务逻辑
│   ├── AuthService.js            # 认证业务逻辑
│   ├── AdminService.js           # 管理员业务逻辑
│   ├── StatsService.js           # 统计数据业务逻辑
│   ├── FileService.js            # 文件系统操作
│   ├── NfoParserService.js       # NFO文件解析
│   ├── CacheService.js           # 缓存服务（电影、盒子、标签、演员）
│   ├── DatabaseService.js        # 数据库操作
│   └── SettingsService.js        # 设置管理
├── models/
│   ├── Movie.js                  # 电影模型
│   ├── Video.js                  # 视频文件模型
│   ├── Category.js               # 分类模型
│   ├── Tag.js                    # 标签模型
│   ├── Actor.js                  # 演员模型
│   ├── User.js                   # 用户模型
│   ├── UserMovieData.js          # 用户电影数据模型
│   ├── Box.js                    # 电影盒子模型
│   └── MovieBox.js               # 电影-盒子关联模型
├── middleware/
│   ├── errorHandler.js           # 错误处理中间件
│   ├── auth.js                   # JWT认证中间件
│   ├── adminAuth.js              # 管理员权限验证中间件
│   ├── upload.js                 # 文件上传中间件（multer配置）
│   └── validation.js             # 请求数据验证中间件
├── utils/
│   ├── logger.js                 # 日志工具
│   ├── fileUtils.js              # 文件工具函数
│   ├── nfoUtils.js               # NFO解析工具
│   ├── passwordUtils.js          # 密码加密/验证工具
│   ├── jwtUtils.js               # JWT令牌生成/验证工具
│   ├── responseUtils.js          # API响应格式化工具
│   ├── validators.js             # 数据验证工具（邮箱、用户名等）
│   └── cacheUtils.js             # 缓存工具函数
├── uploads/                      # 用户上传文件目录
│   ├── posters/                  # 电影海报上传目录
│   ├── avatars/                  # 用户头像上传目录
│   └── temp/                     # 临时文件目录
├── movies/                       # 电影库目录（可配置）
│   └── {movie-folder}/
│       ├── movie.nfo
│       ├── poster.jpg
│       └── video.mp4
├── actors/                       # 演员目录（可配置）
│   └── {actors_id}/
│       └── {id}.jpg
└── boxes/                        # 电影盒子目录（可配置）
    └── {box-name}.json
```

### 2.2 Express.js架构说明

**技术栈**：
- Express.js 4.x - Web框架
- SQLite3 - 数据库（使用better-sqlite3或sqlite3）
- bcrypt - 密码加密
- jsonwebtoken - JWT认证
- multer - 文件上传处理
- express-static - 静态文件服务
- joi 或 express-validator - 数据验证

**架构特点**：
- MVC架构模式
- Service层负责业务逻辑
- RESTful API设计
- JWT Token身份认证
- 中间件处理认证、权限、错误
- 静态资源直接通过Express提供
- 增加数据缓存层，提升数据加载效率

### 2.3 核心模块说明

#### 2.3.1 认证模块
- `routes/auth.js`：处理登录、注册、登出请求
- `services/AuthService.js`：认证核心逻辑（密码验证、token生成）
- `middleware/auth.js`：JWT token验证中间件
- `utils/passwordUtils.js`：密码加密（bcrypt）和验证
- `utils/jwtUtils.js`：JWT token生成和验证

#### 2.3.2 用户管理模块
- `routes/users.js`：用户个人信息、密码修改API
- `routes/admin.js`：管理员用户管理API
- `services/UserService.js`：用户CRUD操作
- `services/AdminService.js`：管理员操作逻辑
- `middleware/adminAuth.js`：管理员权限验证
- `public/profile.html`：个人中心页面
- `public/admin.html`：管理员后台页面

#### 2.3.3 电影管理模块
- `routes/movies.js`：电影CRUD、搜索、筛选API
- `services/MovieService.js`：电影业务逻辑
- `models/Movie.js`：电影数据模型
- `services/NfoParserService.js`：NFO文件解析

#### 2.3.4 视频管理模块
- `routes/videos.js`：视频文件管理API
- `services/VideoService.js`：视频文件业务逻辑
- `models/Video.js`：视频数据模型

#### 2.3.5 用户电影数据模块
- 存储在 `models/UserMovieData.js`
- 通过 `services/UserService.js` 处理用户评分、收藏、观看记录
- 与电影数据关联返回用户个性化信息

#### 2.3.6 缓存模块
- `services/CacheService.js`：缓存核心服务
- `utils/cacheUtils.js`：缓存工具函数
- 缓存数据类型：
  - 电影库数据（movies）
  - 电影盒子数据（boxes）
  - 标签数据（tags）
  - 演员数据（actors）
  - 分类数据（categories）
- 缓存策略：
  - 读取时先检查缓存是否存在且未过期
  - 缓存不存在或已过期时从数据库加载
  - 数据写入时同步更新缓存
  - 支持设置不同数据类型的缓存有效期

---

## 3. 数据表设计

### 3.1 数据表结构

#### 3.1.1 movies表（电影）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | TEXT | 电影ID（唯一标识） | PRIMARY KEY |
| title | TEXT | 电影名称 | NOT NULL |
| description | TEXT | 电影介绍 | |
| release_date | DATE | 上映日期 | |
| runtime | INTEGER | 电影时长（分钟） | |
| studio | TEXT | 电影出品方 | |
| director | TEXT | 导演 | |
| poster_path | TEXT | 海报图片路径 | |
| category_id | INTEGER | 电影分类ID | FOREIGN KEY |
| rating | INTEGER | 电影评分（1-5） | DEFAULT 0 |
| view_count | INTEGER | 观看次数 | DEFAULT 0 |
| create_time | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| update_time | DATETIME | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**说明**：视频文件信息已独立为videos表，通过movie_id关联。
注意：rating字段保留作为全局默认值，用户个性化数据存储在 user_movie_data 表中。

#### 3.1.2 users表（用户）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 用户ID | PRIMARY KEY AUTOINCREMENT |
| username | TEXT | 用户名 | NOT NULL UNIQUE |
| password_hash | TEXT | 密码哈希值 | NOT NULL |
| salt | TEXT | 密码盐值 | NOT NULL |
| nickname | TEXT | 用户昵称 | |
| email | TEXT | 邮箱地址 | UNIQUE |
| avatar | TEXT | 头像路径 | |
| role | TEXT | 用户角色（admin, user） | DEFAULT 'user' |
| is_active | BOOLEAN | 是否激活 | DEFAULT TRUE |
| last_login_time | DATETIME | 最后登录时间 | |
| create_time | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| update_time | DATETIME | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**说明**：
- `password_hash`：使用bcrypt加密存储的密码哈希
- `salt`：用于增强密码安全性的随机盐值
- `role`：区分管理员和普通用户权限

#### 3.1.3 user_movie_data表（用户电影数据）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 记录ID | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | 用户ID | FOREIGN KEY |
| movie_id | TEXT | 电影ID | FOREIGN KEY |
| rating | INTEGER | 用户评分（1-5） | DEFAULT 0 |
| is_favorite | BOOLEAN | 是否收藏 | DEFAULT FALSE |
| view_count | INTEGER | 观看次数 | DEFAULT 0 |
| last_view_time | DATETIME | 最后观看时间 | |
| user_notes | TEXT | 用户备注 | |
| create_time | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| update_time | DATETIME | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**唯一约束**：(user_id, movie_id)

**说明**：存储每个用户对电影的个性化数据，包括评分、收藏、观看记录等。

#### 3.1.4 categories表（电影分类）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 分类ID | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | 分类名称 | NOT NULL UNIQUE |
| description | TEXT | 分类描述 | |
| color | TEXT | 分类颜色（用于UI） | |
| order | INTEGER | 排序顺序 | DEFAULT 0 |

#### 3.1.5 tags表（电影标签）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 标签ID | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | 标签名称 | NOT NULL UNIQUE |
| color | TEXT | 标签颜色（用于UI） | |

#### 3.1.6 actors表（演员）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 演员ID | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | 演员名称 | NOT NULL |
| birthday | INTEGER | 演员出生年月 |  |
| memo | TEXT | 演员备注|  |
| photo_path | TEXT | 演员照片路径|  |

#### 3.1.7 movie_actors表（电影-演员关联）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| movie_id | TEXT | 电影ID | FOREIGN KEY |
| actor_id | INTEGER | 演员ID | FOREIGN KEY |
| role | TEXT | 角色名称 | |

主键：(movie_id, actor_id)

#### 3.1.8 movie_tags表（电影-标签关联）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| movie_id | TEXT | 电影ID | FOREIGN KEY |
| tag_id | INTEGER | 标签ID | FOREIGN KEY |

主键：(movie_id, tag_id)

#### 3.1.9 boxes表（电影盒子）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 盒子ID | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | 用户ID | FOREIGN KEY |
| name | TEXT | 盒子名称 | NOT NULL |
| description | TEXT | 盒子描述 | |
| is_public | BOOLEAN | 是否公开 | DEFAULT FALSE |
| create_time | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| update_time | DATETIME | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**唯一约束**：(user_id, name)

**说明**：
- `user_id`：盒子属于哪个用户
- `is_public`：是否公开分享给其他用户查看

#### 3.1.10 movie_boxes表（电影-盒子关联）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 关联ID | PRIMARY KEY AUTOINCREMENT |
| movie_id | TEXT | 电影ID | FOREIGN KEY |
| box_id | INTEGER | 盒子ID | FOREIGN KEY |
| order | INTEGER | 排序顺序 | DEFAULT 0 |
| add_time | DATETIME | 添加时间 | DEFAULT CURRENT_TIMESTAMP |

**唯一约束**：(movie_id, box_id)

#### 3.1.11 videos表（视频文件）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 视频ID | PRIMARY KEY AUTOINCREMENT |
| movie_id | TEXT | 电影ID | FOREIGN KEY |
| file_name | TEXT | 视频文件名 | NOT NULL |
| file_path | TEXT | 视频文件路径 | NOT NULL |
| file_size | INTEGER | 文件大小（字节） | |
| codec | TEXT | 视频编码（如H264、HEVC） | |
| width | INTEGER | 视频宽度（像素） | |
| height | INTEGER | 视频高度（像素） | |
| duration | INTEGER | 视频时长（秒） | |
| bitrate | INTEGER | 比特率（kbps） | |
| fps | TEXT | 帧率（如23.976、30） | |
| audio_codec | TEXT | 音频编码（如AAC、AC3） | |
| audio_channels | INTEGER | 音频声道数 | |
| is_primary | BOOLEAN | 是否为主要视频文件 | DEFAULT FALSE |
| video_type | TEXT | 视频类型（Main, Extra, Trailer等） | DEFAULT 'Main' |
| quality | TEXT | 视频质量标签（如4K、1080p、720p） | |
| language | TEXT | 音频语言 | |
| subtitle | TEXT | 字幕语言 | |
| create_time | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

**说明**：
- `movie_id`：关联movies表，一个电影可以有多个视频文件（1:N关系）
- `is_primary`：标记主要播放的视频文件（每个电影只能有一个primary视频）
- `video_type`：区分正片、预告片、花絮等不同类型
- `quality`：方便用户识别视频质量

### 3.2 数据关系说明

#### 3.2.1 用户相关关系

- **users → user_movie_data**：1:N（一个用户可以有多条电影数据记录）
- **users → boxes**：1:N（一个用户可以有多个电影盒子）
- **movies → user_movie_data**：1:N（一部电影可以被多个用户评价/收藏）

#### 3.2.2 电影相关关系

- **movies → videos**：1:N（一部电影可以有多个视频文件版本）
- **movies → movie_actors**：1:N（一部电影可以有多个演员）
- **movies → movie_tags**：1:N（一部电影可以有多个标签）
- **movies → movie_boxes**：1:N（一部电影可以属于多个盒子）
- **boxes → movie_boxes**：1:N（一个盒子可以包含多部电影）

### 3.3 索引设计

```sql
-- 用户相关索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 用户电影数据索引
CREATE INDEX idx_user_movie_data_user ON user_movie_data(user_id);
CREATE INDEX idx_user_movie_data_movie ON user_movie_data(movie_id);
CREATE UNIQUE INDEX idx_user_movie_data_unique ON user_movie_data(user_id, movie_id);

-- 电影名称索引（用于搜索）
CREATE INDEX idx_movies_title ON movies(title);

-- 上映日期索引（用于筛选）
CREATE INDEX idx_movies_release_date ON movies(release_date);

-- 分类索引（用于筛选）
CREATE INDEX idx_movies_category ON movies(category_id);

-- 演员名称索引（用于搜索和筛选）
CREATE INDEX idx_actors_name ON actors(name);

-- 电影演员关联索引
CREATE INDEX idx_movie_actors_movie ON movie_actors(movie_id);
CREATE INDEX idx_movie_actors_actor ON movie_actors(actor_id);

-- 电影标签关联索引
CREATE INDEX idx_movie_tags_movie ON movie_tags(movie_id);
CREATE INDEX idx_movie_tags_tag ON movie_tags(tag_id);

-- 电影盒子索引
CREATE INDEX idx_boxes_user ON boxes(user_id);
CREATE INDEX idx_movie_boxes_box ON movie_boxes(box_id);
CREATE INDEX idx_movie_boxes_movie ON movie_boxes(movie_id);

-- 视频文件关联索引
CREATE INDEX idx_videos_movie ON videos(movie_id);
CREATE INDEX idx_videos_quality ON videos(quality);
CREATE INDEX idx_videos_type ON videos(video_type);
CREATE INDEX idx_videos_primary ON videos(movie_id, is_primary);
```

### 3.4 数据库初始化SQL

```sql
-- 初始化默认管理员账户（密码：admin123，需要通过bcrypt加密）
-- 注意：实际部署时应使用更安全的密码
INSERT INTO users (username, password_hash, salt, nickname, role) VALUES
('admin', '$2b$10$encrypted_password_hash_here', 'random_salt_here', '管理员', 'admin');

-- 初始化电影分类
INSERT INTO categories (name, description, color, `order`) VALUES
('动作', '动作电影', '#FF5722', 1),
('喜剧', '喜剧电影', '#FFC107', 2),
('科幻', '科幻电影', '#03A9F4', 3),
('恐怖', '恐怖电影', '#9C27B0', 4),
('爱情', '爱情电影', '#E91E63', 5),
('剧情', '剧情电影', '#4CAF50', 6),
('动画', '动画电影', '#2196F3', 7),
('记录', '纪录片', '#795548', 8);

-- 初始化常用标签
INSERT INTO tags (name, color) VALUES
('经典', '#FFD700'),
('获奖', '#C0C0C0'),
('推荐', '#00BCD4'),
('待看', '#FF9800'),
('已看', '#4CAF50'),
('收藏', '#E91E63');
```

### 3.5 数据库表创建SQL

```sql
-- 创建users表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    nickname TEXT,
    email TEXT UNIQUE,
    avatar TEXT,
    role TEXT DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_time DATETIME,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建movies表
CREATE TABLE IF NOT EXISTS movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    release_date DATE,
    runtime INTEGER,
    studio TEXT,
    director TEXT,
    poster_path TEXT,
    category_id INTEGER,
    rating INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 创建user_movie_data表
CREATE TABLE IF NOT EXISTS user_movie_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id TEXT NOT NULL,
    rating INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    last_view_time DATETIME,
    user_notes TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    UNIQUE(user_id, movie_id)
);

-- 创建categories表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT,
    `order` INTEGER DEFAULT 0
);

-- 创建tags表
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT
);

-- 创建actors表
CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

-- 创建movie_actors表
CREATE TABLE IF NOT EXISTS movie_actors (
    movie_id TEXT NOT NULL,
    actor_id INTEGER NOT NULL,
    role TEXT,
    PRIMARY KEY (movie_id, actor_id),
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    FOREIGN KEY (actor_id) REFERENCES actors(id)
);

-- 创建movie_tags表
CREATE TABLE IF NOT EXISTS movie_tags (
    movie_id TEXT NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (movie_id, tag_id),
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- 创建boxes表
CREATE TABLE IF NOT EXISTS boxes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, name)
);

-- 创建movie_boxes表
CREATE TABLE IF NOT EXISTS movie_boxes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id TEXT NOT NULL,
    box_id INTEGER NOT NULL,
    `order` INTEGER DEFAULT 0,
    add_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    FOREIGN KEY (box_id) REFERENCES boxes(id),
    UNIQUE(movie_id, box_id)
);

-- 创建videos表
CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    codec TEXT,
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    bitrate INTEGER,
    fps TEXT,
    audio_codec TEXT,
    audio_channels INTEGER,
    is_primary BOOLEAN DEFAULT FALSE,
    video_type TEXT DEFAULT 'Main',
    quality TEXT,
    language TEXT,
    subtitle TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
);
```

---

## 4. API设计

### 4.1 RESTful API规范

**基础路径**：`/api`

**响应格式**：JSON

**通用响应结构**：
```json
{
  "success": true/false,
  "data": {},
  "message": "",
  "error": ""
}
```

### 4.2 认证相关API

#### 4.2.1 用户注册

```
POST /api/auth/register

Body：
{
  "username": "user001",
  "password": "password123",
  "nickname": "用户昵称",
  "email": "user@example.com"
}

响应：
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "user001",
    "nickname": "用户昵称"
  },
  "message": "注册成功"
}
```

#### 4.2.2 用户登录

```
POST /api/auth/login

Body：
{
  "username": "user001",
  "password": "password123"
}

响应：
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "username": "user001",
      "nickname": "用户昵称",
      "email": "user@example.com",
      "role": "user",
      "avatar": "/uploads/avatars/1.jpg"
    }
  },
  "message": "登录成功"
}

错误响应：
{
  "success": false,
  "error": "用户名或密码错误"
}
```

#### 4.2.3 用户登出

```
POST /api/auth/logout

Headers：
Authorization: Bearer <token>

响应：
{
  "success": true,
  "message": "登出成功"
}
```

#### 4.2.4 获取当前用户信息

```
GET /api/auth/me

Headers：
Authorization: Bearer <token>

响应：
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user001",
    "nickname": "用户昵称",
    "email": "user@example.com",
    "role": "user",
    "avatar": "/uploads/avatars/1.jpg",
    "last_login_time": "2024-01-01 12:00:00"
  }
}
```

#### 4.2.5 修改密码

```
PUT /api/auth/password

Headers：
Authorization: Bearer <token>

Body：
{
  "old_password": "old_password123",
  "new_password": "new_password456"
}

响应：
{
  "success": true,
  "message": "密码修改成功"
}
```

#### 4.2.6 修改用户信息

```
PUT /api/auth/profile

Headers：
Authorization: Bearer <token>

Body（multipart/form-data）：
- nickname: 新昵称
- email: 新邮箱
- avatar: 头像图片文件

响应：
{
  "success": true,
  "message": "用户信息更新成功"
}
```

### 4.3 电影相关API

#### 4.3.1 获取电影列表

```
GET /api/movies

Headers：
Authorization: Bearer <token>（可选，如提供则返回用户个性化数据）

Query参数：
- page: 页码（默认1）
- limit: 每页数量（默认50）
- sort: 排序字段（name, release_date, rating）
- order: 排序方向（asc, desc）
- category_id: 分类ID筛选
- actor_id: 演员ID筛选
- tag_id: 标签ID筛选
- year: 年份筛选
- favorite: 是否收藏筛选（true/false）- 需要登录
- search: 搜索关键词

响应：
{
  "success": true,
  "data": {
    "movies": [
      {
        "id": "movie-001",
        "title": "电影名称",
        "actors": ["演员1", "演员2"],
        "release_date": "2024-01-01",
        "poster_path": "/movies/movie-001/poster.jpg",
        "user_data": {
          "rating": 4,
          "is_favorite": true,
          "view_count": 3
        }
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 50
  }
}
```

#### 4.3.2 获取电影详情

```
GET /api/movies/:id

Headers：
Authorization: Bearer <token>（可选，如提供则返回用户个性化数据）

响应：
{
  "success": true,
  "data": {
    "id": "movie-001",
    "title": "电影名称",
    "description": "电影介绍内容...",
    "release_date": "2024-01-01",
    "runtime": 120,
    "studio": "出品方名称",
    "director": "导演名称",
    "poster_path": "/movies/movie-001/poster.jpg",
    "category": {
      "id": 1,
      "name": "动作"
    },
    "tags": [
      {"id": 1, "name": "经典"},
      {"id": 2, "name": "获奖"}
    ],
    "actors": [
      {"id": 1, "name": "演员1", "role": "主角"},
      {"id": 2, "name": "演员2", "role": "配角"}
    ],
    "videos": [
      {
        "id": 1,
        "file_name": "video-1080p.mp4",
        "file_path": "/movies/movie-001/video-1080p.mp4",
        "file_size": 2147483648,
        "codec": "H264",
        "width": 1920,
        "height": 1080,
        "duration": 7200,
        "bitrate": 8000,
        "fps": "23.976",
        "audio_codec": "AAC",
        "audio_channels": 6,
        "is_primary": true,
        "video_type": "Main",
        "quality": "1080p",
        "language": "zh",
        "subtitle": "zh-CN"
      },
      {
        "id": 2,
        "file_name": "video-720p.mp4",
        "file_path": "/movies/movie-001/video-720p.mp4",
        "codec": "H264",
        "width": 1280,
        "height": 720,
        "duration": 7200,
        "is_primary": false,
        "video_type": "Main",
        "quality": "720p"
      },
      {
        "id": 3,
        "file_name": "trailer.mp4",
        "file_path": "/movies/movie-001/trailer.mp4",
        "is_primary": false,
        "video_type": "Trailer",
        "quality": "1080p"
      }
    ],
    "user_data": {
      "rating": 4,
      "is_favorite": true,
      "view_count": 3,
      "last_view_time": "2024-01-15 20:30:00",
      "user_notes": "非常精彩的电影"
    },
    "stats": {
      "avg_rating": 4.2,
      "rating_count": 150,
      "favorite_count": 45
    }
  }
}
```

#### 4.3.3 添加电影

```
POST /api/movies

Headers：
Authorization: Bearer <token>（需要管理员权限）

Body（multipart/form-data）：
- title: 电影名称（必填）
- description: 电影介绍
- release_date: 上映日期
- runtime: 电影时长（分钟）
- studio: 出品方
- director: 导演
- category_id: 分类ID
- actor_ids: 演员ID数组（JSON字符串）
- tag_ids: 标签ID数组（JSON字符串）
- poster: 海报图片文件

响应：
{
  "success": true,
  "data": {
    "id": "movie-new-id",
    "title": "电影名称",
    ...
  },
  "message": "电影添加成功"
}
```

#### 4.3.4 更新电影

```
PUT /api/movies/:id

Headers：
Authorization: Bearer <token>（需要管理员权限）

Body（multipart/form-data）：
同添加电影

响应：
{
  "success": true,
  "message": "电影更新成功"
}
```

#### 4.3.5 删除电影

```
DELETE /api/movies/:id

Headers：
Authorization: Bearer <token>（需要管理员权限）

响应：
{
  "success": true,
  "message": "电影删除成功"
}
```

#### 4.3.6 批量删除电影

```
POST /api/movies/batch-delete

Headers：
Authorization: Bearer <token>（需要管理员权限）

Body：
{
  "movie_ids": ["movie-001", "movie-002", "movie-003"]
}

响应：
{
  "success": true,
  "data": {
    "deleted_count": 3
  },
  "message": "批量删除成功"
}
```

#### 4.3.7 设置评分（用户）

```
POST /api/movies/:id/rating

Headers：
Authorization: Bearer <token>

Body：
{
  "rating": 5
}

响应：
{
  "success": true,
  "data": {
    "rating": 5,
    "user_id": 1,
    "movie_id": "movie-001"
  },
  "message": "评分设置成功"
}
```

#### 4.3.8 设置收藏（用户）

```
POST /api/movies/:id/favorite

Headers：
Authorization: Bearer <token>

Body：
{
  "is_favorite": true
}

响应：
{
  "success": true,
  "data": {
    "is_favorite": true,
    "user_id": 1,
    "movie_id": "movie-001"
  },
  "message": "收藏设置成功"
}
```

#### 4.3.9 批量收藏（用户）

```
POST /api/movies/batch-favorite

Headers：
Authorization: Bearer <token>

Body：
{
  "movie_ids": ["movie-001", "movie-002"],
  "is_favorite": true
}

响应：
{
  "success": true,
  "data": {
    "updated_count": 2
  },
  "message": "批量收藏成功"
}
```

#### 4.3.10 记录观看

```
POST /api/movies/:id/view

Headers：
Authorization: Bearer <token>

Body：
{
  "duration": 3600（观看时长，秒）
}

响应：
{
  "success": true,
  "data": {
    "view_count": 4,
    "last_view_time": "2024-01-15 21:00:00"
  },
  "message": "观看记录更新成功"
}
```

#### 4.3.11 添加视频文件

```
POST /api/movies/:id/videos

Headers：
Authorization: Bearer <token>（需要管理员权限）

Body（multipart/form-data）：
- video_file: 视频文件
- video_type: 视频类型（Main, Trailer, Extra）
- quality: 质量标签（1080p, 720p, 4K）
- language: 音频语言
- subtitle: 字幕语言
- is_primary: 是否为主要视频（true/false）

响应：
{
  "success": true,
  "data": {
    "video_id": 10,
    "file_name": "new-video.mp4"
  },
  "message": "视频文件添加成功"
}
```

#### 4.3.12 删除视频文件

```
DELETE /api/movies/:movieId/videos/:videoId

Headers：
Authorization: Bearer <token>（需要管理员权限）

响应：
{
  "success": true,
  "message": "视频文件删除成功"
}
```

#### 4.3.13 扫描目录导入

```
POST /api/movies/import/scan

Headers：
Authorization: Bearer <token>（需要管理员权限）

Body：
{
  "scan_path": "/path/to/movies/directory"
}

响应：
{
  "success": true,
  "data": {
    "scanned_count": 10,
    "movies": [
      {
        "folder_name": "Movie1",
        "nfo_exists": true,
        "poster_exists": true,
        "video_exists": true,
        "video_files": ["video.mp4"]
      }
    ]
  },
  "message": "目录扫描完成"
}
```

#### 4.3.14 执行批量导入

```
POST /api/movies/import/execute

Headers：
Authorization: Bearer <token>（需要管理员权限）

Body：
{
  "scan_path": "/path/to/movies/directory",
  "movies": [
    {
      "folder_name": "Movie1",
      "import": true
    }
  ]
}

响应：
{
  "success": true,
  "data": {
    "imported_count": 8,
    "failed_count": 2,
    "errors": [
      "Movie3: NFO文件格式错误",
      "Movie5: 缺少海报图片"
    ]
  },
  "message": "批量导入完成"
}
```

#### 4.3.15 搜索电影

```
GET /api/movies/search

Headers：
Authorization: Bearer <token>（可选）

Query参数：
- keyword: 搜索关键词
- fields: 搜索字段（逗号分隔：title,description,actor,id,tag,date）
- page: 页码
- limit: 每页数量

响应：
{
  "success": true,
  "data": {
    "movies": [
      {
        "id": "movie-001",
        "title": "电影名称",
        "poster_path": "...",
        "user_data": {
          "rating": 4,
          "is_favorite": true
        }
      }
    ],
    "total": 20,
    "keyword": "搜索关键词"
  }
}
```

### 4.4 分类相关API

#### 4.3.1 获取分类列表

```
GET /api/categories

响应：
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "动作",
        "description": "动作电影",
        "color": "#FF5722",
        "movie_count": 50
      }
    ]
  }
}
```

#### 4.3.2 添加分类

```
POST /api/categories

Body：
{
  "name": "分类名称",
  "description": "分类描述",
  "color": "#FFFFFF"
}

响应：
{
  "success": true,
  "data": {
    "id": 9,
    "name": "分类名称"
  },
  "message": "分类添加成功"
}
```

#### 4.3.3 更新分类

```
PUT /api/categories/:id

响应：
{
  "success": true,
  "message": "分类更新成功"
}
```

#### 4.3.4 删除分类

```
DELETE /api/categories/:id

响应：
{
  "success": true,
  "message": "分类删除成功"
}
```

### 4.4 标签相关API

#### 4.4.1 获取标签列表

```
GET /api/tags

响应：
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": 1,
        "name": "经典",
        "color": "#FFD700",
        "movie_count": 30
      }
    ]
  }
}
```

#### 4.4.2 添加标签

```
POST /api/tags

Body：
{
  "name": "标签名称",
  "color": "#FFFFFF"
}

响应：
{
  "success": true,
  "data": {
    "id": 10,
    "name": "标签名称"
  },
  "message": "标签添加成功"
}
```

#### 4.4.3 删除标签

```
DELETE /api/tags/:id

响应：
{
  "success": true,
  "message": "标签删除成功"
}
```

### 4.5 电影盒子相关API

#### 4.5.1 获取盒子列表

```
GET /api/boxes

Headers：
Authorization: Bearer <token>

响应：
{
  "success": true,
  "data": {
    "boxes": [
      {
        "id": 1,
        "name": "我的收藏",
        "description": "最喜欢的电影",
        "user_id": 1,
        "movie_count": 20,
        "is_public": false,
        "create_time": "2024-01-01"
      }
    ]
  }
}
```

#### 4.5.2 获取盒子详情

```
GET /api/boxes/:id

Headers：
Authorization: Bearer <token>

响应：
{
  "success": true,
  "data": {
    "id": 1,
    "name": "我的收藏",
    "description": "最喜欢的电影",
    "user_id": 1,
    "is_public": false,
    "movies": [
      {
        "id": "movie-001",
        "title": "电影名称",
        "poster_path": "...",
        "order": 1,
        "add_time": "2024-01-01",
        "user_data": {
          "rating": 4,
          "is_favorite": true
        }
      }
    ],
    "movie_count": 20
  }
}
```

#### 4.5.3 创建盒子

```
POST /api/boxes

Headers：
Authorization: Bearer <token>

Body：
{
  "name": "盒子名称",
  "description": "盒子描述",
  "is_public": false
}

响应：
{
  "success": true,
  "data": {
    "id": 2,
    "name": "盒子名称",
    "user_id": 1
  },
  "message": "盒子创建成功"
}
```

#### 4.5.4 更新盒子

```
PUT /api/boxes/:id

Headers：
Authorization: Bearer <token>

Body：
{
  "name": "新名称",
  "description": "新描述",
  "is_public": true
}

响应：
{
  "success": true,
  "message": "盒子更新成功"
}
```

#### 4.5.5 删除盒子

```
DELETE /api/boxes/:id

Headers：
Authorization: Bearer <token>

响应：
{
  "success": true,
  "message": "盒子删除成功"
}
```

#### 4.5.6 添加电影到盒子

```
POST /api/boxes/:id/movies

Headers：
Authorization: Bearer <token>

Body：
{
  "movie_id": "movie-001"
}

响应：
{
  "success": true,
  "message": "电影添加到盒子成功"
}
```

#### 4.5.7 从盒子移除电影

```
DELETE /api/boxes/:id/movies/:movie_id

Headers：
Authorization: Bearer <token>

响应：
{
  "success": true,
  "message": "电影从盒子移除成功"
}
```

#### 4.5.8 批量添加电影到盒子

```
POST /api/boxes/:id/movies/batch-add

Headers：
Authorization: Bearer <token>

Body：
{
  "movie_ids": ["movie-001", "movie-002", "movie-003"]
}

响应：
{
  "success": true,
  "data": {
    "added_count": 3
  },
  "message": "批量添加成功"
}
```

#### 4.5.9 调整盒子中电影顺序

```
PUT /api/boxes/:id/movies/order

Headers：
Authorization: Bearer <token>

Body：
{
  "movie_orders": [
    {"movie_id": "movie-001", "order": 1},
    {"movie_id": "movie-002", "order": 2},
    {"movie_id": "movie-003", "order": 3}
  ]
}

响应：
{
  "success": true,
  "message": "顺序调整成功"
}
```

### 4.6 设置相关API

#### 4.6.1 获取设置

```
GET /api/settings

响应：
{
  "success": true,
  "data": {
    "movies_dir": "/path/to/movies",
    "boxes_dir": "/path/to/boxes",
    " poster_size": "medium",
    "theme": "dark",
    "sidebar_width": 200
  }
}
```

#### 4.6.2 更新设置

```
PUT /api/settings

Body：
{
  "movies_dir": "/new/path/to/movies",
  "poster_size": "large",
  "theme": "light"
}

响应：
{
  "success": true,
  "message": "设置更新成功"
}
```

### 4.7 演员相关API

#### 4.7.1 获取演员列表

```
GET /api/actors

Query参数：
- search: 搜索关键词

响应：
{
  "success": true,
  "data": {
    "actors": [
      {
        "id": 1,
        "name": "演员名称",
        "movie_count": 10
      }
    ]
  }
}
```

### 4.8 用户管理API（管理员功能）

#### 4.8.1 获取用户列表

```
GET /api/admin/users

Headers：
Authorization: Bearer <token>（需要管理员权限）

Query参数：
- page: 页码
- limit: 每页数量
- search: 搜索关键词（用户名、邮箱）

响应：
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "user001",
        "nickname": "用户昵称",
        "email": "user@example.com",
        "role": "user",
        "is_active": true,
        "last_login_time": "2024-01-01",
        "create_time": "2024-01-01"
      }
    ],
    "total": 50
  }
}
```

#### 4.8.2 启用/禁用用户

```
PUT /api/admin/users/:id/status

Headers：
Authorization: Bearer <token>（需要管理员权限）

Body：
{
  "is_active": false
}

响应：
{
  "success": true,
  "message": "用户状态更新成功"
}
```

#### 4.8.3 修改用户角色

```
PUT /api/admin/users/:id/role

Headers：
Authorization: Bearer <token>（需要管理员权限）

Body：
{
  "role": "admin"
}

响应：
{
  "success": true,
  "message": "用户角色更新成功"
}
```

#### 4.8.4 重置用户密码（管理员）

```
PUT /api/admin/users/:id/password

Headers：
Authorization: Bearer <token>（需要管理员权限）

Body：
{
  "new_password": "new_password123"
}

响应：
{
  "success": true,
  "message": "密码重置成功"
}
```

#### 4.8.5 删除用户

```
DELETE /api/admin/users/:id

Headers：
Authorization: Bearer <token>（需要管理员权限）

响应：
{
  "success": true,
  "message": "用户删除成功"
}
```

### 4.9 统计数据API

#### 4.9.1 获取全局统计

```
GET /api/stats

Headers：
Authorization: Bearer <token>（可选）

响应：
{
  "success": true,
  "data": {
    "total_movies": 100,
    "total_users": 50,
    "total_views": 1000,
    "category_stats": [
      {"name": "动作", "count": 30},
      {"name": "喜剧", "count": 25}
    ],
    "popular_movies": [
      {"id": "movie-001", "title": "电影名", "view_count": 100}
    ],
    "recent_movies": [
      {"id": "movie-new", "title": "新电影", "create_time": "2024-01-01"}
    ]
  }
}
```

#### 4.9.2 获取用户个人统计

```
GET /api/stats/my

Headers：
Authorization: Bearer <token>

响应：
{
  "success": true,
  "data": {
    "total_views": 50,
    "favorite_count": 20,
    "rated_count": 35,
    "avg_rating": 4.2,
    "box_count": 5,
    "recent_views": [
      {"movie_id": "movie-001", "title": "电影名", "view_time": "2024-01-01"}
    ]
  }
}
```

---

## 5. 界面设计

### 5.1 首页设计

#### 5.1.1 页面布局

```
+------------------------------------------------------------------+
|  [工具栏]                                                          |
|  [排序] [分类筛选] [标签筛选] [年份筛选] [收藏筛选]                   |
|  [批量操作按钮] [搜索框] [海报尺寸切换] [刷新] [设置]                |
+------------------------------------------------------------------+
|  [统计栏]                                                          |
|  电影总数: 100 | 已看: 30 | 收藏: 20                               |
+------------------------------------------------------------------+
|        |                                                           |
| 侧边栏 |              电影海报墙（主区域）                            |
|        |                                                           |
| [分类] |   +--------+  +--------+  +--------+  +--------+          |
| 动作   |   | 海报   |  | 海报   |  | 海报   |  | 海报   |          |
| 喜剧   |   | ☐ 名称 |  | ☐ 名称 |  | ☐ 名称 |  | ☐ 名称 |          |
| 科幻   |   | 演员   |  | 演员   |  | 演员   |  | 演员   |          |
| ...    |   | 日期   |  | 日期   |  | 日期   |  | 日期   |          |
|        |   +--------+  +--------+  +--------+  +--------+          |
| [盒子] |                                                           |
| 我的   |   +--------+  +--------+  +--------+  +--------+          |
| 收藏   |   | 海报   |  | 海报   |  | 海报   |  | 海报   |          |
| 待看   |   | ☐ 名称 |  | ☐ 名称 |  | ☐ 名称 |  | ☐ 名称 |          |
|        |   | 演员   |  | 演员   |  | 演员   |  | 演员   |          |
|        |   | 日期   |  | 日期   |  | 日期   |  | 日期   |          |
|        |   +--------+  +--------+  +--------+  +--------+          |
+------------------------------------------------------------------+
```

#### 5.1.2 海报卡片设计

```
+-------------------+
| ☐ [复选框]         |
+-------------------+
|                   |
|   [电影海报]       |
|   图片区域         |
|                   |
+-------------------+
| 电影名称           |
| 演员1, 演员2       |
| 2024-01-01        |
| ⭐⭐⭐⭐ ❤         |
+-------------------+
```

海报尺寸规格：
- **小**：120px宽 × 160px高
- **中**：180px宽 × 240px高（默认）
- **大**：240px宽 × 320px高

#### 5.1.3 侧边栏设计

```
侧边栏宽度：200px（可调整：150px - 300px）

结构：
├── 分类列表
│   ├── 全部分类
│   ├── 动作
│   ├── 喜剧
│   ├── ...
│
├── 电影盒子
│   ├── [+创建盒子]
│   ├── 我的收藏
│   ├── 待看列表
│   ├── ...

样式：
- 激活项：左边框高亮（3px主色）
- hover：背景变色
- 分类图标：彩色标识
- 盒子图标：盒子图标
```

### 5.2 电影详情页设计

#### 5.2.1 页面布局

```
+------------------------------------------------------------------+
|  [电影名称]                                              [关闭]    |
+------------------------------------------------------------------+
|                                                                   |
|  +----------+  +-----------------------------------------+        |
|  |          |  | ID: movie-001                           |        |
|  |  海报    |  | 分类: 动作                               |        |
|  | 300x400  |  | 上映日期: 2024-01-01                     |        |
|  |          |  | 出品方: XX Studio                        |        |
|  |          |  | 导演: 导演名称                           |        |
|  |          |  | 演员: 演员1, 演员2, 演员3                |        |
|  |          |  | 标签: [经典] [获奖] [推荐]               |        |
|  |          |  | 评分: ⭐⭐⭐⭐⭐ (点击评分)                 |        |
|  |          |  | 收藏: [❤ 收藏]                           |        |
|  +----------+  +-----------------------------------------+        |
|                                                                   |
|  电影介绍:                                                         |
|  这是一部非常精彩的电影，讲述了一个动人的故事...                     |
|                                                                   |
|  视频信息:                                                         |
|  编码: H264 | 分辨率: 1920x1080 | 时长: 120分钟                    |
|                                                                   |
+------------------------------------------------------------------+
|  [启动播放]  [编辑]  [删除]  [添加到盒子]                         |
+------------------------------------------------------------------+
```

#### 5.2.2 编辑模式布局

点击"编辑"按钮后，右侧属性区域变为可编辑表单：

```
+-----------------------------------------+
| ID: movie-001 (不可编辑)                 |
| 分类: [下拉选择框]                        |
| 上映日期: [日期选择器]                    |
| 出品方: [文本输入框]                      |
| 导演: [文本输入框]                        |
| 演员: [多选标签]                          |
| 标签: [多选标签]                          |
| 电影介绍: [多行文本框]                    |
+-----------------------------------------+
| [保存]  [取消]                            |
+-----------------------------------------+
```

### 5.3 电影盒子页面设计

#### 5.3.1 页面布局

类似于首页，但只显示该盒子中的电影，顶部显示盒子信息：

```
+------------------------------------------------------------------+
|  [盒子名称] - 包含20部电影                 [编辑盒子]  [关闭]       |
+------------------------------------------------------------------+
|                                                                   |
|              电影海报墙                                            |
|   +--------+  +--------+  +--------+                              |
|   | 海报   |  | 海报   |  | 海报   |                              |
|   | 名称   |  | 名称   |  | 名称   |                              |
|   +--------+  +--------+  +--------+                              |
|                                                                   |
+------------------------------------------------------------------+
```

### 5.4 批量导入界面设计

#### 5.4.1 扫描设置弹窗

```
+------------------------------------------+
| 扫描电影目录                        [关闭] |
+------------------------------------------+
|                                          |
| 扫描目录: [/path/to/movies] [选择]        |
|                                          |
| 扫描结果预览:                              |
| +--------------------------------------+ |
| | Movie1  ✓ NFO ✓ Poster ✓ Video      | |
| | Movie2  ✓ NFO ✓ Poster ✗ 无视频      | |
| | Movie3  ✗ 无NFO                      | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| [开始导入]  [取消]                        |
+------------------------------------------+
```

#### 5.4.2 导入结果弹窗

```
+------------------------------------------+
| 导入结果                           [关闭]  |
+------------------------------------------+
|                                          |
| 成功导入: 8部电影                         |
| 导入失败: 2部电影                         |
|                                          |
| 错误列表:                                 |
| - Movie3: NFO文件格式错误                 |
| - Movie5: 缺少海报图片                    |
|                                          |
+------------------------------------------+
| [关闭]                                    |
+------------------------------------------+
```

### 5.5 主题设计

#### 5.5.1 深色主题（dark.css）

```css
:root {
  --bg-color: #1a1a1a;
  --sidebar-bg: #252525;
  --card-bg: #2d2d2d;
  --modal-bg: #2d2d2d;
  --input-bg: #3a3a3a;
  --hover-bg: #3a3a3a;
  --active-bg: #0078d4;
  
  --text-color: #ffffff;
  --text-secondary: #aaaaaa;
  
  --border-color: #404040;
  --primary-color: #0078d4;
  --primary-hover: #1060be;
  
  --shadow-color: rgba(0, 0, 0, 0.3);
  --danger-color: #f44336;
  --success-color: #4caf50;
}
```

#### 5.5.2 浅色主题（light.css）

```css
:root {
  --bg-color: #f5f5f5;
  --sidebar-bg: #ffffff;
  --card-bg: #ffffff;
  --modal-bg: #ffffff;
  --input-bg: #ffffff;
  --hover-bg: #e8e8e8;
  --active-bg: #e3f2fd;
  
  --text-color: #333333;
  --text-secondary: #666666;
  
  --border-color: #e0e0e0;
  --primary-color: #0078d4;
  --primary-hover: #1060be;
  
  --shadow-color: rgba(0, 0, 0, 0.1);
  --danger-color: #f44336;
  --success-color: #4caf50;
}
```

### 5.6 交互设计

#### 5.6.1 海报交互

- **hover效果**：海报向上浮动（translateY(-5px）），显示阴影
- **click效果**：打开详情页（模态框或新页面）
- **选中状态**：边框高亮，显示复选框
- **hover显示**：
  - 复选框（左上角）
  - 评分星级（点击评分）
  - 收藏按钮（右上角）
- **用户信息显示**：
  - 已登录用户显示自己的评分和收藏状态
  - 未登录用户显示平均评分

#### 5.6.2 搜索交互

- 实时搜索：输入关键词后立即搜索（300ms debounce）
- 搜索框内显示清除按钮（×）
- 搜索结果高亮匹配文字
- 无结果时显示友好提示

#### 5.6.3 批量操作交互

- 多选电影时，顶部显示批量操作按钮
- 批量删除：二次确认提示
- 批量收藏：立即更新状态
- 批量添加到盒子：弹出盒子选择器

#### 5.6.4 评分交互

- 点击星星进行评分
- hover时星星放大或高亮
- 已评分显示填充星星
- 未评分显示空心星星
- 只有登录用户才能评分

### 5.7 登录页面设计

```
+------------------------------------------+
|            [应用Logo]                     |
|         电影管理系统                       |
|                                          |
+------------------------------------------+
|                                          |
|  用户名: [________________]              |
|                                          |
|  密  码: [________________]              |
|                                          |
|  [✓] 记住我                              |
|                                          |
|  [        登  录        ]                |
|                                          |
|  ------------------------------------    |
|                                          |
|  没有账户？ [立即注册]                    |
|                                          |
+------------------------------------------+
```

**样式要点**：
- 居中布局
- 简洁的输入框设计
- 登录按钮使用主色调
- 注册链接使用次要色

### 5.8 注册页面设计

```
+------------------------------------------+
|            [应用Logo]                     |
|         注册新账户                         |
|                                          |
+------------------------------------------+
|                                          |
|  用户名: [________________]              |
|            (用于登录，不可修改)            |
|                                          |
|  昵  称: [________________]              |
|                                          |
|  邮  箱: [________________]              |
|            (选填，用于找回密码)            |
|                                          |
|  密  码: [________________]              |
|                                          |
|  确认密码: [________________]            |
|                                          |
|  [        注  册        ]                |
|                                          |
|  ------------------------------------    |
|                                          |
|  已有账户？ [立即登录]                    |
|                                          |
+------------------------------------------+
```

**样式要点**：
- 表单验证提示（用户名唯一性、密码强度）
- 实时验证反馈
- 与登录页面风格一致

### 5.9 个人中心页面设计

```
+------------------------------------------------------------------+
|  [顶部导航栏]                                                      |
|  [首页] [我的收藏] [我的盒子] | [个人中心] [退出登录]               |
+------------------------------------------------------------------+
|                                                                   |
|  +-------------------+  +-------------------------------------+  |
|  |   [用户头像]       |  | 基本信息                             |  |
|  |   [更换头像]       |  | 用户名: user001 (不可修改)           |  |
|  |                   |  | 昵  称: [用户昵称] [修改]            |  |
|  |                   |  | 邮  箱: user@example.com [修改]     |  |
|  |                   |  | 角  色: 普通用户                     |  |
|  +-------------------+  +-------------------------------------+  |
|                                                                   |
|  +-------------------------------------------------------------+ |
|  | 我的统计                                                      | |
|  | 观看: 50部  |  收藏: 20部  |  已评分: 35部  |  平均分: 4.2   | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  +-------------------------------------------------------------+ |
|  | 安全设置                                                      | |
|  | [修改密码]                                                    | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  +-------------------------------------------------------------+ |
|  | 最近观看                                                      | |
|  | [电影海报1] [电影海报2] [电影海报3] [电影海报4] ...           | |
|  +-------------------------------------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

**功能模块**：
- **个人信息展示与修改**：头像上传、昵称、邮箱修改
- **统计数据展示**：观看数、收藏数、评分数、平均分
- **安全设置**：密码修改
- **最近活动**：最近观看的电影列表

### 5.10 管理员后台页面设计

```
+------------------------------------------------------------------+
|  [顶部导航栏]                                                      |
|  [首页] [电影管理] [用户管理] [系统设置] | [个人中心] [退出登录]   |
+------------------------------------------------------------------+
|        |                                                           |
| 侧边栏 |              主内容区域                                    |
|        |                                                           |
| [仪表盘]                                                            |
| [用户] |   +--------------------------------------------------+   |
| [电影] |   | 用户管理                                          |   |
| [导入] |   | 搜索: [用户名/邮箱] [搜索]  [+添加用户]          |   |
| [设置] |   +--------------------------------------------------+   |
|        |   | ID | 用户名 | 邮箱 | 角色 | 状态 | 操作         |   |
|        |   | 1  | user1 | ...  | 用户 | 激活 | [禁用][编辑] |   |
|        |   | 2  | user2 | ...  | 用户 | 禁用 | [启用][编辑] |   |
|        |   | 3  | admin | ...  | 管理 | 激活 | [编辑]       |   |
|        |   +--------------------------------------------------+   |
|        |                                                           |
+------------------------------------------------------------------+
```

**管理员功能模块**：
- **仪表盘**：系统统计数据（用户数、电影数、今日活跃等）
- **用户管理**：用户列表、搜索、启用/禁用、修改角色、重置密码
- **电影管理**：电影列表、添加、编辑、删除、批量导入
- **系统设置**：系统配置、权限管理

### 5.11 未登录状态处理

**首页顶部栏设计（未登录）**：
```
+------------------------------------------------------------------+
|  [排序] [筛选] [搜索框] [海报尺寸]                 [登录] [注册]   |
+------------------------------------------------------------------+
```

**提示交互**：
- 未登录用户点击收藏、评分时，弹出提示："请先登录"
- 提供登录和注册链接
- 登录后自动返回原操作

### 5.12 登录状态顶部栏设计

**首页顶部栏设计（已登录）**：
```
+------------------------------------------------------------------+
|  [用户头像] 用户昵称 ▼ | [排序] [筛选] [搜索框] [海报尺寸] [设置]  |
|  ├─ 个人中心                                                       |
|  ├─ 我的收藏                                                       |
|  ├─ 我的盒子                                                       |
|  └─ 退出登录                                                       |
+------------------------------------------------------------------+
```

---

## 6. NFO文件解析设计

### 6.1 NFO文件格式示例

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<movie>
    <id>电影ID</id>
    <title>电影名称</title>
    <year>发行日期</year>
    <outline>电影介绍</outline>
    <sorttitle>短名称</sorttitle>
    <runtime>电影时长（分钟）</runtime>
    <studio>制作商</studio>
    <director>导演</director>
    <tag>标签1</tag>
    <tag>标签2</tag>
    <tag>标签3</tag>
    <tag>标签4</tag>
    <actor>
        <name>演员名称1</name>
        <name>演员名称2</name>
    </actor>
    <fileinfo>
        <streamdetails>
            <video>
                <codec>视频编码，如H264</codec>
                <width>视频宽</width>
                <height>视频高</height>
                <durationinseconds>视频时长（秒）</durationinseconds>
                <stereomode />
            </video>
        </streamdetails>
    </fileinfo>
    <original_filename>电影文件路径</original_filename>
</movie>
```

### 6.2 解析字段映射

| NFO字段 | 数据库字段 | 说明 |
|---------|----------|------|
| id | id | 电影ID |
| title | title | 电影名称 |
| year | release_date | 发行日期（需转换格式） |
| outline | description | 电影介绍 |
| runtime | runtime | 电影时长（分钟） |
| studio | studio | 出品方 |
| director | director | 导演 |
| tag（多个） | movie_tags表 | 标签（需创建或匹配） |
| actor/name（多个） | actors + movie_actors | 演员（需创建或匹配） |
| fileinfo/video/codec | video_codec | 视频编码 |
| fileinfo/video/width | video_width | 视频宽度 |
| fileinfo/video/height | video_height | 视频高度 |
| fileinfo/video/durationinseconds | video_duration | 视频时长（秒） |
| original_filename | video_path | 视频文件路径 |

### 6.3 NfoParserService实现伪代码

```javascript
class NfoParserService {
  /**
   * 解析NFO文件
   * @param {string} nfoPath - NFO文件路径
   * @returns {object} 解析后的电影数据
   */
  parseNfo(nfoPath) {
    const xmlContent = fs.readFileSync(nfoPath, 'utf-8');
    const movieData = this.parseXml(xmlContent);
    
    return {
      id: movieData.id?.[0] || this.generateId(movieData.title?.[0]),
      title: movieData.title?.[0] || '',
      release_date: this.parseYear(movieData.year?.[0]),
      description: movieData.outline?.[0] || '',
      runtime: parseInt(movieData.runtime?.[0]) || 0,
      studio: movieData.studio?.[0] || '',
      director: movieData.director?.[0] || '',
      tags: movieData.tag || [],
      actors: this.extractActors(movieData.actor),
      videoInfo: this.extractVideoInfo(movieData.fileinfo?.[0]?.streamdetails?.[0]?.video?.[0]),
      original_filename: movieData.original_filename?.[0] || ''
    };
  }
  
  /**
   * 解析XML
   */
  parseXml(xmlContent) {
    // 使用xml2js或其他XML解析库
    return parseXml(xmlContent);
  }
  
  /**
   * 提取演员列表
   */
  extractActors(actorNode) {
    if (!actorNode) return [];
    const names = actorNode.name || [];
    return names.map(name => ({ name }));
  }
  
  /**
   * 提取视频信息
   */
  extractVideoInfo(videoNode) {
    if (!videoNode) return null;
    return {
      codec: videoNode.codec?.[0] || '',
      width: parseInt(videoNode.width?.[0]) || 0,
      height: parseInt(videoNode.height?.[0]) || 0,
      duration: parseInt(videoNode.durationinseconds?.[0]) || 0
    };
  }
  
  /**
   * 解析年份
   */
  parseYear(yearStr) {
    if (!yearStr) return null;
    // 尝试解析为完整日期或年份
    // 例如: "2024", "2024-01-01"
    return yearStr.length === 4 ? `${yearStr}-01-01` : yearStr;
  }
  
  /**
   * 生成电影ID
   */
  generateId(title) {
    const normalized = title.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return `movie-${normalized}`;
  }
}
```

---

## 7. 配置文件设计

### 7.1 settings.json

```json
{
  "movies_dir": "./movies",
  "boxes_dir": "./boxes",
  "poster_size": "medium",
  "theme": "dark",
  "sidebar_width": 200,
  "language": "zh-CN",
  "auto_scan": false,
  "scan_interval": 3600
}
```

### 7.2 categories.json

```json
{
  "categories": [
    {
      "id": 1,
      "name": "动作",
      "description": "动作电影",
      "color": "#FF5722",
      "order": 1
    },
    {
      "id": 2,
      "name": "喜剧",
      "description": "喜剧电影",
      "color": "#FFC107",
      "order": 2
    }
  ]
}
```

### 7.3 tags.json

```json
{
  "tags": [
    {
      "id": 1,
      "name": "经典",
      "color": "#FFD700"
    },
    {
      "id": 2,
      "name": "获奖",
      "color": "#C0C0C0"
    }
  ]
}
```

### 7.4 cache.json（缓存配置）

```json
{
  "enabled": true,
  "default_ttl": 3600,
  "check_period": 600,
  "cache_types": {
    "movies": {
      "enabled": true,
      "ttl": 1800,
      "description": "电影库数据缓存"
    },
    "boxes": {
      "enabled": true,
      "ttl": 1800,
      "description": "电影盒子数据缓存"
    },
    "tags": {
      "enabled": true,
      "ttl": 7200,
      "description": "标签数据缓存"
    },
    "actors": {
      "enabled": true,
      "ttl": 7200,
      "description": "演员数据缓存"
    },
    "categories": {
      "enabled": true,
      "ttl": 86400,
      "description": "分类数据缓存"
    },
    "user_movie_data": {
      "enabled": true,
      "ttl": 300,
      "description": "用户电影数据缓存(评分、收藏等)"
    },
    "stats": {
      "enabled": true,
      "ttl": 600,
      "description": "统计数据缓存"
    }
  }
}
```

**配置说明**：
- `enabled`: 是否启用缓存（全局开关）
- `default_ttl`: 默认缓存有效期（秒）
- `check_period`: 缓存检查周期（秒），自动清理过期缓存
- `cache_types`: 各类型数据的具体缓存配置
  - `movies`: 电影列表、详情数据（30分钟）
  - `boxes`: 电影盒子数据（30分钟）
  - `tags`: 标签数据（2小时）
  - `actors`: 演员数据（2小时）
  - `categories`: 分类数据（24小时，不常变化）
  - `user_movie_data`: 用户个性化数据（5分钟，较频繁变化）
  - `stats`: 统计数据（10分钟）

---

## 7.5 缓存服务详细设计

### 7.5.1 CacheService 实现伪代码

```javascript
/**
 * 缓存服务
 * 负责电影、盒子、标签、演员等数据的缓存管理
 */
class CacheService {
  constructor(config = {}) {
    this.cache = new Map();           // 缓存存储
    this.config = config;             // 缓存配置
    this.timers = new Map();          // 过期定时器
    this.stats = {
      hits: 0,                        // 缓存命中次数
      misses: 0,                      // 缓存未命中次数
      sets: 0,                        // 缓存设置次数
      deletes: 0                      // 缓存删除次数
    };
    
    // 启动定期清理任务
    if (config.check_period) {
      this.startCleanupTask(config.check_period);
    }
  }

  /**
   * 生成缓存键
   * @param {string} type - 数据类型 (movies, boxes, tags, actors等)
   * @param {string} key - 数据键（可选，用于细分数据）
   * @returns {string} 缓存键
   */
  generateKey(type, key = 'default') {
    return `${type}:${key}`;
  }

  /**
   * 获取缓存
   * @param {string} type - 数据类型
   * @param {string} key - 数据键
   * @returns {any} 缓存数据或null
   */
  get(type, key = 'default') {
    const cacheKey = this.generateKey(type, key);
    const item = this.cache.get(cacheKey);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // 检查是否过期
    if (item.expireTime && Date.now() > item.expireTime) {
      this.delete(type, key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return item.data;
  }

  /**
   * 设置缓存
   * @param {string} type - 数据类型
   * @param {string} key - 数据键
   * @param {any} data - 缓存数据
   * @param {number} ttl - 有效期（秒），覆盖默认值
   */
  set(type, key = 'default', data, ttl = null) {
    const cacheKey = this.generateKey(type, key);
    const typeConfig = this.config.cache_types?.[type] || {};
    
    // 检查该类型是否启用缓存
    if (!typeConfig.enabled) {
      return;
    }
    
    const effectiveTtl = ttl ?? typeConfig.ttl ?? this.config.default_ttl ?? 3600;
    const expireTime = Date.now() + (effectiveTtl * 1000);
    
    // 清除旧的定时器
    if (this.timers.has(cacheKey)) {
      clearTimeout(this.timers.get(cacheKey));
    }
    
    // 设置缓存
    this.cache.set(cacheKey, {
      data,
      expireTime,
      createTime: Date.now(),
      ttl: effectiveTtl
    });
    
    // 设置过期定时器
    const timer = setTimeout(() => {
      this.delete(type, key);
    }, effectiveTtl * 1000);
    this.timers.set(cacheKey, timer);
    
    this.stats.sets++;
  }

  /**
   * 删除缓存
   * @param {string} type - 数据类型
   * @param {string} key - 数据键
   */
  delete(type, key = 'default') {
    const cacheKey = this.generateKey(type, key);
    
    if (this.cache.has(cacheKey)) {
      this.cache.delete(cacheKey);
      this.stats.deletes++;
    }
    
    // 清除定时器
    if (this.timers.has(cacheKey)) {
      clearTimeout(this.timers.get(cacheKey));
      this.timers.delete(cacheKey);
    }
  }

  /**
   * 删除某类型的所有缓存
   * @param {string} type - 数据类型
   */
  deleteByType(type) {
    for (const [key] of this.cache) {
      if (key.startsWith(`${type}:`)) {
        const parts = key.split(':');
        this.delete(type, parts[1] || 'default');
      }
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    // 清除所有定时器
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
    
    // 重置统计
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  /**
   * 获取或设置缓存（如果不存在则执行回调加载数据）
   * @param {string} type - 数据类型
   * @param {string} key - 数据键
   * @param {Function} loader - 数据加载回调函数（返回Promise）
   * @param {number} ttl - 有效期
   * @returns {Promise<any>} 缓存数据或新加载的数据
   */
  async getOrSet(type, key = 'default', loader, ttl = null) {
    // 先尝试从缓存获取
    const cachedData = this.get(type, key);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // 缓存不存在，执行加载函数
    const data = await loader();
    
    // 设置缓存
    this.set(type, key, data, ttl);
    
    return data;
  }

  /**
   * 检查缓存是否存在且有效
   * @param {string} type - 数据类型
   * @param {string} key - 数据键
   * @returns {boolean} 是否存在有效缓存
   */
  has(type, key = 'default') {
    const item = this.get(type, key);
    return item !== null;
  }

  /**
   * 获取缓存统计信息
   * @returns {object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      size: this.cache.size
    };
  }

  /**
   * 启动定期清理任务
   * @param {number} period - 清理周期（秒）
   */
  startCleanupTask(period) {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache) {
        if (item.expireTime && now > item.expireTime) {
          const [type, cacheKey] = key.split(':');
          this.delete(type, cacheKey);
        }
      }
    }, period * 1000);
  }

  /**
   * 停止定期清理任务
   */
  stopCleanupTask() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

module.exports = CacheService;
```

### 7.5.2 缓存使用示例

#### 电影服务中使用缓存

```javascript
const CacheService = require('./CacheService');

class MovieService {
  constructor(db, cacheService) {
    this.db = db;
    this.cache = cacheService;
  }

  /**
   * 获取电影列表（带缓存）
   */
  async getMovies(options = {}) {
    const cacheKey = this.generateCacheKey(options);
    
    return await this.cache.getOrSet('movies', cacheKey, async () => {
      // 从数据库加载数据
      return this.db.queryMovies(options);
    });
  }

  /**
   * 获取电影详情（带缓存）
   */
  async getMovieById(id) {
    return await this.cache.getOrSet('movies', `detail:${id}`, async () => {
      return this.db.queryMovieById(id);
    });
  }

  /**
   * 添加电影（同时更新缓存）
   */
  async addMovie(movieData) {
    const result = await this.db.insertMovie(movieData);
    
    // 删除电影列表缓存
    this.cache.deleteByType('movies');
    
    // 设置新电影的缓存
    this.cache.set('movies', `detail:${result.id}`, result);
    
    return result;
  }

  /**
   * 更新电影（同时更新缓存）
   */
  async updateMovie(id, movieData) {
    const result = await this.db.updateMovie(id, movieData);
    
    // 更新电影详情缓存
    this.cache.set('movies', `detail:${id}`, result);
    
    // 删除电影列表缓存（因为可能有排序变化）
    this.cache.delete('movies', 'list');
    
    return result;
  }

  /**
   * 删除电影（同时清除缓存）
   */
  async deleteMovie(id) {
    await this.db.deleteMovie(id);
    
    // 删除电影详情缓存
    this.cache.delete('movies', `detail:${id}`);
    
    // 删除电影列表缓存
    this.cache.deleteByType('movies');
  }

  /**
   * 生成缓存键（根据查询选项）
   */
  generateCacheKey(options) {
    const { page, limit, sort, order, category_id, year, search } = options;
    return `list:${page || 1}:${limit || 50}:${sort || 'default'}:${order || 'asc'}:${category_id || 'all'}:${year || 'all'}:${search || 'none'}`;
  }
}
```

#### 电影盒子服务中使用缓存

```javascript
class BoxService {
  constructor(db, cacheService) {
    this.db = db;
    this.cache = cacheService;
  }

  /**
   * 获取用户的盒子列表（带缓存）
   */
  async getUserBoxes(userId) {
    return await this.cache.getOrSet('boxes', `user:${userId}`, async () => {
      return this.db.queryUserBoxes(userId);
    });
  }

  /**
   * 获取盒子详情（带缓存）
   */
  async getBoxDetail(boxId) {
    return await this.cache.getOrSet('boxes', `detail:${boxId}`, async () => {
      return this.db.queryBoxDetail(boxId);
    });
  }

  /**
   * 创建盒子（同时更新缓存）
   */
  async createBox(userId, boxData) {
    const result = await this.db.insertBox(userId, boxData);
    
    // 删除用户的盒子列表缓存
    this.cache.delete('boxes', `user:${userId}`);
    
    // 设置新盒子的缓存
    this.cache.set('boxes', `detail:${result.id}`, result);
    
    return result;
  }

  /**
   * 添加电影到盒子（同时更新缓存）
   */
  async addMovieToBox(boxId, movieId) {
    const result = await this.db.addMovieToBox(boxId, movieId);
    
    // 更新盒子详情缓存
    const boxDetail = await this.db.queryBoxDetail(boxId);
    this.cache.set('boxes', `detail:${boxId}`, boxDetail);
    
    return result;
  }
}
```

### 7.5.3 缓存策略说明

#### 读策略（Read-Through）

1. **请求到达** → 检查缓存是否存在且有效
2. **缓存命中** → 直接返回缓存数据
3. **缓存未命中** → 从数据库加载数据 → 设置缓存 → 返回数据

#### 写策略（Write-Through）

1. **数据写入**数据库
2. **同步更新**缓存（或删除相关缓存键）
3. 返回写入结果

#### 缓存失效策略

1. **TTL过期**：每个缓存项设置过期时间，到期自动删除
2. **主动失效**：数据更新时主动删除或更新相关缓存
3. **定期清理**：后台定时任务清理已过期的缓存项

### 7.5.4 缓存键命名规范

| 数据类型 | 缓存键格式 | 示例 |
|----------|-----------|------|
| 电影列表 | `movies:list:{page}:{limit}:{filters}` | `movies:list:1:50:all:2024` |
| 电影详情 | `movies:detail:{movieId}` | `movies:detail:movie-001` |
| 用户盒子列表 | `boxes:user:{userId}` | `boxes:user:1` |
| 盒子详情 | `boxes:detail:{boxId}` | `boxes:detail:5` |
| 所有标签 | `tags:all` | `tags:all` |
| 演员列表 | `actors:list:{search}` | `actors:list:张三` |
| 分类列表 | `categories:all` | `categories:all` |
| 用户电影数据 | `user_movie_data:{userId}:{movieId}` | `user_movie_data:1:movie-001` |

### 7.5.5 缓存管理API

```
GET /api/admin/cache/stats

Headers：
Authorization: Bearer <token>（需要管理员权限）

响应：
{
  "success": true,
  "data": {
    "enabled": true,
    "size": 156,
    "stats": {
      "hits": 1523,
      "misses": 234,
      "sets": 390,
      "deletes": 45,
      "hitRate": 0.867
    },
    "memory_usage": "12.5 MB"
  }
}
```

```
DELETE /api/admin/cache

Headers：
Authorization: Bearer <token>（需要管理员权限）

Query参数：
- type: 缓存类型（movies, boxes, tags, actors, categories, all）

响应：
{
  "success": true,
  "message": "缓存已清空",
  "data": {
    "cleared_type": "all",
    "cleared_count": 156
  }
}
```

---

## 8. 开发实现建议

### 8.1 开发顺序

1. **数据库初始化**：创建SQLite数据库和表结构
2. **基础服务层**：实现DatabaseService、FileService
3. **核心业务服务**：MovieService、CategoryService、TagService
4. **API路由**：实现RESTful API
5. **前端页面**：HTML结构、CSS样式、JavaScript交互
6. **高级功能**：评分、收藏、盒子、批量导入

### 8.2 技术选型建议

- **Express.js**: 4.18+
- **SQLite**: better-sqlite3（性能更好）或sqlite3
- **XML解析**: xml2js
- **文件上传**: multer
- **前端交互**: 纯JavaScript或jQuery（轻量级）
- **CSS框架**: 自定义CSS（参考game-mgt样式）

### 8.3 与game-mgt的差异

| 特性 | game-mgt | movie-mgt |
|-----|----------|-----------|
| 框架 | Electron | Express.js |
| 数据库 | JSON文件 | SQLite |
| 文件结构 | 平台文件夹结构 | 电影文件夹结构 |
| 元数据文件 | game.json | movie.nfo (XML) |
| 图片 | poster/cover | poster.jpg |
| 状态管理 | 平台状态 | 电影分类 |

---

## 9. 扩展功能建议

### 9.1 未来可扩展功能

- **视频播放集成**：集成视频播放器（如plyr.js）
- **豆瓣API集成**：自动获取电影信息
- **电影推荐**：基于评分和标签的推荐算法
- **导出功能**：导出电影列表为CSV/Excel
- **统计图表**：评分分布、分类统计图表
- **快捷键支持**：Ctrl+F搜索、Ctrl+N添加等
- **多语言支持**：国际化（i18n）

### 9.2 性能优化建议

- 电影列表分页加载
- 海报图片懒加载
- 搜索结果缓存
- SQLite查询优化（索引）
- 静态资源CDN加速

---

## 10. 项目初始化命令

```bash
# 创建项目
mkdir movie-mgt
cd movie-mgt

# 初始化Node.js项目
npm init -y

# 安装依赖
npm install express better-sqlite3 multer xml2js

# 安装开发依赖
npm install --save-dev nodemon

# 创建目录结构
mkdir -p config database public/{css/themes,js,images} routes services models middleware utils movies boxes

# 启动开发模式
npm run dev
```

---

## 附录

### A. package.json配置

```json
{
  "name": "movie-mgt",
  "version": "1.0.0",
  "description": "电影管理软件",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "init-db": "node database/init.js"
  },
  "keywords": ["movie", "manager", "express", "sqlite"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "multer": "^1.4.5-lts.1",
    "xml2js": "^0.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### B. Express.js应用入口伪代码

```javascript
const express = require('express');
const path = require('path');
 const DatabaseService = require('./services/DatabaseService');

const app = express();
const db = new DatabaseService(path.join(__dirname, 'database', 'database.db'));

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/api/movies', require('./routes/movies')(db));
app.use('/api/categories', require('./routes/categories')(db));
app.use('/api/tags', require('./routes/tags')(db));
app.use('/api/boxes', require('./routes/boxes')(db));
app.use('/api/settings', require('./routes/settings'));

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 详情页
app.get('/detail/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

// 盒子页
app.get('/box/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'box.html'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Movie management app running on http://localhost:${PORT}`);
});
```

---