import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

const matchNumber = (pattern) => {
  const match = html.match(pattern);
  assert.ok(match, `Missing ${pattern}`);
  return Number(match[1]);
};

assert.match(html, /<label for="total-agencies">No-current-usage agencies<\/label>/);
assert.match(html, /<label for="paid-agencies">Additional exclusions<\/label><input id="paid-agencies"[^>]+value="0">/);
assert.match(html, /id="growth-rate"[^>]+value="20"/);
assert.match(html, /id="ppu-rate"[^>]+value="30"/);
assert.match(html, /id="sub97-rate"[^>]+value="30"/);
assert.doesNotMatch(html, /overlap-to-ppu|866 overlap users|curves\.to97|curves\.toPpu/);
assert.match(html, /29,592 PPU-only users across 26,383 agencies/);
assert.match(html, /1,718 subscription-linked users across 1,502 agencies/);
assert.match(html, /\$97 ceiling/);

const ppuUsers = matchNumber(/ppuUsers:\s*(\d+)/);
const ppuRevenue = matchNumber(/ppuRevenue:\s*([\d.]+)/);
const subscriptionUsers = matchNumber(/subscriptionUsers:\s*(\d+)/);
const subscriptionPrice = matchNumber(/subscriptionPrice:\s*(\d+)/);
const curveText = html.match(/const ppuTopRevenueCurve = \[([^\]]+)\]/s);
assert.ok(curveText, 'Missing PPU top-revenue curve');
const curve = curveText[1].split(',').map(Number);

assert.equal(ppuUsers, 29_592);
assert.equal(subscriptionUsers, 1_718);
assert.equal(subscriptionPrice, 97);
assert.equal(curve.length, 101);
assert.equal(Math.round(ppuRevenue), 445_570);
assert.equal(Math.round(curve[30]), 392_251);
assert.equal(Math.round(curve[100]), 445_570);

const platformMrr = 128_038 * 0.20 * 1.17 * 20;
const ppuSeats = Math.ceil(ppuUsers * 0.30);
const subscriptionSeats = Math.ceil(subscriptionUsers * 0.30);
const existingSeatMrr = (ppuSeats + subscriptionSeats) * 20;
const displaced = curve[30] + subscriptionSeats * subscriptionPrice;
const net = platformMrr + existingSeatMrr - displaced;

assert.equal(ppuSeats, 8_878);
assert.equal(subscriptionSeats, 516);
assert.equal(Math.round(platformMrr), 599_218);
assert.equal(existingSeatMrr, 187_880);
assert.equal(Math.round(displaced), 442_303);
assert.equal(Math.round(net), 344_794);

assert.match(html, /id="net-impact">\+\$344\.8K/);
assert.match(html, /id="annual-impact">\+\$4\.14M annualized/);
assert.match(html, /id="bridge-existing">\$187\.9K/);
assert.match(html, /id="bridge-displaced">\$442\.3K/);

console.log('Updated dashboard cohorts and default scenario reconcile.');
