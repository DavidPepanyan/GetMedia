const MESSAGES = require('../messages');
const { extractUrl, isValidUrl } = require('../utils/urlParser');
const { DownloadError, downloadVideo, cleanupFile } = require('../services/downloader');

function getErrorMessage(err) {
  if (err instanceof DownloadError) {
    if (err.code === 'INSTAGRAM_PRIVATE') return MESSAGES.INSTAGRAM_PRIVATE;
    if (err.code === 'FILE_TOO_LARGE') return MESSAGES.FILE_TOO_LARGE;
    if (err.code === 'DOWNLOAD_FAILED') return MESSAGES.DOWNLOAD_FAILED;
  }

  return MESSAGES.GENERIC_ERROR;
}

async function handleTextMessage(ctx) {
  const text = ctx.message.text;

  if (text.startsWith('/')) return;

  if (!isValidUrl(text)) {
    await ctx.reply(MESSAGES.INVALID_LINK);
    return;
  }

  const url = extractUrl(text);
  const processingMsg = await ctx.reply(MESSAGES.PROCESSING);
  let filePath;

  try {
    await ctx.sendChatAction('upload_video');
    filePath = await downloadVideo(url);
    await ctx.replyWithVideo({ source: filePath, caption: MESSAGES.SUCCESS });
    await ctx.reply(MESSAGES.SUCCESS_FOLLOWUP);
  } catch (err) {
    console.error('Download error:', err.message);
    await ctx.reply(getErrorMessage(err));
  } finally {
    await cleanupFile(filePath);

    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
    } catch {
      // message may already be gone
    }
  }
}

module.exports = { handleTextMessage };
