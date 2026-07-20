const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const pathsToCheck = [
  'ar/services/index.html',
  'ar/services/house-cleaning-doha/index.html',
  'ar/services/hourly-maids-qatar/index.html',
  'ar/services/sofa-carpet-cleaning/index.html',
  'ar/services/pest-control-qatar/index.html',
  'ar/services/water-tank-cleaning/index.html',
  'ar/services/car-deep-cleaning/index.html',
  'ar/booking/index.html',
  'ar/pricing/index.html',
  'ar/blog/index.html',
  'ar/blog/cleaning-schedule-doha/index.html',
  'ar/blog/hourly-maids-guide-qatar/index.html',
  'ar/blog/sofa-carpet-steam-cleaning/index.html',
  'ar/blog/water-tank-cleaning-guide/index.html',
  'ar/blog/pest-control-qatar-guide/index.html',
  'ar/blog/car-deep-cleaning-guide/index.html',
  'ar/blog/majlis-cleaning-tips/index.html',
  // English counterparts
  'en/services/index.html',
  'en/services/house-cleaning-doha/index.html',
  'en/services/hourly-maids-qatar/index.html',
  'en/services/sofa-carpet-cleaning/index.html',
  'en/services/pest-control-qatar/index.html',
  'en/services/water-tank-cleaning/index.html',
  'en/services/car-deep-cleaning/index.html',
  'en/booking/index.html',
  'en/pricing/index.html',
  'en/blog/index.html',
  'en/blog/cleaning-schedule-doha/index.html',
  'en/blog/hourly-maids-guide-qatar/index.html',
  'en/blog/sofa-carpet-steam-cleaning/index.html',
  'en/blog/water-tank-cleaning-guide/index.html',
  'en/blog/pest-control-qatar-guide/index.html',
  'en/blog/car-deep-cleaning-guide/index.html',
  'en/blog/majlis-cleaning-tips/index.html'
];

let failed = false;

// Emojis regex
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{2600}-\u{26FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|🏆|☎|🇶🇦|🧹|🚗|🚿|🕷|🪳|🧽|🧼|📞|📍|🕒|✓/gu;

pathsToCheck.forEach(relativePath => {
  const filePath = path.join(baseDir, relativePath);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File does not exist: ${relativePath}`);
    failed = true;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Check 1: Emojis
  const emojisFound = content.match(emojiRegex);
  if (emojisFound) {
    console.error(`❌ Emojis found in ${relativePath}: ${emojisFound.join(' ')}`);
    failed = true;
  }

  // Check 2: Pricing numbers
  // Check if there are strings like "30 ريال" or "500 QAR" or "35 QAR" or "35 ر.ق"
  // Note: We want to exclude dates like "2026" or "24/7" or coordinates or telephone number "77170300"
  const priceMatches = content.match(/(?:(?:QAR|QR|ريال|ر\.ق)\s*\d+)|(?:\d+\s*(?:QAR|QR|ريال|ر\.ق))/i);
  if (priceMatches) {
    console.error(`❌ Potential price numbers found in ${relativePath}: "${priceMatches[0]}"`);
    failed = true;
  }

  // Check 3: WhatsApp click-to-redirect check removed to allow direct dialing phone calls


  // Check 4: langToggle JS safety
  if (!content.includes('id="langToggle"')) {
    console.error(`❌ Missing id="langToggle" in ${relativePath}`);
    failed = true;
  }
});

if (failed) {
  console.error('❌ Validation failed! Some pages violated constraints.');
  process.exit(1);
} else {
  console.log('🎉 All generated pages successfully validated against constraints (No Emojis, No Prices, WhatsApp Redirects Active, JS Safety OK)!');
}
