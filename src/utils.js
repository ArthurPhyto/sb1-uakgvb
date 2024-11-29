export function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}