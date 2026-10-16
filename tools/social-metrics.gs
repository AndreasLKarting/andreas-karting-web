/**
 * Andreas Lazaridis: automatic social metrics for the website.
 *
 * Runs inside the Google Sheet (Extensions > Apps Script). Once a day it reads the public YouTube
 * channel numbers and writes them to the "Social" tab. The website reads that tab.
 *
 * Setup (once):
 *  1. Paste this file into the Apps Script editor, replacing everything there.
 *  2. Project Settings (gear icon) > Script properties > add  YT_API_KEY  = your YouTube Data API key.
 *  3. Run  setup()  once from the editor and accept the permissions. It creates the "Social" tab
 *     (if missing) and the daily trigger.
 *  The key is stored in Script properties, never in this code or on the website.
 */

const HANDLE = '@AndreasLazaridis.Karting';   // YouTube channel handle (used only if CHANNEL_ID is empty)
const CHANNEL_ID = '';                         // paste the channel ID (UC...) here: more reliable than the handle
const TAB = 'Social';
const HEADER = ['platform', 'metric', 'value', 'updated'];

function setup() {
  getTab_();
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'updateYouTube').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('updateYouTube').timeBased().everyDays(1).atHour(6).create();
  updateYouTube();
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
      ['Instagram', 'Followers', 753, ''], ['Instagram', 'Posts', 167, ''], ['Instagram', 'Profile activity (month)', 480, ''], ['Instagram', 'Views (month)', '33.4K', ''],
      ['TikTok', 'Followers', 466, ''], ['TikTok', 'Posts', 36, ''], ['TikTok', 'Profile views (month)', 215, ''], ['TikTok', 'Views (month)', '8.8K', ''],
    ];
    sh.getRange(2, 1, manual.length, 4).setValues(manual);
    sh.setFrozenRows(1);
  }
  return sh;
}
