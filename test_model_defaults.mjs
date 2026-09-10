import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

assert.match(html, /<label for="total-agencies">No-current-usage agencies<\/label>/);
assert.match(html, /<label for="paid-agencies">Additional exclusions<\/label><input id="paid-agencies"[^>]+value="0">/);
assert.match(html, /id="growth-helper">128,038 eligible agencies/);
assert.match(html, /id="adopting-agencies">25,608/);
assert.match(html, /id="growth-seats">29,961/);
assert.match(html, /id="growth-mrr">\$599\.2K/);
assert.match(html, /id="bridge-growth">\$599\.2K/);
assert.match(html, /id="net-impact">\+\$307\.9K/);
assert.match(html, /id="annual-impact">\+\$3\.69M annualized/);

// Reconcile the screenshot scenario: 20% platform adoption and 30% conversion
// in each paid cohort, with overlap attributed to the $97 cohort.
const platformMrr = 128_038 * 0.20 * 1.17 * 20;
const ppuSeatMrr = Math.ceil(30_537 * 0.30) * 20;
const sub97SeatMrr = Math.ceil(2_027 * 0.30) * 20;
const displaced = 425_599.39 + (181_875 * 0.30);
const net = platformMrr + ppuSeatMrr + sub97SeatMrr - displaced;

assert.equal(Math.round(platformMrr), 599_218);
assert.equal(Math.round(net), 314_476);

console.log('Model defaults and 30% scenario reconcile.');
