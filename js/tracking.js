/* tracking.js - Conversion Tracking for DarbAlmaha */
/* Supports: GA4, Facebook Pixel, TikTok Pixel, Snapchat Pixel */

(function () {
    'use strict';

    // ==========================================
    // TRACKING IDS - REPLACE WITH YOUR ACTUAL IDS
    // ==========================================
    const CONFIG = {
        gtmId: 'GTM-XXXXXXX',        // Google Tag Manager ID
        ga4Id: 'G-XXXXXXXXXX',       // GA4 Measurement ID
        googleAdsId: 'AW-17261772066', // Google Ads ID
        fbPixelId: 'XXXXXXXXXXXX',   // Facebook Pixel ID
        tiktokPixelId: 'XXXXXXXX',   // TikTok Pixel ID
        snapchatPixelId: 'XXXXXXXX'  // Snapchat Pixel ID
    };

    // ==========================================
    // HELPER: Fire tracking event across all platforms
    // ==========================================
    function trackEvent(eventName, params) {
        params = params || {};

        // GA4 Event
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
        }

        // Facebook Pixel
        if (typeof fbq === 'function') {
            fbq('track', eventName, params);
        }

        // TikTok Pixel
        if (typeof ttq === 'object' && typeof ttq.track === 'function') {
            ttq.track(eventName, params);
        }

        // Snapchat Pixel
        if (typeof snaptr === 'function') {
            snaptr('track', eventName, params);
        }

        // Debug logging (remove in production)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('[Tracking]', eventName, params);
        }
    }

    // ==========================================
    // CONVERSION EVENTS
    // ==========================================

    // 1. Phone Call Click
    function trackPhoneCall() {
        trackEvent('phone_call', {
            event_category: 'contact',
            event_label: 'phone',
            value: 1,
            currency: 'QAR'
        });
    }

    // 2. WhatsApp Lead
    function trackWhatsApp() {
        trackEvent('whatsapp_click', {
            event_category: 'contact',
            event_label: 'whatsapp',
            value: 1,
            currency: 'QAR'
        });
    }

    // 3. Service Booking Click
    function trackServiceBooking(serviceName) {
        trackEvent('service_booking', {
            event_category: 'conversion',
            event_label: serviceName || 'general',
            value: 1,
            currency: 'QAR'
        });
    }

    // 4. Page View (Auto)
    function trackPageView() {
        trackEvent('page_view', {
            page_location: window.location.href,
            page_title: document.title,
            page_path: window.location.pathname
        });
    }

    // 5. Scroll Depth
    function trackScrollDepth() {
        let maxScroll = 0;
        const thresholds = [25, 50, 75, 100];
        let fired = {};

        window.addEventListener('scroll', function () {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                thresholds.forEach(function (t) {
                    if (maxScroll >= t && !fired[t]) {
                        fired[t] = true;
                        trackEvent('scroll_depth', {
                            event_category: 'engagement',
                            value: t,
                            non_interaction: true
                        });
                    }
                });
            }
        }, { passive: true });
    }

    // 6. Time on Page
    function trackTimeOnPage() {
        setTimeout(function () {
            trackEvent('time_30s', {
                event_category: 'engagement',
                value: 30,
                non_interaction: true
            });
        }, 30000);

        setTimeout(function () {
            trackEvent('time_60s', {
                event_category: 'engagement',
                value: 60,
                non_interaction: true
            });
        }, 60000);
    }

    // ==========================================
    // INITIALIZE ON DOM READY
    // ==========================================
    document.addEventListener('DOMContentLoaded', function () {

        // Track page view
        trackPageView();

        // Track scroll depth
        trackScrollDepth();

        // Track time on page
        trackTimeOnPage();

        // Phone call tracking
        document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
            link.addEventListener('click', trackPhoneCall);
        });

        // WhatsApp tracking
        document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]').forEach(function (link) {
            link.addEventListener('click', trackWhatsApp);
        });

        // Service booking tracking (all "Book Now" and "احجز الآن" buttons)
        document.querySelectorAll('.service-btn, .btn-secondary, .cta-banner .btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const serviceCard = btn.closest('.service-card');
                let serviceName = 'general';
                if (serviceCard) {
                    const titleEl = serviceCard.querySelector('h3');
                    if (titleEl) {
                        serviceName = titleEl.textContent.trim();
                    }
                }
                trackServiceBooking(serviceName);
            });
        });
    });

})();
