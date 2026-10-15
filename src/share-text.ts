const VIDEO_ID_PATTERN = /^[\w-]{11}$/;

export function createShareText(title: string, pageUrl: string): string | null {
  const url = new URL(pageUrl);
  const videoId = url.searchParams.get('v');
  if (url.hostname !== 'www.youtube.com' || url.pathname !== '/watch' || !videoId || !VIDEO_ID_PATTERN.test(videoId)) {
    return null;
  }

  const videoUrl = `https://youtu.be/${videoId}`;
  const suffix = ` ${videoUrl} @YouTubeより`;
  const availableTitleLength = 128 - [...suffix].length;
  const trimmedTitle = title.trim();
  const characters = [...trimmedTitle];
  const shortenedTitle = characters.length > availableTitleLength
    ? `${characters.slice(0, availableTitleLength - 3).join('')}...`
    : trimmedTitle;

  return `${shortenedTitle}${suffix}`.trim();
}
