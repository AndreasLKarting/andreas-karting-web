# Social metrics: automatic numbers for the website

The Audience section reads its numbers from a **"Social"** tab in the Google Sheet. YouTube is
filled in automatically every day; Instagram and TikTok are typed in by hand (a column per metric,
one row each) until they are automated.

## Sheet layout (tab name: `Social`)

| platform | metric | value | updated |
|---|---|---|---|
| YouTube | Subscribers | 134 | 2026-10-16 |

* Platform names: `YouTube`, `Instagram`, `TikTok` (any capitalisation).
* The rows of a platform are shown in the order they appear. Numbers are shortened on the site
  (165300 shows as 165.3K). Text such as `1.2K` is shown as typed.
* `updated` is a date (`yyyy-mm-dd`); the website shows the most recent one under the section title.
* `social-template.csv` is an example of the layout.

## One-time setup

1. **YouTube API key** (free): Google Cloud Console > create or pick a project > APIs & Services >
   enable *YouTube Data API v3* > Credentials > Create API key. Restrict the key to the YouTube Data API.
2. In the Sheet: **Extensions > Apps Script**. Paste `social-metrics.gs`, replacing the existing code.
3. **Project Settings > Script properties**: add `YT_API_KEY` with the key. (Never put it in the code or the website.)
3b. Find the channel ID (YouTube Studio > Settings > Channel > Advanced settings) and paste it into `CHANNEL_ID` at the top of the script. The `@handle` lookup can fail for handles that contain a dot.
4. Run `setup()` once and accept the permissions. It creates the `Social` tab and a daily trigger.
5. **File > Share > Publish to web**: choose the `Social` tab and format **CSV**, then Publish. Copy the link.
6. In `index.html`, paste that link into `socialSheet:"..."` inside `CFG`. Commit it.

After that the site shows the Sheet numbers; if the Sheet cannot be reached it falls back to the numbers
written in `index.html`.

## Later: Instagram and TikTok

Add a function like `updateYouTube()` that calls the platform's API and uses `setMetric_()` to write rows.
Instagram needs a Creator or Business account linked to a Facebook Page, a Meta app and a token that is
renewed about every 60 days. TikTok needs an approved developer app.

# Photos: titles, dates and descriptions from the Sheet

The Photos section and its carousel (click a photo to open it, then swipe, use the arrows or the
keyboard) can read from a **"Photos"** tab in the same Google Sheet.

## Sheet layout (tab name: `Photos`)

| file | title | date | location | credits |
|---|---|---|---|---|
| circuit27 | Circuit 27 | 2026-09-12 | Athens, Greece | Photographer or source |

* `file` is the name of the picture in `images/race/` (with or without `.jpg`). Only `file` is required.
* `title` falls back to the file name. `date` as `2026-09-12` or `12/09/2026`.
* `location` is shown next to the date in the carousel, `credits` as "Photo: ...".
* Row order is the order on the site. The first photo is shown tall on the left, so use a portrait photo first, or change the style.
* `photos-template.csv` is an example of the layout.

## Set up

1. Add a tab named `Photos` with the five column headers above (file, title, date, location, credits).
2. **File > Share > Publish to web**: choose the `Photos` tab and format **CSV**, then Publish. Copy the link.
3. In `index.html`, paste the link into `photosSheet:"..."` inside `CFG`. Commit it.
4. Upload each new picture to `images/race/` on GitHub, then add its row to the tab.

Until `photosSheet` is set, the site uses the `PHOTOS` list in `index.html`.

# Videos: carousel from the Sheet

The Videos row scrolls sideways (arrow buttons or swipe). Clicking a video plays it in a pop-up on the
site, with arrows, dots and the keyboard to move to the next one. It reads a **"Videos"** tab in the same Sheet.

## Sheet layout (tab name: `Videos`)

| id | title | date | location | credits |
|---|---|---|---|---|
| Q9MOau-zC30 | Hitting 110km/h at Circuit 27 (GR) | 2026-09-12 | Athens, Greece | Andreas Lazaridis Karting |

* `id` is the part after `v=` in the YouTube link (for a Short, the part after `/shorts/`). Only `id` is required.
* `title` falls back to "Video". `date` as `2026-09-12` or `12/09/2026`.
* `location` is shown next to the date in the pop-up, `credits` as "Video: ...".
* Row order is the order on the site. `videos-template.csv` is an example.

## Set up

1. Add a tab named `Videos` with the five headers above.
2. **File > Share > Publish to web**: choose the `Videos` tab, format **CSV**, Publish. Copy the link.
3. In `index.html`, paste it into `videosSheet:"..."` inside `CFG`. Commit it.

Until `videosSheet` is set, the site uses the `VIDEOS` list in `index.html`.

# Countries of your YouTube videos

`video-countries.gs` lists which countries your videos are from, using the "Video location" set in
YouTube Studio. Add it to the same Apps Script project as `social-metrics.gs`, run
`listVideoCountries()` once and accept the permissions. It creates the tabs `Video countries`
(one row per video) and `Video countries summary` (videos per country). Videos without a location
show as "(no location set)". These tabs are not published and the website does not use them.
