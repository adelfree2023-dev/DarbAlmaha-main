const fs = require('fs');
const path = require('path');

// Base Paths
const baseDir = __dirname;
const arTemplatePath = path.join(baseDir, 'ar', 'index.html');
const enTemplatePath = path.join(baseDir, 'en', 'index.html');

if (!fs.existsSync(arTemplatePath) || !fs.existsSync(enTemplatePath)) {
  console.error('Error: Base template index.html or en/index.html not found.');
  process.exit(1);
}

const arBase = fs.readFileSync(arTemplatePath, 'utf8');
const enBase = fs.readFileSync(enTemplatePath, 'utf8');

// Helper to clean emojis from final output
function cleanEmojis(str) {
  return str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{2600}-\u{26FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|🏆|☎|🇶🇦|🧹|🚗|🚿|🕷|🪳|🧽|🧼|📞|📍|🕒|✓/gu, '');
}

// Helper to replace all phone tel links with WhatsApp links
function forceWhatsApp(str) {
  return str;
}

// Extract base Header & Footer from index.html (AR)
function extractARLayout(html) {
  const headStart = html.indexOf('<head>');
  const headEnd = html.indexOf('</head>');
  let headContent = html.substring(headStart + 6, headEnd);

  const headerStart = html.indexOf('<header>');
  const headerEnd = html.indexOf('</header>');
  let headerContent = html.substring(headerStart, headerEnd + 9);

  const footerStart = html.indexOf('<footer');
  const footerEnd = html.indexOf('</footer>');
  let footerContent = html.substring(footerStart, footerEnd + 9);

  // Clean layout elements of emojis and hardcoded prices
  headContent = headContent.replace(/"priceRange":\s*"[^"]*",?/g, '');
  
  // Clean header mobile menu character
  headerContent = headerContent.replace(
    /<button class="mobile-menu-btn" aria-label="Toggle Menu">☰<\/button>/g,
    `<button class="mobile-menu-btn" aria-label="Toggle Menu"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>`
  );

  // Clean footer emojis
  footerContent = footerContent.replace(/📍/g, 'العنوان: ');
  footerContent = footerContent.replace(/📞/g, 'الهاتف: ');
  footerContent = footerContent.replace(/🕒/g, 'ساعات العمل: ');

  return { headContent, headerContent, footerContent };
}

// Extract base Header & Footer from en/index.html (EN)
function extractENLayout(html) {
  const headStart = html.indexOf('<head>');
  const headEnd = html.indexOf('</head>');
  let headContent = html.substring(headStart + 6, headEnd);

  const headerStart = html.indexOf('<header>');
  const headerEnd = html.indexOf('</header>');
  let headerContent = html.substring(headerStart, headerEnd + 9);

  const footerStart = html.indexOf('<footer');
  const footerEnd = html.indexOf('</footer>');
  let footerContent = html.substring(footerStart, footerEnd + 9);

  // Clean layout elements
  headContent = headContent.replace(/"priceRange":\s*"[^"]*",?/g, '');

  // Clean header mobile menu character
  headerContent = headerContent.replace(
    /<button class="mobile-menu-btn" aria-label="Toggle Menu">&#9776;<\/button>/g,
    `<button class="mobile-menu-btn" aria-label="Toggle Menu"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>`
  );

  // Clean footer emojis
  footerContent = footerContent.replace(/📍/g, 'Address: ');
  footerContent = footerContent.replace(/📞/g, 'Phone: ');
  footerContent = footerContent.replace(/🕒/g, 'Hours: ');

  return { headContent, headerContent, footerContent };
}

const arLayout = extractARLayout(arBase);
const enLayout = extractENLayout(enBase);

// Adjust asset paths depending on nesting depth
function adjustPaths(html, depth, isEn) {
  let prefix = '';
  for (let i = 0; i < depth; i++) {
    prefix += '../';
  }

  let adjusted = html;
  
  // Adjust stylesheet paths
  adjusted = adjusted.replace(/href="css\//g, `href="${prefix}css/`);
  adjusted = adjusted.replace(/href="..\/css\//g, `href="${prefix}css/`);
  adjusted = adjusted.replace(/href="..\/..\/css\//g, `href="${prefix}css/`);
  
  // Adjust image paths
  adjusted = adjusted.replace(/src="img\//g, `src="${prefix}img/`);
  adjusted = adjusted.replace(/src="..\/img\//g, `src="${prefix}img/`);
  adjusted = adjusted.replace(/src="..\/..\/img\//g, `src="${prefix}img/`);
  adjusted = adjusted.replace(/href="img\//g, `href="${prefix}img/`);
  adjusted = adjusted.replace(/href="..\/img\//g, `href="${prefix}img/`);
  adjusted = adjusted.replace(/href="..\/..\/img\//g, `href="${prefix}img/`);
  adjusted = adjusted.replace(/preload" href="img\//g, `preload" href="${prefix}img/`);
  adjusted = adjusted.replace(/preload" href="..\/img\//g, `preload" href="${prefix}img/`);
  adjusted = adjusted.replace(/preload" href="..\/..\/img\//g, `preload" href="${prefix}img/`);
  adjusted = adjusted.replace(/imagesrcset="img\//g, `imagesrcset="${prefix}img/`);
  adjusted = adjusted.replace(/imagesrcset="..\/img\//g, `imagesrcset="${prefix}img/`);
  adjusted = adjusted.replace(/imagesrcset="..\/..\/img\//g, `imagesrcset="${prefix}img/`);

  // Adjust script paths
  adjusted = adjusted.replace(/src="js\//g, `src="${prefix}js/`);
  adjusted = adjusted.replace(/src="..\/js\//g, `src="${prefix}js/`);
  adjusted = adjusted.replace(/src="..\/..\/js\//g, `src="${prefix}js/`);

  const langPrefix = prefix || './';
  const pathToRoot = prefix + '../';
  const otherLangDir = isEn ? 'ar/' : 'en/';
  const relLangRoot = prefix.slice(3) || './';

  // Adjust logo links and main links to be relative based on depth
  const absLangPrefix = isEn ? '/en/' : '/ar/';
  adjusted = adjusted.replace(new RegExp(`href="${absLangPrefix}"`, 'g'), `href="${relLangRoot}"`);
  adjusted = adjusted.replace(new RegExp(`href="${absLangPrefix}`, 'g'), `href="${relLangRoot}`);

  const otherLangPrefix = isEn ? '/ar/' : '/en/';
  adjusted = adjusted.replace(new RegExp(`href="${otherLangPrefix}"`, 'g'), `href="${pathToRoot}${otherLangDir}"`);
  adjusted = adjusted.replace(new RegExp(`href="${otherLangPrefix}`, 'g'), `href="${pathToRoot}${otherLangDir}`);

  // Adjust navigation and main section anchor links to be relative to language root
  adjusted = adjusted.replace(/href="\.\/"/g, `href="${relLangRoot}"`);
  adjusted = adjusted.replace(/href="services\/"/g, `href="${relLangRoot}services/"`);
  adjusted = adjusted.replace(/href="pricing\/"/g, `href="${relLangRoot}pricing/"`);
  adjusted = adjusted.replace(/href="blog\/"/g, `href="${relLangRoot}blog/"`);
  adjusted = adjusted.replace(/href="booking\/"/g, `href="${relLangRoot}booking/"`);
  adjusted = adjusted.replace(/href="#why-us"/g, `href="${relLangRoot}#why-us"`);
  adjusted = adjusted.replace(/href="#faq"/g, `href="${relLangRoot}#faq"`);

  // Adjust policy links (All point to /ar/ policies and should be relative)
  const pathToArPolicy = isEn ? '../ar/' : (prefix || './');
  adjusted = adjusted.replace(/href="privacy-policy\.html"/g, `href="${pathToArPolicy}privacy-policy.html"`);
  adjusted = adjusted.replace(/href="terms\.html"/g, `href="${pathToArPolicy}terms.html"`);
  adjusted = adjusted.replace(/href="refund-policy\.html"/g, `href="${pathToArPolicy}refund-policy.html"`);
  adjusted = adjusted.replace(/href="\/ar\/privacy-policy\.html"/g, `href="${pathToArPolicy}privacy-policy.html"`);
  adjusted = adjusted.replace(/href="\/ar\/terms\.html"/g, `href="${pathToArPolicy}terms.html"`);
  adjusted = adjusted.replace(/href="\/ar\/refund-policy\.html"/g, `href="${pathToArPolicy}refund-policy.html"`);

  // Adjust footer area pills
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
    const regexAr = new RegExp(`href="[^"]*"(\\s+class="area-pill"\\s+data-ar="${city.ar}")`, 'g');
    adjusted = adjusted.replace(regexAr, `href="${langPrefix}${city.folder}/"$1`);
    
    const regexEn = new RegExp(`href="[^"]*"(\\s+class="area-pill"\\s+data-en="${city.en}")`, 'g');
    adjusted = adjusted.replace(regexEn, `href="${langPrefix}${city.folder}/"$1`);
  });

  return adjusted;
}

// Assemble final page
function buildPage(pageData, isEn) {
  const depth = pageData.depth + 1; // +1 to account for ar/ or en/ folder
  let prefix = '';
  for (let i = 0; i < depth; i++) {
    prefix += '../';
  }
  const layout = isEn ? enLayout : arLayout;
  
  let head = layout.headContent;
  let header = layout.headerContent;
  let footer = layout.footerContent;

  // Cleanup existing meta title/desc/keywords in layout head
  head = head.replace(/<title[^>]*>[\s\S]*?<\/title>/i, '');
  head = head.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, '');
  head = head.replace(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i, '');
  head = head.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, '');
  head = head.replace(/<link\s+rel="alternate"\s+hreflang="ar"\s+href="[^"]*"\s*\/?>/g, '');
  head = head.replace(/<link\s+rel="alternate"\s+hreflang="en"\s+href="[^"]*"\s*\/?>/g, '');
  head = head.replace(/<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/?>/g, '');
  head = head.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, '');
  head = head.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, '');
  head = head.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, '');
  head = head.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, '');
  head = head.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, '');
  
  // Also clean up any JSON-LD schemas since we will write specific ones
  head = head.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  const cleanedTitle = cleanEmojis(isEn ? pageData.titleEn : pageData.titleAr);
  const cleanedDesc = cleanEmojis(isEn ? pageData.descEn : pageData.descAr);
  const cleanedKeywords = cleanEmojis(isEn ? pageData.keywordsEn : pageData.keywordsAr);

  // Define new head SEO elements
  const canonicalUrl = `https://darbalmaha.com/${isEn ? 'en/' : 'ar/'}${pageData.urlPath}`;
  const arUrl = `https://darbalmaha.com/ar/${pageData.urlPath}`;
  const enUrl = `https://darbalmaha.com/en/${pageData.urlPath}`;

  const headSEO = `
    <title>${cleanedTitle}</title>
    <meta name="description" content="${cleanedDesc}">
    <meta name="keywords" content="${cleanedKeywords}">
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="alternate" hreflang="ar" href="${arUrl}">
    <link rel="alternate" hreflang="en" href="${enUrl}">
    <link rel="alternate" hreflang="x-default" href="${arUrl}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${cleanedTitle}">
    <meta property="og:description" content="${cleanedDesc}">
    <meta name="twitter:title" content="${cleanedTitle}">
    <meta name="twitter:description" content="${cleanedDesc}">
  `;

  head = headSEO + head;

  // Schema generation
  let schemaJSON = '';
  if (pageData.schemaType === 'Service') {
    schemaJSON = {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": isEn ? pageData.titleEn : pageData.titleAr,
      "provider": {
        "@type": "HomeAndConstructionBusiness",
        "name": isEn ? "DarbAlmaha Hospitality & Cleaning" : "درب المها للضيافة والتنظيف",
        "url": isEn ? "https://darbalmaha.com/en/" : "https://darbalmaha.com/ar/"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Qatar"
      },
      "description": cleanedDesc
    };
  } else if (pageData.schemaType === 'Article') {
    schemaJSON = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": isEn ? pageData.titleEn : pageData.titleAr,
      "description": cleanedDesc,
      "author": {
        "@type": "Organization",
        "name": "DarbAlmaha"
      },
      "publisher": {
        "@type": "Organization",
        "name": "DarbAlmaha",
        "logo": {
          "@type": "ImageObject",
          "url": "https://darbalmaha.com/img/logo0.png"
        }
      },
      "mainEntityOfPage": canonicalUrl
    };
  } else {
    schemaJSON = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": isEn ? pageData.titleEn : pageData.titleAr,
      "description": cleanedDesc,
      "publisher": {
        "@type": "Organization",
        "name": "DarbAlmaha"
      }
    };
  }

  head += `\n    <script type="application/ld+json">\n    ${JSON.stringify(schemaJSON, null, 2)}\n    </script>`;

  // Adjust language toggle in header
  const toggleDest = isEn ? `${prefix}ar/${pageData.urlPath}` : `${prefix}en/${pageData.urlPath}`;
  const toggleLabel = isEn ? 'عربي' : 'English';
  
  header = header.replace(
    /<button\s+id="langToggle"[^>]*>.*?<\/button>\s*<a\s+href="[^"]*"\s+class="lang-switch"[^>]*>.*?<\/a>/gi,
    `<button id="langToggle" style="display:none;"></button><a href="${toggleDest}" class="lang-switch"${isEn ? ' style="margin-right: 15px;"' : ''}>${toggleLabel}</a>`
  );

  // Ensure footer contact number click goes to WhatsApp
  footer = forceWhatsApp(footer);
  header = forceWhatsApp(header);

  // Apply paths adjustment
  head = adjustPaths(head, depth, isEn);
  header = adjustPaths(header, depth, isEn);
  footer = adjustPaths(footer, depth, isEn);

  let bodyContent = isEn ? pageData.bodyEn : pageData.bodyAr;
  bodyContent = cleanEmojis(bodyContent);
  bodyContent = forceWhatsApp(bodyContent);

  // Wrap why-us-img in why-us-img-wrapper to ensure perfect orange border alignment
  bodyContent = bodyContent.replace(
    /<div class="why-us-img">\s*([\s\S]*?)\s*<\/div>/g,
    '<div class="why-us-img"><div class="why-us-img-wrapper">$1</div></div>'
  );

  // Replace standard list checkmarks in bodyContent with custom styling or modern SVG to avoid Dingbats block issues
  bodyContent = bodyContent.replace(/<div class="why-list-icon">✓<\/div>/g, `<div class="why-list-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-top:4px;"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`);
  bodyContent = bodyContent.replace(/<li>✓<\/li>/g, `<li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:5px;"><polyline points="20 6 9 17 4 12"></polyline></svg></li>`);

  // Adjust image and href paths inside page body content depending on depth
  bodyContent = adjustPaths(bodyContent, depth, isEn);

  // Assemble the page
  let htmlResult = `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'ar'}" dir="${isEn ? 'ltr' : 'rtl'}">
<head>
${head}
</head>
<body>
${header}

${bodyContent}

${footer}

    <!-- Floating Actions -->
    <div class="floating-actions">
        <a href="https://wa.me/97477170300" target="_blank" rel="noopener noreferrer" class="float-btn float-whatsapp" aria-label="WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
        </a>
        <a href="tel:77170300" class="float-btn float-call" aria-label="Call">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
            </svg>
        </a>
    </div>

    <!-- Noscript Fallback -->
    <noscript>
        <div style="background:#fff3cd; padding:20px; text-align:center; border-top:2px solid #ffc107;">
            <p><strong>شركة درب المها للتنظيف</strong> - خدمة 24/7 في قطر</p>
            <p>اتصل بنا عبر الواتساب: <a href="https://wa.me/97477170300">77170300</a></p>
        </div>
    </noscript>

    <!-- Scripts -->
    <script src="${prefix}js/landing.min.js" defer></script>
    <script src="${prefix}js/tracking.min.js" defer></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            document.getElementById('year').textContent = new Date().getFullYear();
        });
    </script>
</body>
</html>`;

  // Global Emoji Cleanup on the entire page content!
  htmlResult = cleanEmojis(htmlResult);

  return htmlResult;
}

// ---------------- PAGES DATA DEFINITIONS ----------------

const pagesData = [
  // ================= 1. SERVICES HUB =================
  {
    depth: 1,
    urlPath: 'services/',
    titleAr: 'خدمات التنظيف والضيافة في قطر | شركة درب المها',
    titleEn: 'Cleaning & Hospitality Services in Qatar | DarbAlmaha',
    descAr: 'تصفح خدمات شركة درب المها للتنظيفات والضيافة في قطر. نقدم خدمات تنظيف الفلل، الشقق، عاملات بالساعة، غسيل كنب بالبخار، رش ومكافحة حشرات، وتنظيف السيارات والخزانات.',
    descEn: 'Browse DarbAlmaha cleaning and hospitality services in Qatar. We offer villa cleaning, apartment cleaning, hourly maids, steam sofa cleaning, pest control, car deep cleaning, and water tank washing.',
    keywordsAr: 'خدمات تنظيف قطر, خدمات ضيافة قطر, تنظيف منازل قطر, غسيل كنب بالبخار الدوحة, شركة مكافحة حشرات قطر, عاملات بالساعة قطر',
    keywordsEn: 'cleaning services Qatar, hospitality services Qatar, villa cleaning Doha, hourly maids Qatar, steam sofa washing, pest control Qatar',
    schemaType: 'WebPage',
    bodyAr: `
      <!-- Hero Section -->
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>خدماتنا المتميزة في قطر</h1>
                  <p>يا مرحباً بكم في شركة درب المها. نوفر لكم تشكيلة واسعة من خدمات التنظيف والضيافة الراقية لتلبية كافة احتياجاتكم في منازلكم ومكاتبكم ومناسباتكم في شتى أنحاء قطر. نحن ملتزمون بأعلى معايير الإتقان والجودة بدون أي تعقيد وبأسعار تنافسية تناسب الجميع.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">تواصل معنا عبر الواتساب</a>
                  </div>
              </div>
          </div>
      </section>

      <!-- Services Grid -->
      <section class="section-padding bg-light">
          <div class="container">
              <div class="services-grid">
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/1.webp" alt="تنظيف فلل ومنازل بالدوحة">
                      </div>
                      <div class="service-content">
                          <h3>تنظيف الفلل والمنازل</h3>
                          <p>نوفر خدمة التنظيف الشامل والعميق للفلل والقصور والشقق بمواد مرخصة وآلات متطورة تزيل كافة الدهون والأوساخ والغبار.</p>
                          <div class="service-actions">
                              <a href="house-cleaning-doha/" class="service-btn">تفاصيل الخدمة</a>
                              <a href="https://wa.me/97477170300?text=مرحباً،%20أرغب%20في%20طلب%20خدمة%20تنظيف%20الفلل%20والمنازل" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">تواصل مباشر</a>
                          </div>
                      </div>
                  </article>
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/02.webp" alt="عاملات نظافة بالساعة قطر">
                      </div>
                      <div class="service-content">
                          <h3>عاملات بالساعة</h3>
                          <p>عاملات ماهرات ومدربات لمساعدتكم في أعمال المنزل اليومية والغسيل والترتيب بكفاءة وسرعة فائقة.</p>
                          <div class="service-actions">
                              <a href="hourly-maids-qatar/" class="service-btn">تفاصيل الخدمة</a>
                              <a href="https://wa.me/97477170300?text=مرحباً،%20أرغب%20في%20طلب%20خدمة%20عاملات%20بالساعة" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">تواصل مباشر</a>
                          </div>
                      </div>
                  </article>
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/06.webp" alt="غسيل كنب وسجاد بالبخار في الدوحة">
                      </div>
                      <div class="service-content">
                          <h3>غسيل الكنب والسجاد بالبخار</h3>
                          <p>تنظيف وغسيل الكنب والمجالس والديوانيات بأحدث آلات البخار لإزالة أصعب البقع والروائح وتعقيمها بالكامل.</p>
                          <div class="service-actions">
                              <a href="sofa-carpet-cleaning/" class="service-btn">تفاصيل الخدمة</a>
                              <a href="https://wa.me/97477170300?text=مرحباً،%20أرغب%20في%20طلب%20خدمة%20غسيل%20الكنب%20والسجاد" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">تواصل مباشر</a>
                          </div>
                      </div>
                  </article>
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/6.webp" alt="رش ومكافحة الحشرات في قطر">
                      </div>
                      <div class="service-content">
                          <h3>مكافحة ورش الحشرات</h3>
                          <p>رش مبيدات آمنة ومرخصة للتخلص النهائي من الصراصير والنمل وبق الفراش والقوارض مع ضمان حقيقي.</p>
                          <div class="service-actions">
                              <a href="pest-control-qatar/" class="service-btn">تفاصيل الخدمة</a>
                              <a href="https://wa.me/97477170300?text=مرحباً،%20أرغب%20في%20طلب%20خدمة%20مكافحة%20ورش%20الحشرات" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">تواصل مباشر</a>
                          </div>
                      </div>
                  </article>
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/4.webp" alt="غسيل وتعقيم خزانات المياه قطر">
                      </div>
                      <div class="service-content">
                          <h3>تنظيف خزانات المياه</h3>
                          <p>غسيل وتعقيم خزانات المياه السفلية والعلوية لضمان وصول مياه نقية وصحية تماماً لعائلتكم.</p>
                          <div class="service-actions">
                              <a href="water-tank-cleaning/" class="service-btn">تفاصيل الخدمة</a>
                              <a href="https://wa.me/97477170300?text=مرحباً،%20أرغب%20في%20طلب%20خدمة%20تنظيف%20خزانات%20المياه" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">تواصل مباشر</a>
                          </div>
                      </div>
                  </article>
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/clean.webp" alt="تنظيف عميق للسيارات قطر">
                      </div>
                      <div class="service-content">
                          <h3>التنظيف العميق للسيارات</h3>
                          <p>تنظيف وغسيل مقاعد وفرش السيارات وتلميع الطبلون والأبواب من الداخل والخارج لإزالة الأتربة والبقع المتراكمة.</p>
                          <div class="service-actions">
                              <a href="car-deep-cleaning/" class="service-btn">تفاصيل الخدمة</a>
                              <a href="https://wa.me/97477170300?text=مرحباً،%20أرغب%20في%20طلب%20خدمة%20التنظيف%20العميق%20للسيارات" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">تواصل مباشر</a>
                          </div>
                      </div>
                  </article>
              </div>
          </div>
      </section>
    `,
    bodyEn: `
      <!-- Hero Section -->
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Our Premium Services in Qatar</h1>
                  <p>Welcome to DarbAlmaha. We provide a wide range of professional cleaning and hospitality services to meet all your requirements in homes, offices, and events across Qatar. We are committed to high quality, efficiency, and competitive rates.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Contact Us via WhatsApp</a>
                  </div>
              </div>
          </div>
      </section>

      <!-- Services Grid -->
      <section class="section-padding bg-light">
          <div class="container">
              <div class="services-grid">
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/1.webp" alt="Villa & Home Cleaning Doha">
                      </div>
                      <div class="service-content">
                          <h3>Villa & Home Cleaning</h3>
                          <p>Complete deep cleaning for villas, penthouses, and apartments using safe detergents and advanced tools.</p>
                          <div class="service-actions">
                              <a href="house-cleaning-doha/" class="service-btn">Service Details</a>
                              <a href="https://wa.me/97477170300?text=Hello,%20I%20would%20like%20to%20book%20Villa%20and%20Home%20Cleaning%20service" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">WhatsApp Us</a>
                          </div>
                      </div>
                  </article>
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/02.webp" alt="Hourly Maids Qatar">
                      </div>
                      <div class="service-content">
                          <h3>Hourly Maids</h3>
                          <p>Skilled hourly maids to assist you with daily home cleaning, organizing, and laundry tasks with efficiency.</p>
                          <div class="service-actions">
                              <a href="hourly-maids-qatar/" class="service-btn">Service Details</a>
                              <a href="https://wa.me/97477170300?text=Hello,%20I%20would%20like%20to%20book%20Hourly%20Maids%20service" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">WhatsApp Us</a>
                          </div>
                      </div>
                  </article>
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/06.webp" alt="Sofa & Carpet Cleaning Doha">
                      </div>
                      <div class="service-content">
                          <h3>Sofa & Carpet Steam Cleaning</h3>
                          <p>Deep steam cleaning for sofas, majlis, and carpets to remove tough stains, dust mites, and odors.</p>
                          <div class="service-actions">
                              <a href="sofa-carpet-cleaning/" class="service-btn">Service Details</a>
                              <a href="https://wa.me/97477170300?text=Hello,%20I%20would%20like%20to%20book%20Sofa%20and%20Carpet%20Steam%20Cleaning%20service" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">WhatsApp Us</a>
                          </div>
                      </div>
                  </article>
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/6.webp" alt="Pest Control Services Qatar">
                      </div>
                      <div class="service-content">
                          <h3>Pest Control & Spraying</h3>
                          <p>Safe and licensed insecticide spraying to eliminate cockroaches, ants, bed bugs, and rodents.</p>
                          <div class="service-actions">
                              <a href="pest-control-qatar/" class="service-btn">Service Details</a>
                              <a href="https://wa.me/97477170300?text=Hello,%20I%20would%20like%20to%20book%20Pest%20Control%20and%20Spraying%20service" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">WhatsApp Us</a>
                          </div>
                      </div>
                  </article>
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/4.webp" alt="Water Tank Cleaning Qatar">
                      </div>
                      <div class="service-content">
                          <h3>Water Tank Washing</h3>
                          <p>Washing and sanitizing water tanks with safe materials to ensure pure, contaminant-free water.</p>
                          <div class="service-actions">
                              <a href="water-tank-cleaning/" class="service-btn">Service Details</a>
                              <a href="https://wa.me/97477170300?text=Hello,%20I%20would%20like%20to%20book%20Water%20Tank%20Washing%20service" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">WhatsApp Us</a>
                          </div>
                      </div>
                  </article>
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/clean.webp" alt="Car Deep Cleaning Qatar">
                      </div>
                      <div class="service-content">
                          <h3>Car Deep Cleaning</h3>
                          <p>Detailed cleaning for car seats, carpets, dashboard, and doors to restore your vehicle interior cleanliness.</p>
                          <div class="service-actions">
                              <a href="car-deep-cleaning/" class="service-btn">Service Details</a>
                              <a href="https://wa.me/97477170300?text=Hello,%20I%20would%20like%20to%20book%20Car%20Deep%20Cleaning%20service" target="_blank" rel="noopener noreferrer" class="service-whatsapp-btn">WhatsApp Us</a>
                          </div>
                      </div>
                  </article>
              </div>
          </div>
      </section>
    `
  },

  // ================= 2. SERVICE PAGES =================
  // A. House Cleaning
  {
    depth: 2,
    urlPath: 'services/house-cleaning-doha/',
    titleAr: 'شركة تنظيف منازل وفلل بالدوحة | درب المها للتنظيفات',
    titleEn: 'Villa & House Cleaning Services Doha | DarbAlmaha',
    descAr: 'خدمات تنظيف منازل وفلل بالدوحة من شركة درب المها. تنظيف عميق وجلي للأرضيات وتطهير كامل للغرف والمطابخ بأيدي عمالة خبيرة ومواد آمنة وصديقة للبيئة.',
    descEn: 'Villa and home deep cleaning services in Doha by DarbAlmaha. Comprehensive cleaning for rooms, kitchens, and bathrooms using safe materials and advanced tools.',
    keywordsAr: 'شركة تنظيف منازل بالدوحة, تنظيف فلل الدوحة, ديب كلين قطر, شركات تنظيف البيوت في الدوحة, جلي وتلميع رخام',
    keywordsEn: 'home cleaning Doha, villa cleaning Doha, deep cleaning Qatar, house cleaning services Doha, apartment cleaning',
    schemaType: 'Service',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>تنظيف المنازل والفلل بالدوحة</h1>
                  <p>نقدم لكم خدمات تنظيف الفلل والبيوت السكنية في الدوحة بأعلى درجات الاحترافية والإتقان. نتولى تنظيف وتطهير كافة أركان المنزل لتنعموا ببيئة صحية ومريحة تليق بكم وبمجالسكم.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">حجز موعد عبر الواتساب</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>خدمة تنظيف الفلل والبيوت الشاملة في قطر</h2>
                      <p>منازلكم وفللكم هي عنوان راحتكم واستقبال ضيوفكم، ولأن المناخ في الدوحة يتسم بالغبار والأتربة المستمرة، فإننا نوفر فريقاً متخصصاً ومدرباً بالكامل للقيام بعمليات التنظيف العميق (الديب كلين). نحن لا نترك ركناً إلا ونظفناه بعناية فائقة.</p>
                      
                      <p>تشمل خدماتنا لتنظيف المنازل والفلل:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>تنظيف الغرف والمجالس</h3>
                                  <p>تنفض الغبار عن النوافذ والستائر والأسقف، وتنظف وتلمع الأرضيات الخشبية والرخامية.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>تطهير وتعقيم المطابخ</h3>
                                  <p>إزالة بقع الدهون المتراكمة على الجدران والأسطح والأفران باستخدام مواد إذابة قوية وآمنة.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>غسيل وتعقيم الحمامات</h3>
                                  <p>تنظيف وتطهير شامل لجميع الخلاطات والبورسلين والسيراميك مع إزالة الترسبات الكلسية.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/1.webp" alt="تنظيف فلل وشقق بالدوحة">
                  </div>
              </div>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Villa & House Cleaning Services Doha</h1>
                  <p>Professional home and villa cleaning services in Doha with high standards. We take care of every corner of your home to provide a clean and healthy environment for your family.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Book via WhatsApp</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>Comprehensive Home & Villa Cleaning</h2>
                      <p>Your home is your sanctuary. Due to dust and weather conditions in Qatar, maintaining cleanliness requires regular professional deep cleaning. Our experienced team uses advanced tools and safe detergents to clean your property from top to bottom.</p>
                      
                      <p>Our home cleaning services include:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Living Rooms & Majlis Cleaning</h3>
                                  <p>Dusting walls, polishing windows, vacuuming curtains, and deep cleaning all marble and tiled floors.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Kitchen Degreasing & Sanitization</h3>
                                  <p>Removing stubborn grease stains from walls, cabinets, counter tops, and home appliances safely.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Bathroom Deep Disinfection</h3>
                                  <p>Scrubbing tiles, sanitizing sinks, toilets, and showers, and removing scale build-up.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/1.webp" alt="Villa cleaning Doha">
                  </div>
              </div>
          </div>
      </section>
    `
  },
  // B. Hourly Maids
  {
    depth: 2,
    urlPath: 'services/hourly-maids-qatar/',
    titleAr: 'عاملات بالساعة في قطر | خادمات نظافة ماهرات | درب المها',
    titleEn: 'Hourly Maids Services Qatar | Professional Cleaning Ladies',
    descAr: 'نوفر أفضل عاملات نظافة بالساعة في قطر. عاملات ماهرات وموثوقات للقيام بكافة أعمال الترتيب والتنظيف اليومي والغسيل بكفاءة وأمانة عالية لتوفير وقتكم.',
    descEn: 'Find reliable and professional hourly maids in Qatar. Our cleaning maids handle home cleaning, laundry, and kitchen arrangement with high efficiency and trust.',
    keywordsAr: 'عاملات بالساعة قطر, خادمات بالساعة في قطر, عاملات نظافة فلبينيات, خادمات نظافة بالساعة الدوحة, عمالة منزلية بالساعة',
    keywordsEn: 'hourly maids Qatar, maids in Qatar hourly, hourly cleaning ladies Doha, Filipino maids hourly, domestic help Qatar',
    schemaType: 'Service',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>عاملات بالساعة في قطر</h1>
                  <p>نوفر لكم أفضل عاملات النظافة بنظام الساعة في الدوحة ومختلف مناطق قطر. عمالة خبيرة بالأعمال المنزلية والترتيب لتنظيف وتنسيق منازلكم بمرونة تامة تناسب جدولكم اليومي.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">اطلب عاملة الآن عبر الواتساب</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>لماذا تختار عاملات بالساعة من درب المها؟</h2>
                      <p>الحصول على مساعدة منزلية موثوقة لم يعد أمراً معقداً. في درب المها، نقوم بفحص وتدريب جميع العاملات لضمان التزامهن بالأمانة والمهنية وحسن المعاملة، وتلبية رغباتكم في تنظيف وترتيب المنازل بكفاءة.</p>
                      
                      <p>مميزات خدمتنا للعاملات بالساعة:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>مرونة في المواعيد والوقت</h3>
                                  <p>يمكنك حجز الخدمة للساعات التي تناسبك وخلال الأوقات التي تختارها لتنظيم منزلك بمرونة تامة.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>إتقان المهام المنزلية المتنوعة</h3>
                                  <p>تشمل مهام العاملة كنس وتنظيف الغرف، ترتيب المطبخ، غسيل الصحون، وغسيل وكي الملابس.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>كادر مدرب وموثوق</h3>
                                  <p>عاملات نظافة ذوات خبرة طويلة في التعامل مع الفلل والشقق الحديثة والأثاث الحساس بكل حرص.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/02.webp" alt="عاملات نظافة بالساعة قطر">
                  </div>
              </div>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Hourly Maids Services in Qatar</h1>
                  <p>We provide the best hourly cleaning ladies in Doha and across Qatar. Well-trained, professional, and reliable maids to handle your daily housekeeping chores with absolute flexibility.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Request a Maid via WhatsApp</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>Why Choose Hourly Maids from DarbAlmaha?</h2>
                      <p>Finding trusted domestic help is simple with DarbAlmaha. We screen, background-check, and train all our cleaning maids to ensure high standards of honesty, efficiency, and attention to detail.</p>
                      
                      <p>Our hourly maid service highlights:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Complete Scheduling Flexibility</h3>
                                  <p>Book maids for specific hours that match your daily schedule, with easy rescheduling options.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Diverse Domestic Duties</h3>
                                  <p>Our maids can handle sweeping, vacuuming, kitchen organizing, dishwashing, laundry, and ironing.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Highly Trained & Insured Maids</h3>
                                  <p>Experienced maids who know how to handle modern home appliances and premium materials safely.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/02.webp" alt="Hourly maids Qatar">
                  </div>
              </div>
          </div>
      </section>
    `
  },
  // C. Sofa & Carpet Cleaning
  {
    depth: 2,
    urlPath: 'services/sofa-carpet-cleaning/',
    titleAr: 'غسيل كنب وسجاد بالبخار في قطر | تنظيف مجالس | درب المها',
    titleEn: 'Sofa & Carpet Steam Cleaning Doha | Majlis Washing Qatar',
    descAr: 'خدمات غسيل وتنظيف كنب، سجاد، ومجالس بالبخار في قطر من شركة درب المها. إزالة أصعب البقع والروائح الكريهة وتعقيم المفروشات بأجهزة إيطالية حديثة وسريعة الجفاف.',
    descEn: 'Professional steam cleaning for sofas, carpets, and majlis in Doha by DarbAlmaha. Remove tough stains, allergens, and odors from upholstery with fast drying.',
    keywordsAr: 'غسيل كنب بالبخار قطر, تنظيف مجالس الدوحة, غسيل سجاد قطر, تنظيف كنب بالبخار في قطر, غسيل موكيت الدوحة, تعقيم مفروشات',
    keywordsEn: 'sofa cleaning Qatar, carpet cleaning Doha, majlis cleaning Qatar, steam cleaning sofa, carpet washing Doha, upholstery cleaning',
    schemaType: 'Service',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>غسيل الكنب والسجاد والمجالس بالبخار</h1>
                  <p>نعيد لفرش مجالسكم وديوانياتكم رونقها ونظافتها الأصلية. نوفر خدمات غسيل الكنب والسجاد بالبخار والتعقيم الفعال للتخلص من البقع والروائح الكريهة وأتربة الرطوبة والرمال.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">احجز موعد التنظيف عبر الواتساب</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>تنظيف عميق للمفروشات والكنب والديوانيات بالبخار</h2>
                      <p>المجالس والكنب هي واجهة البيت ومقر تجمع الأهل والضيوف في قطر، ولأنها معرضة للبقع والشراب والغبار بشكل مستمر، فإن التنظيف العادي لا يكفي لإزالة الأوساخ المتغلغلة. نحن في درب المها نستخدم مكائن استخراج البخار المتطورة التي تصل إلى أعماق الأنسجة.</p>
                      
                      <p>خطوات تنظيف المفروشات لدينا:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>شفط الأتربة المجهرية</h3>
                                  <p>استخدام مكانس شفط قوية لإزالة ذرات الغبار وحبات الرمل العالقة بين ثنايا الكنب والسجاد.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>معالجة البقع العنيدة</h3>
                                  <p>تطبيق مواد إذابة وإزالة البقع مثل الشاي والقهوة والشوكولاتة والزيوت بطرق تحافظ على ألوان الأقمشة.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>غسيل وتجفيف بالبخار الحار</h3>
                                  <p>حقن البخار الساخن المعقم واستخراجه مباشرة للتخلص من عث الغبار والبكتيريا لسرعة جفاف الفرش.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/06.webp" alt="غسيل كنب وسجاد بالبخار قطر">
                  </div>
              </div>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Sofa, Carpet & Majlis Steam Cleaning</h1>
                  <p>Restore the freshness and hygiene of your home upholstery. We provide deep steam cleaning for sofas, carpets, rugs, and traditional majlis seating to remove tough stains, dust mites, and odors.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Book Sofa Cleaning via WhatsApp</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>Deep Steam Extraction for Sofas & Rugs</h2>
                      <p>Sofas and carpets in Qatar accumulate dust and humidity, leading to stains and unpleasant smells over time. Standard vacuuming is not enough. DarbAlmaha uses specialized hot steam extraction technology to deep clean and sanitize fabrics without damage.</p>
                      
                      <p>Our upholstery cleaning process includes:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Deep Vacuuming & Dust Extraction</h3>
                                  <p>Removing hidden dust particles, sand grains, and pet hair from fabric crevices before washing.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Targeted Stain Pre-treatment</h3>
                                  <p>Treating coffee, food, ink, and pet stains with fabric-safe solutions to lift spots completely.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Hot Steam Injection & Recovery</h3>
                                  <p>Sanitizing fabric with pressurized steam to kill bacteria and extracting moisture for rapid drying.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/06.webp" alt="Sofa steam cleaning Doha">
                  </div>
              </div>
          </div>
      </section>
    `
  },
  // D. Pest Control
  {
    depth: 2,
    urlPath: 'services/pest-control-qatar/',
    titleAr: 'شركة مكافحة حشرات في قطر | رش صراصير ونمل | درب المها',
    titleEn: 'Pest Control Services Qatar | Safe Insecticide Spraying',
    descAr: 'خدمات رش ومكافحة حشرات وقوارض في قطر من شركة درب المها. نقضي على الصراصير، النمل، بق الفراش، والفئران بمواد آمنة ومرخصة ومعتمدة من بلدية قطر بضمان تام.',
    descEn: 'Professional pest control services in Qatar by DarbAlmaha. Safe and licensed spraying to eliminate cockroaches, bed bugs, ants, termites, and rodents with a guarantee.',
    keywordsAr: 'مكافحة حشرات قطر, رش حشرات الدوحة, مكافحة صراصير في قطر, رش بق الفراش قطر, مكافحة قوارض وفئران, شركة مبيدات حشرية',
    keywordsEn: 'pest control Qatar, insecticide spraying Doha, cockroach control Qatar, bed bug treatment Doha, rodent control',
    schemaType: 'Service',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>رش ومكافحة الحشرات والقوارض في قطر</h1>
                  <p>نخلصكم نهائياً من الحشرات المزعجة والآفات التي تؤثر على راحة وصحة عائلتكم. نوفر خدمات رش ومكافحة الحشرات المنزلية بمواد آمنة ومرخصة ومعتمدة في دولة قطر بضمان حقيقي.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">اطلب خدمة رش الحشرات عبر الواتساب</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>مكافحة الحشرات المنزلية والآفات بضمان وجودة عالية</h2>
                      <p>تنشط الصراصير والنمل والقوارض في فترات الصيف الحار في قطر، وتتسلل إلى الفلل والمطابخ والحدائق الخارجية مسببة قلقاً كبيراً. نحن في شركة درب المها نتبع منهجاً علمياً آمناً للقضاء التام على أعشاش الحشرات وضمان عدم عودتها مرة أخرى.</p>
                      
                      <p>مميزات خدمات مكافحة الحشرات لدينا:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>مبيدات آمنة ومرخصة للبيئة</h3>
                                  <p>نستخدم مبيدات حشرية ألمانية وإيطالية مصرح بها من وزارة البلدية والبيئة في قطر، آمنة تماماً للأطفال والحيوانات الأليفة.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>تغطية كافة أنواع الآفات</h3>
                                  <p>مكافحة شاملة للصراصير، النمل الأسود، النمل الأبيض (الرمة)، بق الفراش، الذباب، البعوض، والفئران والقوارض.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>ضمان حقيقي للمتابعة</h3>
                                  <p>نقدم ضماناً يبدأ من ثلاثة أشهر إلى سنة لضمان خلو منزلك تماماً من الحشرات وإعادة الرش مجاناً إن تطلب الأمر.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/6.webp" alt="مكافحة ورش حشرات قطر">
                  </div>
              </div>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Pest Control & Insecticide Spraying Qatar</h1>
                  <p>Protect your home and family from disturbing pests and rodents. We provide professional pest control and disinfection services in Qatar using approved, family-safe materials with solid guarantees.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Request Pest Control via WhatsApp</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>Safe & Certified Domestic Pest Eradication</h2>
                      <p>Summer heat in Qatar increases the activity of crawling and flying insects like cockroaches, ants, bed bugs, and termites. Our team uses certified, eco-friendly insecticide formulations to locate breeding sites and eliminate pests permanently.</p>
                      
                      <p>Key highlights of our pest control service:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Eco-friendly & Approved Insecticides</h3>
                                  <p>We only use high-grade products authorized by the Ministry of Municipality in Qatar, certified safe for humans and pets.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Comprehensive Target Pests</h3>
                                  <p>Effective elimination of cockroaches, ants, bed bugs, termites, fleas, ticks, mice, and rats.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Satisfaction Guarantee & Warranty</h3>
                                  <p>We provide a reliable warranty period; if pests reappear within the warranty time, we re-treat for free.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/6.webp" alt="Pest control Qatar">
                  </div>
              </div>
          </div>
      </section>
    `
  },
  // E. Water Tank Cleaning
  {
    depth: 2,
    urlPath: 'services/water-tank-cleaning/',
    titleAr: 'شركة تنظيف خزانات مياه في قطر | تعقيم الخزانات | درب المها',
    titleEn: 'Water Tank Cleaning Services Qatar | Tank Disinfection',
    descAr: 'خدمات غسيل وتعقيم خزانات المياه بالدوحة وقطر من شركة درب المها. نضمن لكم مياهاً نقية وصحية خالية من الشوائب والترسبات بمواد تعقيم آمنة ومعتمدة.',
    descEn: 'Water tank washing and sanitizing services in Qatar by DarbAlmaha. We clean and disinfect residential water tanks using approved sanitizers to keep water clean.',
    keywordsAr: 'تنظيف خزانات مياه قطر, غسيل خزان مياه الدوحة, تعقيم خزانات المياه, طحالب خزانات المياه, مياه صحية قطر',
    keywordsEn: 'water tank cleaning guide, clean water storage, tank washing steps, sanitize water tank Doha, tank contamination signs',
    schemaType: 'Service',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>تنظيف وتعقيم خزانات المياه</h1>
                  <p>نحافظ على سلامة وصحة مياه الشرب والاستخدام في بيوتكم. نوفر خدمات غسيل وتعقيم خزانات المياه العلوية والسفلية بمواد مرخصة وآمنة تماماً تزيل الشوائب والأوساخ العالقة.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">اطلب تنظيف الخزان عبر الواتساب</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>أهمية غسيل وتعقيم خزانات المياه دورياً في قطر</h2>
                      <p>بسبب ارتفاع درجات الحرارة وتخزين المياه لفترات طويلة، تتراكم الأتربة الناعمة والشوائب والصدأ في قاع الخزانات، مما يمثل بيئة خصبة للبكتيريا والطحالب. ننصح في درب المها بغسيل الخزانات مرتين سنوياً على الأقل لضمان مياه نقية خالية من الشوائب.</p>
                      
                      <p>خطوات تنظيف الخزانات لدينا:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>تفريغ وتصريف المياه</h3>
                                  <p>نقوم بسحب وتصريف مياه الخزان للبدء بعمليات الكشط والتنظيف الداخلي للجدران والأرضية.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>فرك وإزالة الرواسب والطحالب</h3>
                                  <p>فرك الجدران لإزالة الطبقات الطينية المترسبة والطحالب والشوائب العالقة يدوياً وبالآلات.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>التعقيم بالكلور والمواد المعتمدة</h3>
                                  <p>شطف الخزان جيداً وتطبيق مواد تعقيم آمنة تقضي على الميكروبات تماماً وتضمن سلامة المياه للاستخدام.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/4.webp" alt="تنظيف وتعقيم خزانات مياه قطر">
                  </div>
              </div>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Water Tank Washing & Disinfection Services</h1>
                  <p>Keep your domestic water supply clean and free of germs. We wash, scrub, and sanitize underground and roof water tanks using food-grade disinfectants to ensure pure water storage.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Book Tank Cleaning via WhatsApp</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>Why Regular Water Tank Cleaning is Crucial in Qatar</h2>
                      <p>High outdoor temperatures combined with static water storage can cause fine dust, mud, rust, and algae to settle at the bottom of your water tanks. This compromises water hygiene. We recommend professional tank washing at least once every 6 months to maintain health standards.</p>
                      
                      <p>Our water tank cleaning protocol:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Complete Water Drainage</h3>
                                  <p>We drain the stored water from the tank to access all internal walls and floor surfaces safely.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Mechanical Scrubbing & Mud Removal</h3>
                                  <p>Scrubbing internal surfaces to clean slime, algae spots, mud sediments, and scale residues.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Sanitization & final Rinsing</h3>
                                  <p>Applying safe chlorine sanitizers to kill micro-organisms, rinsing the tank fully, and refilling with clean water.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/4.webp" alt="Water tank cleaning Qatar">
                  </div>
              </div>
          </div>
      </section>
    `
  },
  // F. Car Deep Cleaning
  {
    depth: 2,
    urlPath: 'services/car-deep-cleaning/',
    titleAr: 'تنظيف عميق للسيارات في قطر | غسيل سيارات متنقل | درب المها',
    titleEn: 'Car Deep Cleaning Services Qatar | Mobile Car Wash Doha',
    descAr: 'خدمات التنظيف العميق للسيارات بالدوحة وقطر من شركة درب المها. تنظيف المقاعد، الأرضيات، إزالة البقع والروائح، وتلميع داخلية السيارة بأحدث المواد المخصصة.',
    descEn: 'Detailed interior car deep cleaning services in Qatar by DarbAlmaha. Wash car seats, vacuum carpets, remove stains, sanitize dashboards, and refresh vehicle interiors.',
    keywordsAr: 'تنظيف عميق للسيارات قطر, غسيل سيارات متنقل الدوحة, ديب كلين سيارات, تلميع سيارات داخلي, غسيل فرش سيارات بالبخار',
    keywordsEn: 'car deep cleaning Qatar, mobile car wash Doha, interior car detailing Qatar, steam car cleaning, seat washing Doha',
    schemaType: 'Service',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>التنظيف العميق للسيارات من الداخل</h1>
                  <p>نعيد لسيارتكم رونقها ورائحتها المنعشة كأنها جديدة. نوفر خدمة التنظيف العميق لداخلية السيارات وإزالة البقع العنيدة عن المراتب الجلدية والمخملية وتلميع الأبواب والطبلون بدقة عالية.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">اطلب تنظيف سيارتك عبر الواتساب</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>التنظيف العميق والتلميع الداخلي المتكامل للسيارات</h2>
                      <p>سياراتكم تتعرض يومياً للأتربة والبقع الناتجة عن المأكولات والمشروبات، إلى جانب روائح الرطوبة التي تعلق بفرش المقاعد والأرضيات. نحن في درب المها نوفر خدمة ديب كلين تفصيلية تشمل تنظيف وتطهير السيارة بالكامل من الداخل باستخدام مواد إيطالية مخصصة للسيارات.</p>
                      
                      <p>ما تشمله خدمة تنظيف السيارات:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>غسيل وتلميع المقاعد والأرضيات</h3>
                                  <p>غسيل مراتب السيارة (مخمل أو جلد) بمواد مخصصة تزيل البقع المستعصية والروائح الكريهة مع التعقيم.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>تنظيف الطبلون وفتحات التكييف</h3>
                                  <p>إزالة الغبار الدقيق من فتحات التكييف والأزرار وتلميع الطبلون والأبواب بمواد تحميه من التشقق بسبب الحرارة.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>تعطير وتعقيم شامل</h3>
                                  <p>تعقيم مقصورة السيارة بالكامل للقضاء على الجراثيم وتعطيرها بعبق منعش يدوم طويلاً.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/clean.webp" alt="تنظيف وتلميع سيارات بالدوحة">
                  </div>
              </div>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Interior Car Deep Cleaning Services</h1>
                  <p>Restore the showroom look and freshness of your vehicle. We offer high-quality interior car detailing and deep cleaning to wash seats, shampoo carpets, remove stains, and polish dashboard surfaces.</p>
                  <div class="hero-btns">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Book Car Cleaning via WhatsApp</a>
                  </div>
              </div>
          </div>
      </section>

      <section class="section-padding">
          <div class="container">
              <div class="why-us-container">
                  <div class="why-us-content">
                      <h2>Premium Interior Car Detailing & Cleaning</h2>
                      <p>With daily use, car interiors accumulate dust, food crumbs, and stains on fabric or leather seats, often accompanied by musty air conditioning odors. DarbAlmaha offers detailed deep cleaning solutions for car interiors to revitalize your ride using high-grade automotive care products.</p>
                      
                      <p>Our car detailing service includes:</p>
                      <ul class="why-list">
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Seat Washing & Carpet Shampooing</h3>
                                  <p>Shampooing and steam cleaning fabric seats or conditioning leather seats, and deep washing foot carpets.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Dashboard, Console & AC Vents Sanitization</h3>
                                  <p>Clearing dust from air vents, buttons, and dials, and conditioning dashboard vinyl against sun damage.</p>
                              </div>
                          </li>
                          <li>
                              <div class="why-list-icon">✓</div>
                              <div class="why-list-text">
                                  <h3>Odors Elimination & Deodorization</h3>
                                  <p>Sanitizing the entire cabin to kill germs and applying premium scents for a fresh, welcoming ride.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="why-us-img">
                      <img src="img/clean.webp" alt="Car detailing Doha">
                  </div>
              </div>
          </div>
      </section>
    `
  },

  // ================= 3. BOOKING PAGE =================
  {
    depth: 1,
    urlPath: 'booking/',
    titleAr: 'حجز موعد خدمة تنظيف وضيافة | شركة درب المها قطر',
    titleEn: 'Book Cleaning & Hospitality Service | DarbAlmaha Qatar',
    descAr: 'احجز موعد خدمة تنظيف منازل، عاملات بالساعة، غسيل كنب بالبخار، أو مكافحة حشرات في قطر بسهولة وسرعة. تواصل معنا لتأكيد حجزك الفوري.',
    descEn: 'Book your home cleaning, hourly maids, sofa washing, or pest control service online in Qatar. Fast booking confirmation and flexible scheduling options.',
    keywordsAr: 'حجز خدمة تنظيف قطر, طلب عاملات بالساعة, حجز غسيل كنب بالبخار, شركة تنظيف الدوحة حجز موعد',
    keywordsEn: 'book cleaning service Qatar, request hourly maid Doha, book sofa washing, cleaning booking online',
    schemaType: 'WebPage',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>طلب وحجز الخدمات الفوري</h1>
                  <p>يا مرحباً بكم. يرجى ملء النموذج أدناه لاختيار الخدمات والمواعيد المناسبة لكم، وسيقوم فريق خدمة العملاء بالتواصل معكم فوراً وتأكيد الحجز وتنسيق التفاصيل عبر الواتساب لتوفير وقتكم.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 600px;">
              <div style="background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <form id="bookingForm" onsubmit="handleBooking(event)">
                      <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 8px; font-weight: 600;">الاسم الكريم</label>
                          <input type="text" id="bookingName" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;" placeholder="أدخل اسمك الكريم">
                      </div>
                      <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 8px; font-weight: 600;">رقم الهاتف الجوال</label>
                          <input type="tel" id="bookingPhone" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;" placeholder="مثال: 77170300">
                      </div>
                      <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 8px; font-weight: 600;">الخدمة المطلوبة</label>
                          <select id="bookingService" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                              <option value="تنظيف منازل وفلل">تنظيف منازل وفلل</option>
                              <option value="عاملات بالساعة">عاملات بالساعة</option>
                              <option value="غسيل كنب ومجالس بالبخار">غسيل كنب ومجالس بالبخار</option>
                              <option value="رش ومكافحة حشرات">رش ومكافحة حشرات</option>
                              <option value="تنظيف خزانات مياه">تنظيف خزانات مياه</option>
                              <option value="تنظيف عميق للسيارات">تنظيف عميق للسيارات</option>
                              <option value="خدمة ضيافة للمناسبات">خدمة ضيافة للمناسبات</option>
                          </select>
                      </div>
                      <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 8px; font-weight: 600;">المنطقة في قطر</label>
                          <select id="bookingRegion" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                              <option value="الدوحة">الدوحة</option>
                              <option value="الريان">الريان</option>
                              <option value="الوكرة">الوكرة</option>
                              <option value="لوسيل">لوسيل</option>
                              <option value="الخور">الخور</option>
                              <option value="أم صلال">أم صلال</option>
                              <option value="الغرافة">الغرافة</option>
                              <option value="اللؤلؤة">اللؤلؤة</option>
                              <option value="منطقة أخرى">منطقة أخرى</option>
                          </select>
                      </div>
                      <div style="margin-bottom: 20px; display: flex; gap: 15px;">
                          <div style="flex: 1;">
                              <label style="display: block; margin-bottom: 8px; font-weight: 600;">تاريخ الخدمة</label>
                              <input type="date" id="bookingDate" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                          </div>
                          <div style="flex: 1;">
                              <label style="display: block; margin-bottom: 8px; font-weight: 600;">الوقت المفضل</label>
                              <input type="time" id="bookingTime" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                          </div>
                      </div>
                      <div style="margin-bottom: 25px;">
                          <label style="display: block; margin-bottom: 8px; font-weight: 600;">ملاحظات أو متطلبات خاصة</label>
                          <textarea id="bookingNotes" rows="3" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;" placeholder="أدخل أي تفاصيل إضافية"></textarea>
                      </div>
                      <button type="submit" class="btn btn-primary" style="width: 100%; border: none; cursor: pointer; font-size: 1.1rem; padding: 14px;">إرسال طلب الحجز وتأكيده عبر الواتساب</button>
                  </form>
              </div>
          </div>
      </section>

      <script>
          function handleBooking(event) {
              event.preventDefault();
              const name = document.getElementById('bookingName').value;
              const phone = document.getElementById('bookingPhone').value;
              const service = document.getElementById('bookingService').value;
              const region = document.getElementById('bookingRegion').value;
              const date = document.getElementById('bookingDate').value;
              const time = document.getElementById('bookingTime').value;
              const notes = document.getElementById('bookingNotes').value;

              const text = 'مرحباً شركة درب المها، أود تأكيد حجز خدمة تنظيف من خلال الموقع الإلكتروني. التفاصيل كالتالي:\\n\\n' +
                           '* الاسم: ' + name + '\\n' +
                           '* الجوال: ' + phone + '\\n' +
                           '* الخدمة: ' + service + '\\n' +
                           '* المنطقة: ' + region + '\\n' +
                           '* التاريخ: ' + date + '\\n' +
                           '* الوقت: ' + time + '\\n' +
                           '* ملاحظات: ' + notes;

              const url = 'https://wa.me/97477170300?text=' + encodeURIComponent(text);
              window.open(url, '_blank');
          }
      </script>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Instant Service Booking</h1>
                  <p>Please fill out the form below to select your desired services and scheduling. Our customer service team will contact you shortly to confirm details and pricing estimate via WhatsApp.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 600px;">
              <div style="background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <form id="bookingFormEn" onsubmit="handleBookingEn(event)">
                      <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Your Name</label>
                          <input type="text" id="bookingNameEn" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;" placeholder="Enter your full name">
                      </div>
                      <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Phone Number</label>
                          <input type="tel" id="bookingPhoneEn" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;" placeholder="e.g. 77170300">
                      </div>
                      <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Required Service</label>
                          <select id="bookingServiceEn" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                              <option value="Villa & Home Cleaning">Villa & Home Cleaning</option>
                              <option value="Hourly Maids">Hourly Maids</option>
                              <option value="Sofa & Carpet Steam Cleaning">Sofa & Carpet Steam Cleaning</option>
                              <option value="Pest Control & Spraying">Pest Control & Spraying</option>
                              <option value="Water Tank Cleaning">Water Tank Cleaning</option>
                              <option value="Car Deep Cleaning">Car Deep Cleaning</option>
                              <option value="Event Hospitality Staff">Event Hospitality Staff</option>
                          </select>
                      </div>
                      <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Service Area</label>
                          <select id="bookingRegionEn" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                              <option value="Doha">Doha</option>
                              <option value="Al Rayyan">Al Rayyan</option>
                              <option value="Al Wakrah">Al Wakrah</option>
                              <option value="Lusail">Lusail</option>
                              <option value="Al Khor">Al Khor</option>
                              <option value="Umm Salal">Umm Salal</option>
                              <option value="Al Gharafa">Al Gharafa</option>
                              <option value="The Pearl">The Pearl</option>
                              <option value="Other Area">Other Area</option>
                          </select>
                      </div>
                      <div style="margin-bottom: 20px; display: flex; gap: 15px;">
                          <div style="flex: 1;">
                              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Preferred Date</label>
                              <input type="date" id="bookingDateEn" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                          </div>
                          <div style="flex: 1;">
                              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Preferred Time</label>
                              <input type="time" id="bookingTimeEn" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                          </div>
                      </div>
                      <div style="margin-bottom: 25px;">
                          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Special Instructions</label>
                          <textarea id="bookingNotesEn" rows="3" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;" placeholder="Any extra details..."></textarea>
                      </div>
                      <button type="submit" class="btn btn-primary" style="width: 100%; border: none; cursor: pointer; font-size: 1.1rem; padding: 14px;">Submit Booking via WhatsApp</button>
                  </form>
              </div>
          </div>
      </section>

      <script>
          function handleBookingEn(event) {
              event.preventDefault();
              const name = document.getElementById('bookingNameEn').value;
              const phone = document.getElementById('bookingPhoneEn').value;
              const service = document.getElementById('bookingServiceEn').value;
              const region = document.getElementById('bookingRegionEn').value;
              const date = document.getElementById('bookingDateEn').value;
              const time = document.getElementById('bookingTimeEn').value;
              const notes = document.getElementById('bookingNotesEn').value;

              const text = 'Hello DarbAlmaha, I would like to book a service via the website. Details:\\n\\n' +
                           '* Name: ' + name + '\\n' +
                           '* Phone: ' + phone + '\\n' +
                           '* Service: ' + service + '\\n' +
                           '* Region: ' + region + '\\n' +
                           '* Date: ' + date + '\\n' +
                           '* Time: ' + time + '\\n' +
                           '* Notes: ' + notes;

              const url = 'https://wa.me/97477170300?text=' + encodeURIComponent(text);
              window.open(url, '_blank');
          }
      </script>
    `
  },

  // ================= 4. PRICING PAGE =================
  {
    depth: 1,
    urlPath: 'pricing/',
    titleAr: 'أسعار باقات التنظيف والضيافة في قطر | درب المها',
    titleEn: 'Cleaning & Hospitality Service Packages Rates | DarbAlmaha',
    descAr: 'تعرف على تفاصيل باقات الخدمات المتميزة في شركة درب المها للتنظيف والضيافة. نوفر باقات مرنة لتنظيف الفلل، عروض عاملات بالساعة، وغسيل الكنب بالبخار بأسعار مناسبة.',
    descEn: 'Discover cleaning and hospitality service package details at DarbAlmaha. Flexible rates, customized packages, and cost-effective home cleaning services in Qatar.',
    keywordsAr: 'أسعار شركات التنظيف قطر, تكلفة تنظيف الفلل في الدوحة, عروض عاملات بالساعة, أسعار غسيل الكنب بالبخار',
    keywordsEn: 'cleaning rates Qatar, villa cleaning cost Doha, hourly maids package rates, steam cleaning pricing',
    schemaType: 'WebPage',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>أسعار باقات الخدمات</h1>
                  <p>نحرص في شركة درب المها على تقديم باقات خدمات مرنة واقتصادية تناسب متطلباتكم بأسعار عادلة وتنافسية، مع التركيز على تسليم أعلى مستويات الجودة والإتقان دون مبالغة في الكلفة.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container">
              <div class="services-grid">
                  <article class="service-card" style="text-align: center; padding: 30px;">
                      <h3>باقة عاملات بالساعة</h3>
                      <p style="color: #666; margin-bottom: 20px;">مثالية للتنظيف اليومي المعتاد والترتيب والغسيل والكي.</p>
                      <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; line-height: 2;">
                          <li>عمالة فلبينية ماهرة وأمينة</li>
                          <li>أوقات حجز مرنة تناسبكم</li>
                          <li>مساعدة متكاملة في الترتيب والغسيل</li>
                          <li>تغطية شاملة لكافة مناطق الدوحة</li>
                      </ul>
                      <a href="https://wa.me/97477170300?text=مرحباً،%20أرغب%20بالاستفسار%20عن%20أسعار%20باقة%20العاملات%20بالساعة" class="btn btn-primary" style="display: block;">اطلب عرض سعر فوري</a>
                  </article>
                  
                  <article class="service-card" style="text-align: center; padding: 30px; border: 2px solid #0a4b86;">
                      <h3>باقة ديب كلين للفلل والشقق</h3>
                      <p style="color: #666; margin-bottom: 20px;">تنظيف عميق وشامل قبل السكن أو بعد التشطيبات المنزلية.</p>
                      <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; line-height: 2;">
                          <li>غسيل الأرضيات وجلي وتلميع الرخام</li>
                          <li>تنظيف المطابخ وإزالة بقع الدهون الصعبة</li>
                          <li>تعقيم الحمامات والبورسلين بالكامل</li>
                          <li>تلميع الزجاج الداخلي والخارجي للنوافذ</li>
                      </ul>
                      <a href="https://wa.me/97477170300?text=مرحباً،%20أرغب%20بالاستفسار%20عن%20أسعار%20باقة%20الديب%20كلين%20للفلل%20والشقق" class="btn btn-primary" style="display: block; background: #0a4b86;">اطلب عرض سعر فوري</a>
                  </article>

                  <article class="service-card" style="text-align: center; padding: 30px;">
                      <h3>باقة غسيل المجالس بالبخار</h3>
                      <p style="color: #666; margin-bottom: 20px;">تنظيف وتطهير الكنب والسجاد والمجالس والديوانيات.</p>
                      <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; line-height: 2;">
                          <li>شفط الأتربة وحبيبات الرمل المجهرية</li>
                          <li>إزالة البقع المستعصية والروائح الكريهة</li>
                          <li>تعقيم بالبخار الحار للقضاء على البكتيريا</li>
                          <li>تجفيف سريع للفرش مع الحفاظ على الألوان</li>
                      </ul>
                      <a href="https://wa.me/97477170300?text=مرحباً،%20أرغب%20بالاستفسار%20عن%20أسعار%20باقة%20غسيل%20المجالس%20بالبخار" class="btn btn-primary" style="display: block;">اطلب عرض سعر فوري</a>
                  </article>
              </div>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Our Service Packages & Pricing</h1>
                  <p>DarbAlmaha offers flexible, transparent, and affordable package options for home cleaning and hospitality services. We guarantee outstanding quality at competitive rates with no hidden costs.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container">
              <div class="services-grid">
                  <article class="service-card" style="text-align: center; padding: 30px;">
                      <h3>Hourly Maids Package</h3>
                      <p style="color: #666; margin-bottom: 20px;">Perfect for regular domestic chores, cleaning, laundry, and organizing.</p>
                      <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; line-height: 2;">
                          <li>Experienced Filipino cleaning ladies</li>
                          <li>Flexible booking slots</li>
                          <li>Assistance in organizing and laundry</li>
                          <li>Available across all Doha areas</li>
                      </ul>
                      <a href="https://wa.me/97477170300?text=Hello,%20I%20want%20to%20know%20the%20hourly%20maids%20package%20pricing" class="btn btn-primary" style="display: block;">Get Custom Quote</a>
                  </article>
                  
                  <article class="service-card" style="text-align: center; padding: 30px; border: 2px solid #0a4b86;">
                      <h3>Villa & Apartment Deep Clean</h3>
                      <p style="color: #666; margin-bottom: 20px;">Detailed deep cleaning before moving in or after construction works.</p>
                      <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; line-height: 2;">
                          <li>Deep floor scrubbing & marble polishing</li>
                          <li>Kitchen degreasing and grease removal</li>
                          <li>Full bathroom sanitizing and limescale removal</li>
                          <li>Internal & external window glass polishing</li>
                      </ul>
                      <a href="https://wa.me/97477170300?text=Hello,%20I%20want%20to%20know%20the%20villa%20deep%20cleaning%20package%20pricing" class="btn btn-primary" style="display: block; background: #0a4b86;">Get Custom Quote</a>
                  </article>

                  <article class="service-card" style="text-align: center; padding: 30px;">
                      <h3>Majlis & Sofa Steam Clean</h3>
                      <p style="color: #666; margin-bottom: 20px;">Deep sanitization for sofa sets, carpets, rugs, and traditional majlis.</p>
                      <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; line-height: 2;">
                          <li>Fine dust extraction and heavy vacuuming</li>
                          <li>Tough stains and spill marks pre-treatment</li>
                          <li>Hot steam extraction for germs elimination</li>
                          <li>Fast drying fabric-safe process</li>
                      </ul>
                      <a href="https://wa.me/97477170300?text=Hello,%20I%20want%20to%20know%20the%20sofa%20steam%20cleaning%20package%20pricing" class="btn btn-primary" style="display: block;">Get Custom Quote</a>
                  </article>
              </div>
          </div>
      </section>
    `
  },

  // ================= 5. BLOG HUB =================
  {
    depth: 1,
    urlPath: 'blog/',
    titleAr: 'مدونة درب المها | نصائح وإرشادات التنظيف في قطر',
    titleEn: 'DarbAlmaha Blog | Home Cleaning Tips & Guides Qatar',
    descAr: 'تصفح مقالات مدونة درب المها للتعرف على أفضل طرق تنظيف المنازل بالدوحة، مكافحة حشرات الصيف، غسيل خزانات المياه، وتنظيف الكنب والسجاد بالبخار.',
    descEn: 'Read DarbAlmaha blog for expert home cleaning tips, pest control guidelines, water tank maintenance, and majlis care in Qatar.',
    keywordsAr: 'مدونة تنظيف قطر, نصائح تنظيف المنزل, دليل مكافحة حشرات قطر, إرشادات غسيل الكنب بالبخار',
    keywordsEn: 'cleaning blog Qatar, home maintenance tips Doha, pest control guide, sofa cleaning tips',
    schemaType: 'WebPage',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>مدونة درب المها وقاعدة المعرفة</h1>
                  <p>دليلك العملي للحفاظ على نظافة وصحة بيتك وعائلتك في قطر. نقدم لكم مقالات دورية وإرشادات علمية مبسطة أعدها خبراء التنظيف والتعقيم لدينا لمواجهة تحديات الرطوبة والغبار والآفات.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container">
              <div class="services-grid">
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/1.webp" alt="الجدول الزمني لتنظيف المنازل في الدوحة">
                      </div>
                      <div class="service-content">
                          <h3>الجدول الزمني المثالي لتنظيف المنازل في الدوحة لمواجهة الغبار</h3>
                          <p>نصائح عملية لوضع برنامج تنظيف دوري للبيت يحميه من الغبار الصحراوي المستمر والأتربة العالقة.</p>
                          <a href="cleaning-schedule-doha/" class="service-btn">اقرأ المقالة</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/02.webp" alt="دليل اختيار عاملات النظافة بالساعة">
                      </div>
                      <div class="service-content">
                          <h3>دليلك الشامل لاختيار عاملات النظافة بنظام الساعة في قطر</h3>
                          <p>كيف تختارين عاملة نظافة ماهرة وأمينة بالساعة، وما هي المعايير التي تضمن لك خدمة ممتازة وسريعة.</p>
                          <a href="hourly-maids-guide-qatar/" class="service-btn">اقرأ المقالة</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/06.webp" alt="غسيل الكنب بالبخار في قطر">
                      </div>
                      <div class="service-content">
                          <h3>لماذا يعتبر غسيل الكنب بالبخار ضرورياً في قطر للتخلص من عث الغبار</h3>
                          <p>أهمية استخدام تقنية البخار الحار لتعقيم أثاث المجالس والصالونات وحمايته من أضرار الرطوبة والبقع.</p>
                          <a href="sofa-carpet-steam-cleaning/" class="service-btn">اقرأ المقالة</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/4.webp" alt="تنظيف وتعقيم خزانات المياه">
                      </div>
                      <div class="service-content">
                          <h3>الدليل العملي لعلامات تلوث خزان المياه وطرق غسيل الخزانات وتعقيمها</h3>
                          <p>تعرف على الإشارات التي تدل على حاجة خزان مياه بيتك للغسيل والتعقيم، وكيف نقوم بذلك بشكل صحي.</p>
                          <a href="water-tank-cleaning-guide/" class="service-btn">اقرأ المقالة</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/6.webp" alt="مكافحة الحشرات في قطر قبل الصيف">
                      </div>
                      <div class="service-content">
                          <h3>أهمية رش ومكافحة الحشرات والقوارض في الفلل القطرية قبل الصيف</h3>
                          <p>برنامج استباقي لمنع تسلل الصراصير والنمل والنمل الأبيض للفلل والحدائق والمجالس قبل اشتداد حرارة الصيف.</p>
                          <a href="pest-control-qatar-guide/" class="service-btn">اقرأ المقالة</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/clean.webp" alt="التنظيف العميق للسيارات">
                      </div>
                      <div class="service-content">
                          <h3>دليلك للتنظيف العميق للسيارات من الداخل لحماية الجلد والمفروشات</h3>
                          <p>كيف تحافظ على مقاعد سيارتك وطبلونها نظيفاً ولامعاً وخالياً من بقع السوائل والأتربة المتراكمة.</p>
                          <a href="car-deep-cleaning-guide/" class="service-btn">اقرأ المقالة</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/03.webp" alt="نصائح الحفاظ على نظافة المجالس">
                      </div>
                      <div class="service-content">
                          <h3>نصائح فعالة للحفاظ على المجالس والديوانيات نظيفة وجاهزة للضيوف</h3>
                          <p>خطوات بسيطة وسريعة للعناية بالمجالس والكنب الفاخر وترتيبها لتظل بيوتكم عامرة ومستعدة لاستقبال الزوار.</p>
                          <a href="majlis-cleaning-tips/" class="service-btn">اقرأ المقالة</a>
                      </div>
                  </article>
              </div>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>DarbAlmaha Blog & Knowledge Base</h1>
                  <p>Your guide to home hygiene, disinfection, and family health in Qatar. We share professional insights and practical tips prepared by our cleaning and sanitization experts.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container">
              <div class="services-grid">
                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/1.webp" alt="Home Cleaning Schedule Doha">
                      </div>
                      <div class="service-content">
                          <h3>The Perfect Home Cleaning Schedule in Doha for Combatting Dust</h3>
                          <p>Practical tips to setup a regular house cleaning routine that protects your indoor air quality from desert dust storms.</p>
                          <a href="cleaning-schedule-doha/" class="service-btn">Read Article</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/02.webp" alt="Hourly Maids Choice Guide">
                      </div>
                      <div class="service-content">
                          <h3>Your Complete Guide to Selecting Hourly Maids in Qatar</h3>
                          <p>How to choose skilled, reliable, and trustworthy hourly cleaning ladies, and what standards to expect for a fast service.</p>
                          <a href="hourly-maids-guide-qatar/" class="service-btn">Read Article</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/06.webp" alt="Sofa Steam Cleaning Guide">
                      </div>
                      <div class="service-content">
                          <h3>Why Steam Cleaning is Crucial for Sofas in Qatar to Eliminate Dust Mites</h3>
                          <p>The importance of utilizing hot steam extraction to sanitize sofa sets, carpets, and majlis furniture against humidity damage.</p>
                          <a href="sofa-carpet-steam-cleaning/" class="service-btn">Read Article</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/4.webp" alt="Water Tank Cleaning Guide">
                      </div>
                      <div class="service-content">
                          <h3>Signs of Water Tank Contamination & Professional Washing Methods</h3>
                          <p>Learn the red flags indicating your home water tank requires immediate washing and sanitizing, and our safe protocols.</p>
                          <a href="water-tank-cleaning-guide/" class="service-btn">Read Article</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/6.webp" alt="Pest Control Guide Qatar">
                      </div>
                      <div class="service-content">
                          <h3>Crucial Pest Control & Spraying in Qatari Villas Before Summer</h3>
                          <p>A proactive program to block crawling cockroaches, ants, termites, and rodents from entering your villa and gardens.</p>
                          <a href="pest-control-qatar-guide/" class="service-btn">Read Article</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/clean.webp" alt="Car Detailing Guide">
                      </div>
                      <div class="service-content">
                          <h3>Interior Car Deep Cleaning Guide: Protecting Leather and Fabrics</h3>
                          <p>How to keep your car seats, console, and dashboard clean, spotless, and conditioned against high summer heat.</p>
                          <a href="car-deep-cleaning-guide/" class="service-btn">Read Article</a>
                      </div>
                  </article>

                  <article class="service-card">
                      <div class="service-img">
                          <img src="img/03.webp" alt="Majlis Cleaning Tips">
                      </div>
                      <div class="service-content">
                          <h3>Effective Tips to Keep Your Majlis & Upholstery Clean and Ready for Guests</h3>
                          <p>Easy maintenance routines for luxury majlis seating, ensuring your home is always clean and welcoming for visitors.</p>
                          <a href="majlis-cleaning-tips/" class="service-btn">Read Article</a>
                      </div>
                  </article>
              </div>
          </div>
      </section>
    `
  },

  // ================= 6. 7 BLOG ARTICLES =================
  // Article 1
  {
    depth: 2,
    urlPath: 'blog/cleaning-schedule-doha/',
    titleAr: 'الجدول الزمني المثالي لتنظيف المنازل في الدوحة | درب المها',
    titleEn: 'Home Cleaning Schedule in Doha for Combatting Dust | DarbAlmaha',
    descAr: 'دليل شامل لوضع جدول زمني فعال لتنظيف منازل الدوحة لمقاومة الغبار والأتربة الصحراوية وتأثير الرطوبة على أثاث البيت ومفروشاته.',
    descEn: 'Learn how to create a structured home cleaning routine in Doha to keep your living space free from desert dust and allergens.',
    keywordsAr: 'تنظيف غبار قطر, جدول تنظيف المنزل, شركة تنظيف الدوحة, مكافحة أتربة المنازل, تهوية البيت بالدوحة',
    keywordsEn: 'home cleaning schedule Doha, house cleaning tips Qatar, dust control Doha, residential cleaning routine',
    schemaType: 'Article',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>الجدول الزمني المثالي لتنظيف منازل الدوحة لمواجهة الغبار</h1>
                  <p>تتعرض البيوت والفلل في الدوحة بشكل مستمر لهبوب رياح مغبرة وعواصف رملية ناعمة، مما يجعل الحفاظ على نظافة البيت تحدياً يومياً لربات البيوت. في هذه المقالة نقدم لكم جدولاً زمنياً عملياً لتنظيف المنزل بكفاءة.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>أولاً: المهام اليومية السريعة لمقاومة الغبار</h2>
                  <p>بسبب الغبار المستمر، يفضل القيام بمسح سريع للأسطح المكشوفة مثل طاولات الطعام وطاولات غرف المعيشة بقطع قماش مايكروفايبر رطبة قليلاً لتجنب تطاير الأتربة. كما يوصى بكنس المداخل الرئيسية وممرات الفلل لمنع انتقال ذرات الرمل إلى داخل الغرف مع حركة السير.</p>

                  <h2>ثانياً: البرنامج الأسبوعي للتنظيف التفصيلي</h2>
                  <p>تخصيص يوم في الأسبوع للقيام بكنس السجاد بالمكنسة الكهربائية جيداً، ومسح الأرضيات بالماء والمطهرات الآمنة. تشمل المهام الأسبوعية تنظيف رفوف المطبخ، والتخلص من الدهون، وتغيير شراشف وغطاء الأسرّة لضمان نوم صحي ونظيف.</p>

                  <h2>ثالثاً: التنظيف العميق الشهري (ديب كلين)</h2>
                  <p>يتطلب المنزل كل شهر تنظيفاً أكثر عمقاً يطال النوافذ الزجاجية من الداخل والخارج، وغسيل فلاتر التكييف التي تتراكم عليها كميات هائلة من الغبار والرمال في بيئة الدوحة الحارة، مما يعيق تبريد الهواء ونقاءه. كما يفضل تلميع الأثاث الخشبي والرخام بمواد متخصصة.</p>

                  <p>إذا كنت تجد صعوبة في مواكبة هذا الجدول وتفضل الاستعانة بمتخصصين، يسعدنا في <strong>درب المها</strong> تقديم المساعدة وتوفير عاملات نظافة خبيرات بالساعة أو القيام بعمليات التنظيف العميق للفلل والبيوت. تواصلوا معنا مباشرة عبر الواتساب لتنسيق المواعيد المناسبة لكم.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">تواصل معنا الآن عبر الواتساب</a>
                  </div>
              </article>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Perfect Home Cleaning Schedule in Doha</h1>
                  <p>Doha's climate brings persistent dust and desert sands into residential properties. Setting up a structured house cleaning routine helps maintain a clean, healthy space with minimal effort.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>1. Daily Dust Prevention Tasks</h2>
                  <p>Wiping exposed surfaces (dining tables, console desks) with a damp microfiber cloth is essential to trap fine dust. Sweeping primary villa entryways daily prevents sand grains from spreading inside high-traffic areas.</p>

                  <h2>2. Weekly Cleaning Routine</h2>
                  <p>Dedicate one day per week to thoroughly vacuum all rugs, carpets, and sofas. Mop tiled and marble floors with safe floor cleaners, wipe down kitchen shelves to prevent grease build-up, and replace bedsheets.</p>

                  <h2>3. Monthly Deep Cleaning (Deep Clean)</h2>
                  <p>Every month, houses require detailed attention. Clean window panes inside and out, wash AC filters (which accumulate thick dust in Doha's warm climate, reducing efficiency), and polish marble surfaces.</p>

                  <p>If managing this routine is difficult, <strong>DarbAlmaha</strong> provides skilled hourly maids and deep cleaning services to keep your home pristine. Contact us via WhatsApp to arrange a booking.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Contact Us on WhatsApp</a>
                  </div>
              </article>
          </div>
      </section>
    `
  },
  // Article 2
  {
    depth: 2,
    urlPath: 'blog/hourly-maids-guide-qatar/',
    titleAr: 'دليل اختيار عاملات النظافة بالساعة في قطر | درب المها',
    titleEn: 'Selecting Hourly Maids in Qatar: The Complete Guide | DarbAlmaha',
    descAr: 'تعرفي على أهم النصائح والمعايير لاختيار عاملات نظافة بالساعة في قطر يمتلكن الأمانة والسرعة والإتقان للقيام بالمهام المنزلية بكل ثقة.',
    descEn: 'A detailed guide on how to choose experienced and trustworthy hourly cleaning maids in Doha and across Qatar for home maintenance.',
    keywordsAr: 'عاملات بالساعة قطر, نصائح اختيار خادمات, شركة تنظيف الدوحة, عمالة منزلية موثوقة, ترتيب البيت بالساعة',
    keywordsEn: 'hourly maids Qatar, choose cleaning lady Doha, trusted maid services, hourly cleaning help',
    schemaType: 'Article',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>دليلك لاختيار عاملات النظافة بنظام الساعة في قطر</h1>
                  <p>تبحث الكثير من الأسر في قطر عن عاملات نظافة بالساعة لمساعدتهم في المهام المنزلية اليومية بمرونة دون الحاجة للاستقدام الدائم. نوفر لكم في هذا الدليل معايير تضمن لكم خدمة متميزة.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>أولاً: التحقق من الأمانة والموثوقية</h2>
                  <p>عند دخول شخص غريب لبيتك، تظل الأمانة هي الشرط الأول. يوصى بالتعامل حصرياً مع شركات تنظيف مرخصة ورسمية في قطر تقوم بفحص خلفيات العاملات والتحقق من هوياتهن الرسمية وأوراقهن الثبوتية، لتجنب أي مشاكل أو سرقات لا قدر الله.</p>

                  <h2>ثانياً: الخبرة والتدريب على الأجهزة المنزلية الحديثة</h2>
                  <p>تحتوي الفلل والشقق المعاصرة في قطر على أثاث فاخر ومطابخ حديثة وأجهزة كهربائية دقيقة. يجب أن تكون العاملة مدربة جيداً على استخدام المنظفات المناسبة لكل سطح (مثل استخدام منظفات خفيفة للرخام وتجنب المواد الكاشطة) لحماية ممتلكاتكم من التلف.</p>

                  <h2>ثالثاً: السرعة في الأداء وحسن المعاملة</h2>
                  <p>العمل بنظام الساعة يتطلب عاملة نشيطة تعرف كيف تنظم وقتها لتغطية أكبر قدر من المهام كالغسيل والترتيب والكي والكنس في الوقت المحدد، مع التحلي بروح مرنة وحسن استماع لتعليمات ربة المنزل.</p>

                  <p>في شركة <strong>درب المها</strong>، نوفر لكم نخبة من عاملات النظافة الماهرات بنظام الساعة اللواتي خضعن لتدريب مكثف على أعلى مستويات الجودة والالتزام بالأمانة في قطر. تواصلوا معنا مباشرة عبر الواتساب لتنسيق وحجز عاملتكم اليوم.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">تواصل معنا الآن عبر الواتساب</a>
                  </div>
              </article>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Complete Guide to Selecting Hourly Maids in Qatar</h1>
                  <p>Many families in Qatar prefer hourly maids for house chores due to flexibility and convenience. Selecting the right cleaning ladies requires attention to key factors outlined in this guide.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>1. Prioritizing Trust & Security</h2>
                  <p>When welcoming home assistants, security is the top priority. Always book maids through a licensed cleaning company in Qatar that screens its staff and verifies legal documentations, avoiding unverified individuals.</p>

                  <h2>2. Experience with Modern Home Appliances</h2>
                  <p>Modern apartments and villas feature premium surfaces (marble counters, delicate parquet) and advanced appliances. Maids must understand correct detergent dilution and surface care to prevent damage to expensive installations.</p>

                  <h2>3. Time Management & Professional Attitude</h2>
                  <p>Hourly services require energetic cleaning ladies who allocate their hours efficiently among cleaning, laundry, ironing, and kitchen organization, showing a polite attitude towards household instructions.</p>

                  <p>At <strong>DarbAlmaha</strong>, we supply trained, vetted, and trustworthy hourly cleaning maids across Qatar. Reach out via WhatsApp to schedule your cleaning maid today.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Contact Us on WhatsApp</a>
                  </div>
              </article>
          </div>
      </section>
    `
  },
  // Article 3
  {
    depth: 2,
    urlPath: 'blog/sofa-carpet-steam-cleaning/',
    titleAr: 'أهمية غسيل الكنب والسجاد بالبخار في قطر | درب المها',
    titleEn: 'Why Steam Cleaning is Crucial for Sofas in Qatar | DarbAlmaha',
    descAr: 'لماذا يعتبر تنظيف كنب ومجالس بالبخار ضرورياً في قطر للتخلص من الأتربة وعث الغبار والبقع الصعبة الناتجة عن الرطوبة وتكييف الهواء.',
    descEn: 'Discover the benefits of steam cleaning for sofas and carpets in Qatars climate. Eliminate deep allergens, dust mites, and tough stains effectively.',
    keywordsAr: 'غسيل كنب بالبخار قطر, تنظيف مجالس بالبخار, تعقيم سجاد بالدوحة, عث الغبار الرطوبة, تنظيف مفروشات قطر',
    keywordsEn: 'sofa steam cleaning Qatar, majlis washing Doha, carpet sanitizing Doha, upholstery care, dust mites removal',
    schemaType: 'Article',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>أهمية غسيل الكنب والسجاد بالبخار في مناخ قطر</h1>
                  <p>تتعرض المفروشات والكنب وسجاد المجالس في قطر لعوامل بيئية صعبة تشمل الغبار الناعم وارتفاع الرطوبة واستخدام التكييف المستمر، مما يتسبب في تغلغل الأوساخ والروائح. نوضح لكم أهمية غسيل الفرش بالبخار.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>أولاً: التخلص من عث الغبار والروائح الكريهة</h2>
                  <p>تخلق الرطوبة المرتفعة مع دفء المنزل بيئة خصبة لتكاثر الكائنات الدقيقة المجهرية مثل عث الغبار في أنسجة الكنب والسجاد، مسببة الحساسية والربو لأفراد العائلة. يعمل البخار الساخن المحقون تحت ضغط عالٍ على قتل هذه الكائنات وتعقيم الأنسجة وإزالة روائح الرطوبة فوراً.</p>

                  <h2>ثانياً: إزالة البقع دون التأثير على ألوان الأقمشة</h2>
                  <p>استخدام المياه الغزيرة والفرك العنيف يدوياً يتلف الأنسجة ويسبب تداخل ألوان السجاد والكنب. تقنية البخار الجاف تعمل على إذابة جزيئات الأوساخ والبقع الصعبة كالشاي والقهوة والمأكولات دون تعريض الأقمشة للبلل الشديد، مما يحافظ على عمرها وجودتها.</p>

                  <h2>ثالثاً: السرعة في التجفيف والاستخدام</h2>
                  <p>ميزة مكائن البخار المتطورة التي نستخدمها في درب المها أنها تسحب الرطوبة والمياه والمواد المستخرجة في نفس اللحظة، مما يتيح جفاف الكنب والسجاد في غضون ساعات قليلة لتتمكنوا من استخدام مجالسكم واستقبال ضيوفكم دون أي إزعاج.</p>

                  <p>يسعدنا في <strong>درب المها</strong> تقديم خدمات غسيل الكنب والمجالس والسجاد بالبخار في منازلكم مباشرة بأحدث الأجهزة والمواد المعطرة. تواصلوا معنا عبر الواتساب لتنسيق زيارة فريقنا الفني.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">تواصل معنا الآن عبر الواتساب</a>
                  </div>
              </article>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Why Steam Cleaning is Crucial for Upholstery in Qatar</h1>
                  <p>Sofas, carpets, and majlis fabrics in Qatari homes face harsh environmental factors like fine dust, high humidity, and continuous AC usage. Traditional cleaning fails to remove deep-seated particles, making steam extraction essential.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>1. Eradicating Dust Mites & Mold</h2>
                  <p>High moisture levels combined with indoor warmth encourage dust mites and fungal spores to breed within fabric fibers, often triggering asthma and respiratory allergies. Pressurized hot steam sanitizes fabric instantly, killing bacteria and neutralizing musty odors.</p>

                  <h2>2. Lifting Stubborn Stains Safely</h2>
                  <p>Excessive manual scrubbing and harsh chemicals ruin fabric texture and fade colors. Steam cleaning gently breaks down grease, coffee, tea, and juice stains, extracting them from the fibers without damaging delicate upholstery fabrics.</p>

                  <h2>3. Rapid Drying Time</h2>
                  <p>Our extraction equipment injects steam and recovers moisture simultaneously, leaving fabrics clean and slightly damp. The sofa sets and carpets dry completely within hours, letting you use your living space with minimal disruption.</p>

                  <p>At <strong>DarbAlmaha</strong>, we offer professional mobile steam cleaning for sofas, carpets, and majlis at your home. Contact us via WhatsApp to book our technician today.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Contact Us on WhatsApp</a>
                  </div>
              </article>
          </div>
      </section>
    `
  },
  // Article 4
  {
    depth: 2,
    urlPath: 'blog/water-tank-cleaning-guide/',
    titleAr: 'دليل تنظيف وتعقيم خزانات المياه في قطر | درب المها',
    titleEn: 'Water Tank Cleaning Guide: Signs of Contamination | DarbAlmaha',
    descAr: 'كيف تكتشف تلوث خزان المياه في منزلك، وما هي الخطوات الصحيحة لغسيل وتعقيم الخزانات لضمان مياه صحية ونظيفة خالية من الطحالب والشوائب.',
    descEn: 'Learn how to detect water tank contamination and the correct steps for professional cleaning and disinfection to ensure clean water in Qatar.',
    keywordsAr: 'تنظيف خزانات مياه قطر, غسيل خزان مياه الدوحة, تعقيم خزانات المياه, طحالب خزانات المياه, مياه صحية قطر',
    keywordsEn: 'water tank cleaning guide, clean water storage, tank washing steps, sanitize water tank Doha, tank contamination signs',
    schemaType: 'Article',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>دليل تنظيف وتعقيم خزانات المياه في قطر</h1>
                  <p>خزانات المياه هي شريان الحياة في منازلنا بقطر، ونظافتها تؤثر بشكل مباشر على صحة عائلاتنا. نقدم لكم هذا الدليل لمعرفة علامات تلوث المياه والخطوات السليمة لتنظيف الخزانات.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>أولاً: علامات تشير لحاجة الخزان للتنظيف الفوري</h2>
                  <p>يجب مراقبة المياه باستمرار للتأكد من خلوها من الآتي: تغير طفيف في لون المياه (ميلها للصفرة)، أو انبعاث رائحة تشبه الرطوبة أو الطين من الصنابير، أو وجود شوائب وأتربة ناعمة تخرج مع الماء عند الاستحمام. هذه العلامات تعني تراكم الرواسب والطحالب في قاع الخزان.</p>

                  <h2>ثانياً: تراكم الشوائب والصدأ وتأثير الحرارة</h2>
                  <p>ارتفاع درجات الحرارة الشديد في قطر يؤدي إلى تسخين الخزانات العلوية، مما يسرع نمو البكتيريا والفطريات في حال وجود أي أتربة ناعمة دخلت عبر فتحات التهوية أو الصيانة. يوصى بإغلاق فتحات الخزانات بإحكام وفحصها دورياً.</p>

                  <h2>ثالثاً: آلية الغسيل والتعقيم الاحترافية</h2>
                  <p>تتم عملية الغسيل بسحب المياه وتصريف الرواسب يدوياً، ثم فرك الجدران لإزالة الطين والطحالب بالكامل، وشطف الخزان، ثم استخدام محاليل الكلور المعتمدة بالنسب الدقيقة لتعقيم الخزان وضمان القضاء على الكائنات الدقيقة دون ترك آثار كيميائية ضارة بالصحة.</p>

                  <p>نوفر في <strong>درب المها</strong> خدمة متكاملة لغسيل وتعقيم خزانات المياه بأيدي فنيين متخصصين ومواد تعقيم معتمدة وآمنة. تواصلوا معنا مباشرة عبر الواتساب لحجز موعد تنظيف خزان بيتكم.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">تواصل معنا الآن عبر الواتساب</a>
                  </div>
              </article>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Water Tank Cleaning & Sanitization Guide</h1>
                  <p>Water tanks store the water used daily for cooking, washing, and bathing. Keeping them clean is essential for family health. Read our guide to identify contamination and clean tanks safely.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>1. Primary Signs of Tank Contamination</h2>
                  <p>Watch out for signs like color changes (yellowish tint), musty or earthy smells coming from faucets, or fine black/brown sediment in bath water. These signs suggest mud and algae have accumulated at the bottom.</p>

                  <h2>2. The Effect of Qatars Hot Climate</h2>
                  <p>Extreme summer heat warms roof tanks, creating a breeding ground for bacteria if dust particles settle inside. Keeping tank lids sealed tightly and checking gaskets is critical to block dust ingress.</p>

                  <h2>3. Standard Disinfection Protocol</h2>
                  <p>Professional cleaning involves draining the tank, manual scrubbing of walls to lift algae and slime, thorough rinsing, and applying approved sanitizing chlorine solutions in correct dilutions to disinfect surfaces safely.</p>

                  <p>At <strong>DarbAlmaha</strong>, we clean and sanitize residential water tanks using approved, family-safe sanitizers. Connect with us on WhatsApp to schedule your tank inspection.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Contact Us on WhatsApp</a>
                  </div>
              </article>
          </div>
      </section>
    `
  },
  // Article 5
  {
    depth: 2,
    urlPath: 'blog/pest-control-qatar-guide/',
    titleAr: 'أهمية مكافحة الحشرات ورش المبيدات قبل الصيف | درب المها',
    titleEn: 'Crucial Pest Control & Spraying in Qatar Before Summer | DarbAlmaha',
    descAr: 'لماذا يجب القيام برش ومكافحة حشرات الفلل والمنازل في قطر قبل اشتداد حرارة الصيف لمنع الصراصير والنمل وبق الفراش والقوارض.',
    descEn: 'Learn why proactive pest control and insecticide spraying before Qatars summer is essential to keep villas free from cockroaches and rodents.',
    keywordsAr: 'مكافحة حشرات قطر, رش صراصير الدوحة, رش مبيدات حشرية, مكافحة بق الفراش قطر, وقاية الفلل من القوارض',
    keywordsEn: 'pest control Qatar, insecticide spraying Doha, summer pest prevention, cockroach control Doha, bed bug spraying',
    schemaType: 'Article',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>أهمية مكافحة الحشرات ورش المبيدات قبل حلول الصيف</h1>
                  <p>مع اقتراب فصل الصيف وارتفاع درجات الحرارة في قطر، تبحث الحشرات والآفات عن ملاذات باردة ورطبة داخل منازلنا وفللنا، مسببة إزعاجاً ومخاطر صحية. نوضح أهمية الرش الوقائي للحشرات.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>أولاً: منع تكاثر الصراصير والنمل في المطابخ</h2>
                  <p>تعتبر المطابخ ومجاري الصرف الصحي البيئة المفضلة لتكاثر الصراصير والنمل الأسود. القيام برش وقائي للمصارف والزوايا وخلف الأجهزة الكهربائية قبل اشتداد الحرارة يقضي على بيوض الحشرات ويمنع انتشارها المزعج في أواني الطهي والأطعمة.</p>

                  <h2>ثانياً: وقاية الحدائق والفلل من القوارض والنمل الأبيض</h2>
                  <p>الفلل ذات المساحات الخضراء والحدائق تكون عرضة لتسلل الفئران والقوارض، بالإضافة إلى النمل الأبيض (الرمة) الذي يتغذى على الأخشاب والأبواب مسبباً خسائر مادية فادحة. وضع طعوم وحقن أساسات الفلل يضمن حماية ممتلكاتكم بشكل كامل.</p>

                  <h2>ثالثاً: استخدام مبيدات آمنة وغير ضارة بالصحة</h2>
                  <p>الوقاية لا تعني تعريض الأسرة للخطر. يجب استخدام مبيدات صديقة للبيئة وخالية من الروائح النفاذة والمواد المسرطنة، ومرخصة بالكامل من وزارة البلدية في قطر، لضمان القضاء على الآفات دون الحاجة لمغادرة المنزل.</p>

                  <p>تقدم شركة <strong>درب المها</strong> خدمات مكافحة الحشرات ورش المبيدات بضمان أكيد ومواد آمنة بالكامل على أيدي كادر مؤهل. تواصلوا معنا عبر الواتساب لحماية بيتكم من الحشرات قبل الصيف.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">تواصل معنا الآن عبر الواتساب</a>
                  </div>
              </article>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Why Summer Pest Control is Essential in Qatar</h1>
                  <p>As summer temperatures climb in Qatar, pests and rodents actively seek cooler, humid environments inside our homes. A proactive insecticide treatment protects your family from sanitation risks.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>1. Stopping Cockroaches & Ants in Kitchens</h2>
                  <p>Kitchen counters and drainage pipelines are primary breeding sites for German cockroaches and sugar ants. A protective chemical spraying of drains and baseboards before summer destroys nesting sites and prevents infestation.</p>

                  <h2>2. Protecting Villa Gardens from Rodents & Termites</h2>
                  <p>Villas with external gardens are susceptible to rodents and wood-destroying subterranean termites (Rammah). Placing secure baiting stations and treating foundation perimeters guards your wooden fixtures from decay.</p>

                  <h2>3. Safe & Odorless Chemical Sprays</h2>
                  <p>Effective pest control does not require exposing your family to hazardous fumes. We use odorless, targeted insecticide formulas certified by the Qatari Ministry of Municipality, allowing treatment without leaving the house.</p>

                  <p>At <strong>DarbAlmaha</strong>, we provide comprehensive pest control and disinfection with solid warranties. Reach out on WhatsApp to safeguard your home today.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Contact Us on WhatsApp</a>
                  </div>
              </article>
          </div>
      </section>
    `
  },
  // Article 6
  {
    depth: 2,
    urlPath: 'blog/car-deep-cleaning-guide/',
    titleAr: 'دليل التنظيف العميق للسيارات من الداخل | درب المها',
    titleEn: 'Interior Car Deep Cleaning Guide: Fabrics & Leather | DarbAlmaha',
    descAr: 'كيف تحافظ على نظافة فرش سيارتك من الداخل وتلميع الطبلون وإزالة بقع الأطعمة والروائح الكريهة الناتجة عن رطوبة المكيف في قطر.',
    descEn: 'Learn how to keep your car interior clean, spotless, and sanitized. Expert tips on seat washing, dashboard conditioning, and AC odor removal in Qatar.',
    keywordsAr: 'تنظيف سيارات عميق, غسيل فرش سيارات, تلميع سيارات داخلي, إزالة روائح مكيف السيارة, العناية بالجلد السيارات',
    keywordsEn: 'car deep cleaning guide, interior car detailing, seat washing tips, dashboard conditioning Doha, car smell removal',
    schemaType: 'Article',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>دليلك للتنظيف العميق وتلميع السيارات من الداخل</h1>
                  <p>نقضي ساعات طويلة داخل سياراتنا في قطر، ومع الاستخدام اليومي تتراكم الأتربة والبقع الناتجة عن المشروبات والمأكولات على المراتب والأرضيات. نقدم لكم دليلاً للعناية بداخلية سياراتكم.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>أولاً: غسيل وتعقيم المقاعد (المخمل والجلد)</h2>
                  <p>تتشرب مقاعد السيارات المخملية العرق وبقع المشروبات لتصبح بيئة خصبة للبكتيريا والروائح الكريهة عند تشغيل التكييف. غسيل المقاعد بالبخار واستخراج المياه المتسخة يعيد بريقها ورائحتها الطيبة، بينما تتطلب المقاعد الجلدية مواد ترطيب مخصصة لمنع تشققها بفعل حرارة الشمس الشديدة في قطر.</p>

                  <h2>ثانياً: تنظيف فتحات التكييف والكونسول الوسطي</h2>
                  <p>تتراكم الأتربة الناعمة داخل فتحات مكيف السيارة، مما يؤثر على جودة الهواء المستنشق. تنظيفها بفرش دقيقة وتعقيمها بالبخار يضمن هواءً نقياً، كما يجب مسح الكونسول والأزرار بدقة لتجنب تراكم الدهون والأوساخ اللاصقة.</p>

                  <h2>ثالثاً: كنس وغسيل الأرضيات والدواسات</h2>
                  <p>أرضية السيارة هي الأكثر عرضة للأوساخ والأتربة. شفط الغبار بقوة ثم غسيل السجاد الداخلي وتجفيفه يمنع نشوء روائح رطوبة في مقصورة السيارة ويحافظ على نظافة حذائك وملابسك.</p>

                  <p>نوفر في <strong>درب المها</strong> خدمة التنظيف العميق (ديب كلين) لداخلية السيارات بمواد إيطالية مخصصة للعناية بالفرش والجلد والطبلون بأسعار مناسبة. تواصلوا معنا عبر الواتساب لحجز خدمة تلميع سيارتكم.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">تواصل معنا الآن عبر الواتساب</a>
                  </div>
              </article>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Interior Car Deep Cleaning & Detailing Guide</h1>
                  <p>We spend considerable time inside our cars. Daily driving in Qatar leaves vehicle interiors subject to dust build-up, food stains, and AC odors. Read our tips to keep your car cabin fresh.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>1. Washing Fabric & Leather Seats</h2>
                  <p>Fabric car seats absorb sweat and beverage spills, leading to bacteria growth and persistent odors when the AC runs. Steam washing extracts dirt from fabrics, while leather seats require dedicated moisturizers to avoid drying and cracking under Qatars sun.</p>

                  <h2>2. Cleaning Dashboard Consoles & AC Vents</h2>
                  <p>Fine dust settles inside air vents, diminishing indoor air quality. Cleaning vents with detailing brushes and sanitizing dashboard vinyl helps block fading and cracks caused by extreme vehicle cabin heat.</p>

                  <h2>3. Carpet Shampooing & Foot Mats Care</h2>
                  <p>The car floor collects thick dirt and sand. Vacuuming carpets thoroughly and washing them prevents mold and humidity smells, ensuring a fresh and clean driving environment.</p>

                  <p>At <strong>DarbAlmaha</strong>, we offer interior car deep cleaning and upholstery detailing using high-grade care products. Message us on WhatsApp to schedule your vehicle detailing.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Contact Us on WhatsApp</a>
                  </div>
              </article>
          </div>
      </section>
    `
  },
  // Article 7
  {
    depth: 2,
    urlPath: 'blog/majlis-cleaning-tips/',
    titleAr: 'نصائح العناية بنظافة المجالس والديوانيات في قطر | درب المها',
    titleEn: 'Majlis & Sofa Cleaning Tips for Qatari Homes | DarbAlmaha',
    descAr: 'خطوات بسيطة وسريعة للعناية بالمجالس والديوانيات القطرية وتجهيزها لاستقبال الضيوف، مع طرق حماية الكنب الفاخر والسجاد من الأتربة والبقع.',
    descEn: 'Learn simple maintenance tips to keep your traditional Qatari majlis and diwaniya clean, organized, and ready for guests at all times.',
    keywordsAr: 'تنظيف مجالس قطر, ديوانيات الدوحة, ترتيب المجالس الفاخرة, العناية بالكنب والفرش, استقبال الضيوف قطر',
    keywordsEn: 'majlis cleaning tips Doha, diwaniya care Qatar, sofa maintenance Doha, upholstery cleaning guide',
    schemaType: 'Article',
    bodyAr: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>نصائح فعالة للحفاظ على المجالس والديوانيات جاهزة للضيوف</h1>
                  <p>المجالس والديوانيات هي قلب البيت القطري ورمز الكرم والضيافة، والحفاظ على نظافتها وأناقتها الدائمة هو محل اهتمام كل أسرة. نقدم لكم نصائح سريعة لتبقي مجالسكم عامرة ونظيفة.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>أولاً: كنس المجلس الدوري وسحب الأتربة</h2>
                  <p>يتسلل الغبار الصحراوي باستمرار عبر الأبواب والنوافذ ليرقد على أقمشة الكنب الفاخرة والسجاد السميك في المجالس. يوصى بكنس المجالس بالمكنسة الكهربائية مرتين أسبوعياً على الأقل لمنع تراكم الأتربة داخل ثنايا الفرش وصعوبة إزالتها لاحقاً.</p>

                  <h2>ثانياً: التعامل الفوري مع بقع القهوة والشاي</h2>
                  <p>الولائم والجمعات يصاحبها أحياناً انسكاب غير مقصود للقهوة العربية أو الشاي. السر في حماية الفرش هو التعامل الفوري بامتصاص السائل بقطعة قماش قطنية جافة دون فرك، ثم وضع القليل من الماء الدافئ ومسحه برفق لتجنب تمدد البقعة وتشوه المظهر.</p>

                  <h2>ثالثاً: التعطير والتهوية المنتظمة</h2>
                  <p>تهوية المجلس يومياً لمدة 10 دقائق يجدد الهواء ويطرد روائح الرطوبة، كما يساهم استخدام البخور والعود الفاخر بعد التنظيف في إضفاء عبق منعش يعلق بالستائر والسجاد ويسعد الضيوف فور دخولهم.</p>

                  <p>يسعدنا في شركة <strong>درب المها</strong> توفير عاملات بالساعة ماهرات لترتيب وتنظيف مجالسكم، أو القيام بغسيل شامل للكنب والسجاد بالبخار والتعقيم. تواصلوا معنا مباشرة عبر الواتساب لتنسيق طلباتكم.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">تواصل معنا الآن عبر الواتساب</a>
                  </div>
              </article>
          </div>
      </section>
    `,
    bodyEn: `
      <section class="hero hero-subpage">
          <div class="container">
              <div class="hero-content">
                  <h1>Tips to Keep Your Majlis & Diwaniya Clean and Ready</h1>
                  <p>The majlis is the center of Qatari hospitality and social life. Keeping it clean, fresh, and welcoming is essential. Read our guide for practical maintenance tips.</p>
              </div>
          </div>
      </section>

      <section class="section-padding bg-light">
          <div class="container" style="max-width: 800px; line-height: 1.8;">
              <article style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                  <h2>1. Regular Vacuuming to Extract Fine Dust</h2>
                  <p>Desert dust enters majlis halls through doors and windows, settling on premium carpets and upholstery. Vacuuming fabrics at least twice a week prevents fine sand from embedding into upholstery fibers.</p>

                  <h2>2. Immediate Care for Coffee & Tea Spills</h2>
                  <p>Gatherings occasionally result in accidental coffee or tea spills. Blot the liquid immediately with a clean dry cotton cloth without rubbing, apply warm water gently, and blot dry to stop the stain from setting.</p>

                  <h2>3. Proper Ventilation & Incense (Oudh)</h2>
                  <p>Ventilating the majlis daily for 10 minutes refreshes indoor air and gets rid of stuffiness. Burning high-quality Oudh or incense after cleaning leaves a welcoming aroma trapped in curtains and rugs.</p>

                  <p>At <strong>DarbAlmaha</strong>, we offer hourly maids for majlis arrangement and deep steam extraction for sofas and carpets. Connect with us on WhatsApp for assistance.</p>
                  
                  <div style="margin-top: 30px; text-align: center;">
                      <a href="https://wa.me/97477170300" class="btn btn-whatsapp">Contact Us on WhatsApp</a>
                  </div>
              </article>
          </div>
      </section>
    `
  }
];

// Write Arabic pages
pagesData.forEach(page => {
  const isEn = false;
  const targetHtml = buildPage(page, isEn);
  const targetDir = path.join(baseDir, 'ar', page.urlPath);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, 'index.html');
  fs.writeFileSync(filePath, targetHtml, 'utf8');
  console.log(`Generated Arabic Page: ${page.urlPath}index.html`);
});

// Write English pages
pagesData.forEach(page => {
  const isEn = true;
  const targetHtml = buildPage(page, isEn);
  const targetDir = path.join(baseDir, 'en', page.urlPath);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, 'index.html');
  fs.writeFileSync(filePath, targetHtml, 'utf8');
  console.log(`Generated English Page: en/${page.urlPath}index.html`);
});

console.log('🎉 Generation completed successfully!');
