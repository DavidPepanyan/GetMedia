const URL_REGEX = /https?:\/\/[^\s<>"']+/i;

function extractUrl(text) {
  const match = text.trim().match(URL_REGEX);
  if (!match) return null;

  return match[0].replace(/[.,!?;:)\]]+$/, '');
}

function isValidUrl(text) {
  const url = extractUrl(text);
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = { extractUrl, isValidUrl };
