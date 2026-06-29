const path = require('path');
const crypto = require('crypto');
const fs = require('fs/promises');
const youtubedl = require('youtube-dl-exec');

const DOWNLOADS_DIR = path.join(__dirname, '..', '..', 'downloads');
const TELEGRAM_MAX_BYTES = 50 * 1024 * 1024;

const YTDLP_FORMAT =
  'best[filesize<=50M][ext=mp4]/best[filesize<=50M]/best[height<=720][ext=mp4]/best[height<=720]';

class DownloadError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

async function ensureDownloadsDir() {
  await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
}

function assertFileSize(bytes) {
  if (bytes > TELEGRAM_MAX_BYTES) {
    throw new DownloadError('FILE_TOO_LARGE', 'File exceeds Telegram upload limit');
  }
}

async function findDownloadedFile(prefix) {
  const files = await fs.readdir(DOWNLOADS_DIR);
  const match = files.find((file) => file.startsWith(prefix));

  if (!match) {
    throw new DownloadError('DOWNLOAD_FAILED', 'Downloaded file not found');
  }

  return path.join(DOWNLOADS_DIR, match);
}

/**
 * @param {string} url
 * @returns {Promise<string>} Path to downloaded file
 */
async function downloadVideo(url) {
  await ensureDownloadsDir();

  const fileId = crypto.randomUUID();
  const outputTemplate = path.join(DOWNLOADS_DIR, `${fileId}.%(ext)s`);

  try {
    await youtubedl(url, {
      output: outputTemplate,
      format: YTDLP_FORMAT,
      noPlaylist: true,
      mergeOutputFormat: 'mp4',
      restrictFilenames: true,
      noWarnings: true,
      noOverwrites: true,
    });
  } catch (err) {
    console.error('yt-dlp error:', err.stderr || err.message);
    throw new DownloadError('DOWNLOAD_FAILED', err.message);
  }

  const filePath = await findDownloadedFile(fileId);
  const { size } = await fs.stat(filePath);
  assertFileSize(size);

  return filePath;
}

async function cleanupFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch {
    // already removed or never created
  }
}

module.exports = {
  DownloadError,
  downloadVideo,
  cleanupFile,
  assertFileSize,
  TELEGRAM_MAX_BYTES,
};
