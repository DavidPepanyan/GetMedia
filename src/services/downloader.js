const fs = require('fs/promises');

class DownloadError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const TELEGRAM_MAX_BYTES = 50 * 1024 * 1024;

/**
 * Download video from URL. yt-dlp integration goes here next.
 * @returns {Promise<string>} Path to downloaded file
 */
async function downloadVideo(url) {
  void url;
  throw new DownloadError('DOWNLOAD_FAILED', 'Download engine not connected yet');
}

async function cleanupFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch {
    // already removed or never created
  }
}

function assertFileSize(bytes) {
  if (bytes > TELEGRAM_MAX_BYTES) {
    throw new DownloadError('FILE_TOO_LARGE', 'File exceeds Telegram upload limit');
  }
}

module.exports = {
  DownloadError,
  downloadVideo,
  cleanupFile,
  assertFileSize,
  TELEGRAM_MAX_BYTES,
};
