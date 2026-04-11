# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron-based movie management application (电影管理程序) with both a GUI and CLI interface. Movies are organized by categories and stored as NFO files with cover images.

## Common Commands

```bash
# GUI
npm start              # Start Electron app
npm run dev            # Start with logging enabled

# CLI (movie-mgt command)
movie-mgt movie list   # List movies
movie-mgt movie search <keyword>  # Search movies
movie-mgt box list     # List movie boxes
movie-mgt category list # List categories
movie-mgt tag list     # List tags
movie-mgt stats        # Show library statistics

# Build
npm run build:gui      # Build Electron app (output: dist/)
npm run build:cli      # Build CLI executable (pkg)
npm run build:cli:all  # Build CLI for all platforms

# Testing
npm test               # Run service unit tests (test/svc/)
npm run test:cli       # Run CLI unit tests
```

## Architecture

### Service Layer Architecture

The application uses a **shared service layer** (`src/main/services/`) that both the GUI (main.js) and CLI (src/cli/) consume:

- **MovieService** - Core movie CRUD operations, reads NFO files
- **BoxService** - Movie box (curated collections) management
- **CategoryService** - Category definitions and metadata
- **TagService** - Tag management (stored in config/tags.json)
- **IndexService** - Manages `index.json` files per category for fast movie listing
- **FileService** - File system operations (NFO parsing, folder scanning)
- **MovieCacheService** - Caching layer for movie data
- **SettingsService** - App settings (config/settings.json)
- **DatabaseService** - SQLite database for the GUI

### CLI Structure (`src/cli/`)

The CLI uses Commander.js with subcommands:
- `movie` (alias `m`) - Movie operations (list, search, show, add, edit, delete, status)
- `box` (alias `b`) - Box operations (list, show, create, edit, delete, add, remove)
- `category` (alias `c`) - Category operations (list, show)
- `tag` (alias `t`) - Tag operations (list, create, delete)
- `config` - Configuration management (show, set, get, reset)
- `stats` - Library statistics

The CLI's `service-loader.js` initializes services with paths resolved at runtime (supporting both direct node execution and pkg-compiled executables).

### GUI Structure (`src/renderer/`)

- HTML files load corresponding JS modules in `src/renderer/js/`
- Multiple windows: main window, detail window, box window, tag management, category management
- IPC communication via `preload.js` and handlers in `src/main/ipc-handlers.js`

### Data Storage

- **Movies**: Stored in `movies/<category>/<movie-folder>/movie.nfo` (NFO format)
- **Categories**: Defined in `config/categories.json`
- **Tags**: Defined in `config/tags.json`
- **Settings**: Stored in `config/settings.json`
- **Boxes**: Defined in `boxes/` directory as JSON files
- **Indexes**: Each category has `index.json` for fast movie listing

### Test Organization

- `test/svc/` - Service unit tests (run with `npm test` / `jest`)
- `test/cli/` - CLI unit tests (run with `npm run test:cli`, has own jest.config.js)
- `test/testcase-*.md` - Test case documentation

## Key Patterns

### Service Instantiation

Services are instantiated with dependencies passed via setters or constructors:
```javascript
const movieService = new MovieService(categoryService);
movieService.setCacheService(movieCacheService);
```

### IPC Handler Registration

IPC handlers are set up in `src/main/ipc-handlers.js` and receive all service instances via a config object.

### CLI Service Loader

`src/cli/utils/service-loader.js` handles path resolution for both development (`node`) and packaged (`pkg`) execution modes by detecting `process.execPath`.
