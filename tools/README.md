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

| file | date | title | description |
|---|---|---|---|
| circuit27 | 2026-09-12 | Circuit 27 (GR) | Optional text shown under the photo |

* `file` is the name of the picture in `images/race/` (with or without `.jpg`). Only `file` is required.
* `date` as `2026-09-12` or `12/09/2026`. `title` falls back to the file name.
* Row order is the order on the site. The first photo is shown tall on the left, so use a portrait photo first, or change the style.
* `photos-template.csv` is an example of the layout.

## Set up

1. Add a tab named `Photos` with the four column headers above.
2. **File > Share > Publish to web**: choose the `Photos` tab and format **CSV**, then Publish. Copy the link.
3. In `index.html`, paste the link into `photosSheet:"..."` inside `CFG`. Commit it.
4. Upload each new picture to `images/race/` on GitHub, then add its row to the tab.

Until `photosSheet` is set, the site uses the `PHOTOS` list in `index.html`.
