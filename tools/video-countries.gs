/**
 * List the countries of your YouTube videos, based on the "Video location" you set in YouTube Studio.
 *
 * Add this file to the SAME Apps Script project as social-metrics.gs (the "+" next to Files > Script),
 * so it can use the same YT_API_KEY script property and the CHANNEL_ID constant from that file.
 * Then run  listVideoCountries()  once and accept the extra permissions (it uses Google Maps to turn a
 * location into a country). It creates two tabs:
 *   "Video countries"          one row per video: title, date, location text, country
 *   "Video countries summary"  how many videos per country
 *
 * A video only has a location if you set one in YouTube Studio (Content > the video > Show more >
 * Video location). Videos without one are listed as "(no location set)".
 * Private videos are not included (the API key can only see public and unlisted ones).
 */

function listVideoCountries() {
  const key = PropertiesService.getScriptProperties().getProperty('YT_API_KEY');
  if (!key) throw new Error('Add the script property YT_API_KEY first (Project Settings > Script properties).');
  if (typeof CHANNEL_ID === 'undefined' || !CHANNEL_ID) throw new Error('Fill in CHANNEL_ID at the top of social-metrics.gs first.');

  // 1. the channel's "uploads" playlist
  const ch = ytGet_('channels', { part: 'contentDetails', id: CHANNEL_ID }, key);
  if (!ch.items || !ch.items.length) throw new Error('Channel not found: ' + CHANNEL_ID);
  const uploads = ch.items[0].contentDetails.relatedPlaylists.uploads;

  // 2. every video id in it
  const ids = [];
  let token = '';
  do {
    const p = ytGet_('playlistItems', { part: 'contentDetails', playlistId: uploads, maxResults: 50, pageToken: token }, key);
    (p.items || []).forEach(it => ids.push(it.contentDetails.videoId));
    token = p.nextPageToken || '';
  } while (token);

  // 3. title, date and recording location for each video (50 per request)
  const videos = [];
  for (let i = 0; i < ids.length; i += 50) {
    const v = ytGet_('videos', { part: 'snippet,recordingDetails', id: ids.slice(i, i + 50).join(',') }, key);
    (v.items || []).forEach(x => videos.push(x));
  }

  // 4. country per video (cached, so the same place is only looked up once)
  const cache = {};
  const rows = videos.map(v => {
    const rd = v.recordingDetails || {};
    const loc = rd.location;
    const text = rd.locationDescription || '';
    let country = '';
    if (loc && loc.latitude != null) country = countryOf_('ll:' + loc.latitude + ',' + loc.longitude, () => Maps.newGeocoder().reverseGeocode(loc.latitude, loc.longitude), cache);
    if (!country && text) country = countryOf_('tx:' + text, () => Maps.newGeocoder().geocode(text), cache);
    return [v.snippet.title, v.snippet.publishedAt.slice(0, 10), text || (loc ? loc.latitude + ', ' + loc.longitude : ''), country || '(no location set)', 'https://www.youtube.com/watch?v=' + v.id];
  }).sort((a, b) => a[3].localeCompare(b[3]) || b[1].localeCompare(a[1]));

  writeTab_('Video countries', ['title', 'published', 'location', 'country', 'link'], rows);

  // 5. summary
  const count = {};
  rows.forEach(r => { count[r[3]] = (count[r[3]] || 0) + 1; });
  const summary = Object.keys(count).map(c => [c, count[c]]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  writeTab_('Video countries summary', ['country', 'videos'], summary);
  SpreadsheetApp.getActive().toast(videos.length + ' videos, ' + summary.length + ' countries', 'Video countries', 8);
}

function ytGet_(endpoint, params, key) {
  const q = Object.keys(params).filter(k => params[k] !== '').map(k => k + '=' + encodeURIComponent(params[k])).join('&');
  const res = UrlFetchApp.fetch('https://www.googleapis.com/youtube/v3/' + endpoint + '?' + q + '&key=' + encodeURIComponent(key), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('YouTube API error ' + res.getResponseCode() + ': ' + res.getContentText());
  return JSON.parse(res.getContentText());
}

function countryOf_(cacheKey, lookup, cache) {
  if (cacheKey in cache) return cache[cacheKey];
  let name = '';
  try {
    const r = lookup();
    const comps = (r.results && r.results[0] && r.results[0].address_components) || [];
    const c = comps.filter(a => a.types.indexOf('country') >= 0)[0];
    name = c ? c.long_name : '';
  } catch (e) { name = ''; }
  cache[cacheKey] = name;
  return name;
}

function writeTab_(name, header, rows) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  if (rows.length) sh.getRange(2, 1, rows.length, header.length).setValues(rows);
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, header.length);
}
