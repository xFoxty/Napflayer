# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this repository.

## Project Overview

This is a Node.js QQ bot that manages Minecraft server connections using the mineflayer library. The bot:
- Connects to QQ WebSocket for message handling
- Manages multiple Minecraft bot instances per QQ user
- Provides command-based configuration and control
- Uses lowdb for JSON-based data persistence

## Development Commands

### Running the Application
```bash
npm run dev          # Start with nodemon for development
node src/index.js    # Start production server
```

### Testing
No test framework is currently configured. When adding tests:
- Use Jest or Mocha for unit/integration testing
- Place test files in `tests/` directory
- Add test scripts to package.json

### Linting/Formatting
No linting tools are configured. Recommended setup:
```bash
npm install --save-dev eslint prettier
npx eslint --init    # Configure ESLint
```

## Code Style Guidelines

### File Structure
- `src/index.js` - Main entry point and WebSocket setup
- `src/manager.js` - Minecraft bot instance management
- `src/commands.js` - Command parsing and handling
- `src/store.js` - Data persistence and user configuration
- `src/db.js` - Database initialization and connection
- `db/config.json` - Lowdb data file (auto-generated)

### Import Conventions
- Use CommonJS `require()` syntax (project uses `"type": "commonjs"`)
- Group imports: built-in modules → third-party → local modules
- Use destructuring for multiple imports from same module:
  ```javascript
  const { init, config, clear } = require("./store.js");
  ```

### Naming Conventions
- **Variables**: camelCase (`qqNumber`, `msgFn`)
- **Functions**: camelCase (`createBot`, `handle`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_CONFIG`, `helpMessage`)
- **Files**: camelCase with .js extension (`commands.js`, `manager.js`)
- **Classes**: PascalCase (if added later)

### Error Handling
- Use try-catch blocks for async operations
- Return consistent error objects: `{ success: false, message: "error description" }`
- Log errors with `console.error()` for debugging
- Handle WebSocket connection states gracefully

### Function Patterns
- Export functions using `module.exports = { fn1, fn2 }`
- Use async/await for asynchronous operations
- Provide JSDoc comments for complex functions:
  ```javascript
  /**
   * Creates a Minecraft bot instance
   * @param {Object} config - Bot configuration
   * @param {Function} msgFn - Message callback function
   * @returns {Promise<Object>} Bot instance
   */
  async function createBot(config, msgFn) { ... }
  ```

### Data Management
- Use lowdb with JSON file storage
- Initialize data structure: `{ users: [] }`
- Always check user existence before operations
- Use `await db.write()` after data modifications

### WebSocket Communication
- Check `ws.readyState === 1` before sending
- Use JSON.stringify for message formatting
- Implement message buffering for rate limiting
- Handle connection errors and close events

### Command System
- Commands start with `#` for configuration, `~` for chat
- Use switch statements for command routing
- Validate command parameters (e.g., port numbers)
- Provide help text for unknown commands

### Environment Variables
- Use `.env` file for configuration
- Required: `WS_URL` (QQ WebSocket URL)
- Load with `require('dotenv').config()` at entry point

## Dependencies

### Core Libraries
- `mineflayer` - Minecraft bot framework
- `ws` - WebSocket client
- `lowdb` - JSON database
- `dotenv` - Environment variable management

### Development Dependencies
- `nodemon` - Development file watching
- `@types/node` - Node.js type definitions
- `@types/lowdb` - Lowdb type definitions

## Adding New Features

1. **New Commands**: Add to `commands.js` switch statement and help text
2. **Bot Events**: Add listeners in `manager.js` createBot function
3. **Data Fields**: Update store.js functions and db initialization
4. **WebSocket Events**: Add handlers in `index.js` ws.on blocks

## Security Notes

- Never commit `.env` files or sensitive data
- Validate all user inputs before processing
- Use Microsoft auth for Minecraft accounts
- Implement proper error boundaries to prevent crashes

## Debugging

- Use `console.log()` for debugging (project has no logging library)
- Check WebSocket connection status in logs
- Verify database file creation in `db/` directory
- Test with actual QQ WebSocket server for integration