// Test setup file
const path = require('path');
const fs = require('fs');

// Create test data directories before all tests
beforeAll(() => {
  const testDataDir = path.join(__dirname, 'test-data');

  // Create necessary directories
  const dirs = [
    testDataDir,
    path.join(testDataDir, 'boxes'),
    path.join(testDataDir, 'movies'),
    path.join(testDataDir, 'config'),
    path.join(testDataDir, 'movies', 'movie'),
    path.join(testDataDir, 'movies', 'tv'),
    path.join(testDataDir, 'movies', 'documentary'),
    path.join(testDataDir, 'movies', 'anime'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
});

// Clean up after all tests
afterAll(() => {
  const testDataDir = path.join(__dirname, 'test-data');

  function deleteDir(dirPath) {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach(file => {
        const curPath = path.join(dirPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteDir(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(dirPath);
    }
  }

  deleteDir(testDataDir);
});
