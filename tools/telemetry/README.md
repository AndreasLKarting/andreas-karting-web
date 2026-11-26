# Race data page

Pages: `/rd-5vu19xn8kj/`, `/en/rd-5vu19xn8kj/`, `/gr/rd-5vu19xn8kj/` (hidden: not linked, not in the sitemap, noindex) (made by `build_pages.py`, logic in `/racedata.js`, styling in `/racedata.css`).

## Add a session
1. In RaceChrono: export the session as **CSV** (format 2 or 3, all channels).
2. `python3 tools/telemetry/convert.py path/to/session_....csv` (needs python3, numpy, pandas). It writes `data/rd-5vu19xn8kj/<id>.json` (the id is printed, e.g. `2026-08-pista-park`) and updates `data/rd-5vu19xn8kj/index.json`. No GPS coordinates are published.
3. Commit the new files in `data/rd-5vu19xn8kj/`.
4. Add a row to the **Sessions** tab of the Google Sheet (see `sessions-template.csv`):

| Column | Meaning |
|---|---|
| date | DD/MM/YYYY (shown on the card, used for the order) |
| title | name on the card, e.g. "Assen Junior Track" |
| track | circuit name |
| country | NL, BE, GR ... (optional) |
| type | race / training (optional) |
| file | the id from step 2, without `.json` |
| show | yes / no, a session with `no` is hidden |
| notes | free text, not shown |
| title_en, title_el | optional titles per language |
| video | optional: YouTube link (or the 11-character id) of the onboard video; the "Onboard" block only shows when this is filled |
| video_start | optional: start second of the video |

5. Publish the tab (File > Share > Publish to web > Sessions > CSV) and paste the link in `SESSIONS_CSV` at the top of `/racedata.js`. Until then the page shows every session in `index.json`.

## Notes
- Only complete laps are used (in/out laps are dropped automatically).
- Segment colours and G-forces are calculated from the GPS racing line and speed, so they read lower than a real accelerometer.
