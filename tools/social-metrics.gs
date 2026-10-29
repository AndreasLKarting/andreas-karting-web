/**
 * Andreas Lazaridis: automatic social metrics for the website.
 *
 * Runs inside the Google Sheet (Extensions > Apps Script). Once a day it reads the public YouTube
 * channel numbers and the Instagram numbers and writes them to the "Social" tab. The website reads that tab.
 *
 * Setup (once):
 *  1. Paste this file into the Apps Script editor, replacing everything there.
 *  2. Project Settings (gear icon) > Script properties > add  YT_API_KEY  = your YouTube Data API key.
 *  3. Run  setup()  once from the editor and accept the permissions. It creates the "Social" tab
 *     (if missing) and the daily trigger.
 *  4. Instagram (optional): add the script property  IG_TOKEN  (see tools/README.md), then run  setup()  again.
 *  Keys and tokens are stored in Script properties, never in this code or on the website.
 */

const HANDLE = '@AndreasLazaridis.Karting';   // YouTube channel handle (used only if CHANNEL_ID is empty)
const CHANNEL_ID = '';                         // paste the channel ID (UC...) here: more reliable than the handle
const TAB = 'Social';
const IG_API = 'https://graph.instagram.com/v23.0';   // bump the version number here if Meta retires this one
const IG_DAYS = 29;                                    // window for the "(30 days)" figures; the API allows at most 30
const HEADER = ['platform', 'metric', 'value', 'updated'];

function setup() {
  getTab_();
  ScriptApp.getProjectTriggers().filter(t => ['updateYouTube', 'updateAll'].indexOf(t.getHandlerFunction()) >= 0).forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('updateAll').timeBased().everyDays(1).atHour(6).create();
  updateAll();
}

/** Daily entry point. One platform failing does not stop the other. */
function updateAll() {
  const errors = [];
  [updateYouTube, updateInstagram].forEach(fn => { try { fn(); } catch (e) { errors.push(fn.name + ': ' + e.message); } });
  if (errors.length) throw new Error(errors.join(' | '));
}

function updateYouTube() {
  const key = PropertiesService.getScriptProperties().getProperty('YT_API_KEY');
  if (!key) throw new Error('Add the script property YT_API_KEY first (Project Settings > Script properties).');
  const url = 'https://www.googleapis.com/youtube/v3/channels?part=statistics&key=' + encodeURIComponent(key) +
    (CHANNEL_ID ? '&id=' + encodeURIComponent(CHANNEL_ID) : '&forHandle=' + encodeURIComponent(HANDLE));
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('YouTube API error ' + res.getResponseCode() + ': ' + res.getContentText());
  const items = JSON.parse(res.getContentText()).items || [];
  if (!items.length) throw new Error('No channel found for ' + (CHANNEL_ID || HANDLE));
  const st = items[0].statistics;
  const rows = [];
  if (st.hiddenSubscriberCount !== true) rows.push(['Subscribers', Number(st.subscriberCount)]);
  rows.push(['Views', Number(st.viewCount)], ['Videos', Number(st.videoCount)]);
  rows.forEach(r => setMetric_('YouTube', r[0], r[1]));
}

/**
 * Instagram (professional account) via the Instagram API with Instagram Login.
 * Needs the script property IG_TOKEN. Skipped silently while it is not set.
 * Writes: Followers, Views (30 days), Accounts reached (30 days), Interactions (30 days).
 */
function updateInstagram() {
  const props = PropertiesService.getScriptProperties();
  let token = props.getProperty('IG_TOKEN');
  if (!token) return;
  token = refreshIgToken_(token, props);
  const me = igGet_('/me?fields=followers_count&access_token=' + encodeURIComponent(token));
  setMetric_('Instagram', 'Followers', Number(me.followers_count));
  const until = Math.floor(Date.now() / 1000), since = until - IG_DAYS * 86400;
  const ins = igGet_('/me/insights?metric=views,reach,total_interactions&period=day&metric_type=total_value' +
    '&since=' + since + '&until=' + until + '&access_token=' + encodeURIComponent(token));
  const label = { views: 'Views (30 days)', reach: 'Accounts reached (30 days)', total_interactions: 'Interactions (30 days)' };
  (ins.data || []).forEach(m => {
    if (label[m.name] && m.total_value) setMetric_('Instagram', label[m.name], Number(m.total_value.value));
  });
  // the old hand-typed Instagram rows are replaced by the four above
  ['Posts', 'Profile activity (month)', 'Views (month)'].forEach(m => removeMetric_('Instagram', m));
}

/** Long-lived tokens last 60 days. Refresh about weekly so it never expires. */
function refreshIgToken_(token, props) {
  const last = Number(props.getProperty('IG_TOKEN_REFRESHED') || 0);
  if (Date.now() - last < 7 * 86400000) return token;
  const res = UrlFetchApp.fetch('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + encodeURIComponent(token), { muteHttpExceptions: true });
  if (res.getResponseCode() === 200) {
    const t = JSON.parse(res.getContentText()).access_token;
    if (t) { props.setProperties({ IG_TOKEN: t, IG_TOKEN_REFRESHED: String(Date.now()) }); return t; }
  }
  return token;   // try again tomorrow; the current token still works until it expires
}

function igGet_(path) {
  const res = UrlFetchApp.fetch(IG_API + path, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('Instagram API error ' + res.getResponseCode() + ': ' + res.getContentText());
  return JSON.parse(res.getContentText());
}

function removeMetric_(platform, metric) {
  const sh = getTab_(), data = sh.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]).toLowerCase() === platform.toLowerCase() && String(data[i][1]).toLowerCase() === metric.toLowerCase()) sh.deleteRow(i + 1);
  }
}

/** Updates the row platform+metric (adds it at the bottom if new) and stamps today's date. */
function setMetric_(platform, metric, value) {
  const sh = getTab_();
  const data = sh.getDataRange().getValues();
  const today = Utilities.formatDate(new Date(), 'Europe/Amsterdam', 'yyyy-MM-dd');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === platform.toLowerCase() && String(data[i][1]).toLowerCase() === metric.toLowerCase()) {
      sh.getRange(i + 1, 3, 1, 2).setValues([[value, today]]);
      return;
    }
  }
  sh.appendRow([platform, metric, value, today]);
}

function getTab_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.getRange(1, 1, 1, 4).setValues([HEADER]).setFontWeight('bold');
    const manual = [
      ['YouTube', 'Watch time (hours)', '1.2K', ''],
      ['Instagram', 'Followers', 767, ''], ['Instagram', 'Views (30 days)', '16K', ''], ['Instagram', 'Accounts reached (30 days)', '', ''], ['Instagram', 'Interactions (30 days)', '', ''],
      ['TikTok', 'Followers', 466, ''], ['TikTok', 'Posts', 36, ''], ['TikTok', 'Profile views (month)', 215, ''], ['TikTok', 'Views (month)', '8.8K', ''],
    ];
    sh.getRange(2, 1, manual.length, 4).setValues(manual);
    sh.setFrozenRows(1);
  }
  return sh;
}
