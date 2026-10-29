# Social metrics: automatic numbers for the website

The Audience section reads its numbers from a **"Social"** tab in the Google Sheet. YouTube and Instagram are
filled in automatically every day; TikTok is typed in by hand (one row per metric).

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

## Instagram (automatic)

The script also fills four Instagram figures every day: **Followers**, **Views (30 days)**,
**Accounts reached (30 days)** and **Interactions (30 days)**. It uses Meta's official Instagram API
(Instagram Login) and replaces the old hand-typed Instagram rows (Posts, Profile activity, Views (month)).

One-time setup (about 20 minutes):

1. The Instagram account must be a **professional account** (Creator or Business): Instagram > Settings > Account type and tools.
2. Go to developers.facebook.com, create a free app (type *Business*), add the product **Instagram**
   and open *API setup with Instagram login*.
3. Add the Instagram account (*Add account*) and log in with it. Request the permissions
   `instagram_business_basic` and `instagram_business_manage_insights`. While the app stays in
   development mode this works for your own account without app review.
4. Click **Generate token** for the account and copy it. If it is a short-lived token, exchange it for a
   long-lived (60 day) one as described in the Meta documentation.
5. In Apps Script > Project Settings > Script properties add `IG_TOKEN` with that token. Paste the newest
   `social-metrics.gs`, then run `setup()` again (it also switches the daily trigger to `updateAll`).

The script renews the token itself about once a week, so it does not expire as long as it keeps running.
If the Instagram numbers stop updating, check Apps Script > Executions for the error; a token that has
expired is replaced by generating a new one (step 4).

Two notes: Instagram only reports views, reach and interactions for accounts with more than 100
followers, and the numbers are a rolling 30-day window, which is why the labels say "(30 days)".

## TikTok

Still typed in by hand: TikTok needs an approved developer app for automatic numbers.

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

| id | title | date | track | location | country | credits |
|---|---|---|---|---|---|---|
| Q9MOau-zC30 | Hitting 110km/h at Circuit 27 (GR) | 2026-09-12 | Circuit 27 | Athens | Greece | Andreas Lazaridis Karting |

* `id` is the part after `v=` in the YouTube link (for a Short, the part after `/shorts/`). Only `id` is required.
* `title` falls back to "Video". `date` as `2026-09-12` or `12/09/2026`.
* `track`, `location` (town) and `country` are shown next to the date in the pop-up as "Track · Location, Country"; each is optional. `credits` is shown as "Video: ...". (An older sheet with only a `location` column still works.)
* Row order is the order on the site. `videos-template.csv` is an example.

## Set up

1. Add a tab named `Videos` with the seven headers above (id, title, date, track, location, country, credits).
2. **File > Share > Publish to web**: choose the `Videos` tab, format **CSV**, Publish. Copy the link.
3. In `index.html`, paste it into `videosSheet:"..."` inside `CFG`. Commit it.

Until `videosSheet` is set, the site uses the `VIDEOS` list in `index.html`.

# Partners: logos in the Sponsoring section

The "Our partners" area shows each partner's logo by tier (Main Partner large, Partner medium,
Supporter small). A logo links to the partner's website and shows in colour on hover. While there are
no partners it shows three open "Your logo here" slots that open an email.

## Sheet layout (tab name: `Partners`)

| name | tier | logo | link |
|---|---|---|---|
| Acme Racing | Main Partner | acme.png | https://www.acme.example |

* `name` is required (it is also the text shown if the logo file is missing).
* `tier`: `Main Partner`, `Partner` or `Supporter`.
* `logo` is the file name in `images/partners/` (PNG, SVG, JPG or WebP; a transparent PNG or SVG works best).
* `link` is the partner's website (must start with `https://`). Leave empty for no link.
* `partners-template.csv` is an example.

## Set up

1. Upload the logo files to `images/partners/` on GitHub.
2. Add a `Partners` tab with the four headers above and one row per partner.
3. **File > Share > Publish to web**: the `Partners` tab, format **CSV**. Copy the link.
4. In `index.html`, paste it into `partnersSheet:"..."` inside `CFG`. Commit it.

Only add a partner's logo once they have agreed to appear on the site.
