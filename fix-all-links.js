const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const arDir = path.join(baseDir, 'ar');
const enDir = path.join(baseDir, 'en');

const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{2600}-\u{26FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|🏆|☎|🇶🇦|🧹|🚗|🚿|🕷|🪳|🧽|🧼|📞|📍|🕒|✓/gu;

function fixHtmlFile(filePath, isEn) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Clean emojis
  content = content.replace(emojiRegex, '');

  // 2. Clean tel links (point to WhatsApp)
  content = content.replace(/href="tel:77170300"/g, 'href="https://wa.me/97477170300"');
  content = content.replace(/href="tel:\+97477170300"/g, 'href="https://wa.me/97477170300"');

  // 3. Compute depth and relative prefix
  const relativeToLang = path.relative(isEn ? enDir : arDir, path.dirname(filePath));
  const depth = relativeToLang ? relativeToLang.split(path.sep).length : 0;
  let prefix = '';
  for (let i = 0; i < depth; i++) {
    prefix += '../';
  }

  const langPrefix = prefix || './';
  const pathToRoot = prefix + '../';
  const otherLangDir = isEn ? 'ar/' : 'en/';

  // Replace navbar links pointing to anchors
  content = content.replace(/href="#home"/g, `href="${langPrefix}"`);
  content = content.replace(/href="#services"/g, `href="${prefix}services/"`);
  content = content.replace(/href="#why-us"/g, `href="${prefix}#why-us"`);
  content = content.replace(/href="#faq"/g, `href="${prefix}#faq"`);
  content = content.replace(/href="#contact"/g, `href="${prefix}booking/"`);

  if (depth > 0) {
    content = content.replace(/href="\.\/"/g, `href="${langPrefix}"`);
    content = content.replace(/href="services\/"/g, `href="${langPrefix}services/"`);
    content = content.replace(/href="pricing\/"/g, `href="${langPrefix}pricing/"`);
    content = content.replace(/href="blog\/"/g, `href="${langPrefix}blog/"`);
    content = content.replace(/href="booking\/"/g, `href="${langPrefix}booking/"`);
    content = content.replace(/href="#why-us"/g, `href="${langPrefix}#why-us"`);
    content = content.replace(/href="#faq"/g, `href="${langPrefix}#faq"`);
  }

  // Replace logo link href="#"
  content = content.replace(/href="#"(\s+class="logo-link")/g, `href="${langPrefix}"$1`);
  content = content.replace(/(class="logo-link"\s+)href="#"/g, `$1href="${langPrefix}"`);

  // Convert absolute links to current language to relative
  const absLangPrefix = isEn ? '/en/' : '/ar/';
  content = content.replace(new RegExp(`href="${absLangPrefix}"`, 'g'), `href="${langPrefix}"`);
  content = content.replace(new RegExp(`href="${absLangPrefix}`, 'g'), `href="${prefix}`);

  // Convert absolute links to other language to relative
  const otherLangPrefix = isEn ? '/ar/' : '/en/';
  content = content.replace(new RegExp(`href="${otherLangPrefix}"`, 'g'), `href="${pathToRoot}${otherLangDir}"`);
  content = content.replace(new RegExp(`href="${otherLangPrefix}`, 'g'), `href="${pathToRoot}${otherLangDir}`);

  // 4. Update policy page back buttons and links
  content = content.replace(/href="\/"(\s+class="back-btn")/g, `href="${langPrefix}"$1`);
  
  // Replace policy paths to be relative as well
  const pathToArPolicy = isEn ? '../ar/' : (prefix || './');
  content = content.replace(/href="privacy-policy\.html"/g, `href="${pathToArPolicy}privacy-policy.html"`);
  content = content.replace(/href="terms\.html"/g, `href="${pathToArPolicy}terms.html"`);
  content = content.replace(/href="refund-policy\.html"/g, `href="${pathToArPolicy}refund-policy.html"`);
  
  content = content.replace(/href="[^"]*privacy-policy\.html"/g, `href="${pathToArPolicy}privacy-policy.html"`);
  content = content.replace(/href="[^"]*terms\.html"/g, `href="${pathToArPolicy}terms.html"`);
  content = content.replace(/href="[^"]*refund-policy\.html"/g, `href="${pathToArPolicy}refund-policy.html"`);

  // 5. Update footer area pills links to point to their dedicated pages (if they exist)
  const cities = [
    { ar: 'الدوحة', en: 'Doha', folder: 'doha' },
    { ar: 'الوكرة', en: 'Al Wakra', folder: 'al-wakra' },
    { ar: 'الريان', en: 'Al Rayyan', folder: 'al-rayyan' },
    { ar: 'الخور', en: 'Al Khor', folder: 'al-khor' },
    { ar: 'لوسيل', en: 'Lusail', folder: 'lusail' },
    { ar: 'أم صلال', en: 'Umm Salal', folder: 'umm-salal' },
    { ar: 'الغرافة', en: 'Al Gharafa', folder: 'al-gharafa' },
    { ar: 'اللؤلؤة', en: 'The Pearl', folder: 'the-pearl' }
  ];

  cities.forEach(city => {
    // E.g. href="#service-areas" class="area-pill" data-ar="الدوحة"
    const regexAr = new RegExp(`href="[^"]*"(\\s+class="area-pill"\\s+data-ar="${city.ar}")`, 'g');
    content = content.replace(regexAr, `href="${langPrefix}${city.folder}/"$1`);
    
    const regexEn = new RegExp(`href="[^"]*"(\\s+class="area-pill"\\s+data-en="${city.en}")`, 'g');
    content = content.replace(regexEn, `href="${langPrefix}${city.folder}/"$1`);
  });

  // 6. Wrap why-us-img in why-us-img-wrapper if not already wrapped
  if (content.includes('class="why-us-img"') && !content.includes('class="why-us-img-wrapper"')) {
    content = content.replace(
      /<div class="why-us-img">\s*([\s\S]*?)\s*<\/div>/g,
      '<div class="why-us-img"><div class="why-us-img-wrapper">$1</div></div>'
    );
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${path.relative(baseDir, filePath)}`);
  }
}

function walkDir(dir, isEn) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, isEn);
    } else if (stat.isFile() && file.endsWith('.html')) {
      fixHtmlFile(filePath, isEn);
    }
  });
}

console.log('Fixing Arabic files...');
walkDir(arDir, false);

console.log('Fixing English files...');
walkDir(enDir, true);

console.log('Done!');
