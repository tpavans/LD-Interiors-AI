/**
 * Media Utilities for Ultra-Fast Video & Image Playback across LD Interiors
 * Optimized for Mobile HD streaming, Instagram reels snapping, and Cloudinary CDN bandwidth savings.
 */

export function isYouTubeUrl(url) {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
}

export function extractYouTubeId(url) {
  if (!url) return '';
  try {
    if (url.includes('/shorts/')) {
      const parts = url.split('/shorts/');
      if (parts[1]) return parts[1].split(/[?#&]/)[0];
    }
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) return parts[1].split(/[?#&]/)[0];
    }
    if (url.includes('v=')) {
      const parts = url.split('v=');
      if (parts[1]) return parts[1].split(/[?#&]/)[0];
    }
    if (url.includes('embed/')) {
      const parts = url.split('embed/');
      if (parts[1]) return parts[1].split(/[?#&]/)[0];
    }
    // Bare 11-character video ID fallback
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }
  } catch (e) {
    return '';
  }
  return '';
}

export function getYouTubeEmbedUrl(url, autoplay = true, muted = true) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return '';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.ldinteriors.in';

  // Ultra-fast lightweight embed params (no annotations, no external related videos, jsapi enabled)
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}&widget_referrer=${encodeURIComponent(origin)}&iv_load_policy=3&disablekb=1&fs=0`;
}

export function isInstagramUrl(url) {
  if (!url) return false;
  return url.includes('instagram.com/reel/') || url.includes('instagram.com/p/');
}

export function getInstagramEmbedUrl(url) {
  if (!url) return '';
  const cleanUrl = url.split('?')[0].replace(/\/+$/, '');
  return `${cleanUrl}/embed/`;
}

/**
 * Optimizes Cloudinary MP4 video URLs on-the-fly:
 * Reduces 40-50MB raw videos down to ~500KB with crystal clear mobile HD quality
 */
export function getOptimizedVideoUrl(url) {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/video/upload/')) {
    if (!url.includes('/q_auto')) {
      return url.replace('/video/upload/', '/video/upload/q_auto:eco,f_auto,w_720,c_limit/');
    }
  }
  return url;
}

/**
 * Optimizes Cloudinary Image URLs for rapid thumbnail and poster loading
 */
export function getOptimizedImageUrl(url, width = 600) {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    if (!url.includes('/q_auto')) {
      return url.replace('/image/upload/', `/image/upload/q_auto,f_auto,w_${width},c_limit/`);
    }
  }
  return url;
}

/**
 * Derives a reliable, instant thumbnail for any reel (YouTube, Cloudinary, or uploaded image)
 */
export function getReelThumbnail(videoUrl, customImage) {
  if (customImage && !customImage.includes('images.unsplash.com')) {
    return getOptimizedImageUrl(customImage, 600);
  }
  const ytId = extractYouTubeId(videoUrl);
  if (ytId) {
    return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
  }
  return customImage || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80';
}
