# Creator Video System - Frontend Implementation

**Status:** ✅ **MVP Complete** (Frontend-only, no backend required)

## Overview

The creator video system allows creators to:
1. Connect their YouTube channel
2. Display videos on their ONE Platform profile
3. Sync videos from YouTube dynamically
4. Manage video content via dashboard

**Implementation:** Frontend-first approach using YouTube Data API v3 (client-side).

---

## Features Implemented

### ✅ 1. YouTube API Service (`/services/YouTubeService.ts`)
- Fetch videos from any YouTube channel
- Get channel information (subscribers, video count)
- Parse video metadata (duration, views, likes)
- Support for pagination (50 videos per request)
- Error handling and TypeScript types

### ✅ 2. Creator Video Dashboard (`/dashboard/creator/videos`)
- Connect YouTube channel by channel ID
- Display channel stats (subscribers, videos, views)
- Sync videos from YouTube with one click
- Video grid with sorting (date, views, title)
- localStorage for storing channel connection

### ✅ 3. Public Creator Video Hub (`/creators/[slug]/videos`)
- Public-facing creator profile with videos
- Creator branding (avatar, name, verified badge)
- Video gallery with YouTube integration
- Responsive design
- SEO optimized

---

## Setup Instructions

### 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **YouTube Data API v3**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create API credentials:
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key
5. (Optional) Restrict API key:
   - Click on the API key to edit
   - Under "API restrictions", select "Restrict key"
   - Select "YouTube Data API v3"
   - Save

### 2. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Add your YouTube API key to .env.local
PUBLIC_YOUTUBE_API_KEY=AIzaSy...your-actual-key-here
```

### 3. Start Development Server

```bash
cd web
bun install
bun run dev
```

Visit:
- Creator Dashboard: `http://localhost:4321/dashboard/creator/videos`
- Public Creator Hub: `http://localhost:4321/creators/linus-tech-tips/videos`

---

## Usage

### For Creators (Dashboard)

1. **Connect YouTube Channel:**
   - Go to `/dashboard/creator/videos`
   - Find your YouTube Channel ID:
     - Visit https://www.youtube.com/account_advanced
     - Copy "Channel ID"
   - Enter Channel ID and click "Connect Channel"

2. **Sync Videos:**
   - Click "Sync Videos from YouTube"
   - Videos will load from YouTube API
   - Sort by date, views, or title

3. **View Videos:**
   - Videos display in responsive grid
   - Click "View on YouTube" to watch
   - See views, duration, publish date

### For Viewers (Public)

1. **Visit Creator Profile:**
   - Navigate to `/creators/[slug]/videos`
   - Example: `/creators/linus-tech-tips/videos`

2. **Browse Videos:**
   - View all creator's YouTube videos
   - Sort by newest, most views, or alphabetical
   - Click to watch on YouTube

---

## Available Creators (Demo)

The following creators are hardcoded for demo purposes:

1. **Linus Tech Tips** (`/creators/linus-tech-tips/videos`)
   - Channel ID: `UCXuqSBlHAE6Xw-yeJA0Tunw`
   - 15.9M subscribers, 7.2K videos

2. **Fireship** (`/creators/fireship/videos`)
   - Channel ID: `UCsBjURrPoezykLs9EqgamOA`
   - 3.2M subscribers, 520 videos

3. **Demo Creator** (`/creators/demo-creator/videos`)
   - No real channel (shows empty state)

---

## Architecture

### Current (Frontend-only)
```
User → YouTube API Service → YouTube Data API v3 → Videos
                  ↓
            localStorage (channel ID)
                  ↓
          Creator Dashboard / Public Hub
```

**Pros:**
- Fast to implement (no backend needed)
- Direct YouTube data (always fresh)
- No database setup required

**Cons:**
- API rate limits (10,000 quota units/day)
- No caching (fetches on every page load)
- No custom metadata
- No backend control

### Future (Backend Integration)

```
User → YouTube API Service → Convex Backend
                                    ↓
                              YouTube Sync Service
                                    ↓
                            YouTube Data API v3
                                    ↓
                            Convex Database
                                    ↓
                        Creator Dashboard / Public Hub
```

**Benefits:**
- Backend caching (reduce API calls)
- Store custom metadata
- Auto-sync on schedule
- Analytics tracking
- Search and filtering

---

## API Limits

### YouTube Data API v3 (Free Tier)

- **Daily Quota:** 10,000 units
- **Cost per request:**
  - Search: 100 units
  - Channel info: 1 unit
  - Video details: 1 unit
- **Estimated usage:**
  - Fetch 50 videos: ~102 units (1 search + 1 videos call)
  - Can fetch ~100 times per day (~5,000 videos)

### Optimization Tips

1. **Cache on backend** (future): Store videos in Convex, refresh every 6-24 hours
2. **Limit results**: Fetch 20-50 videos instead of all
3. **Use pagination**: Load more as user scrolls
4. **Rate limit protection**: Track quota usage, show warning when low

---

## Next Steps (Backend Integration)

To add backend storage (Phase 2):

1. **Create Convex schema:**
   - Thing type: `youtube_video`
   - Properties: videoId, title, thumbnail, duration, views, etc.

2. **Create mutations:**
   - `mutations/videos/sync.ts` - Sync from YouTube
   - `mutations/videos/update.ts` - Update metadata

3. **Create queries:**
   - `queries/videos/listByCreator.ts` - Get creator's videos

4. **Update frontend:**
   - Replace YouTube API calls with Convex queries
   - Add backend sync button
   - Store videos in database

See `/one/things/creator-system-plan.md` for full 100-cycle implementation plan.

---

## Files Created

```
web/
├── src/
│   ├── services/
│   │   └── YouTubeService.ts          # YouTube API service (NEW)
│   ├── pages/
│   │   ├── dashboard/
│   │   │   └── creator/
│   │   │       └── videos.astro       # Creator dashboard (NEW)
│   │   └── creators/
│   │       ├── [slug]/
│   │       │   └── videos.astro       # Public video hub (NEW)
│   │       └── README.md              # This file (NEW)
│   └── .env.example                   # Updated with YouTube API key
```

---

## Testing

1. **Without API Key:**
   - Error message shown: "YouTube API key not configured"
   - Empty states displayed

2. **With API Key:**
   - Connect a real YouTube channel
   - Videos load from YouTube
   - Sort and view videos

3. **Public Pages:**
   - Visit `/creators/linus-tech-tips/videos`
   - Should load Linus Tech Tips videos
   - Responsive on mobile/tablet/desktop

---

## Troubleshooting

### "YouTube API key not configured"
- Make sure `PUBLIC_YOUTUBE_API_KEY` is set in `.env.local`
- Restart dev server after adding env variable

### "Failed to fetch channel videos"
- Check API key is valid
- Verify YouTube Data API v3 is enabled in Google Cloud
- Check quota hasn't been exceeded (10,000 units/day)

### "Channel not found"
- Verify Channel ID is correct
- Try searching by channel name first

### Videos not loading
- Check browser console for errors
- Verify channel has public videos
- Test with known working channel (Linus Tech Tips)

---

**Built with:** Astro 5, React 19, YouTube Data API v3, TypeScript

**Status:** Ready for production (with API key configured)

**Next:** Add Convex backend storage for better performance and caching
