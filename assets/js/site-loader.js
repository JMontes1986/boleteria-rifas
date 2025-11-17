(function setupSiteLoader() {
    const INDEX_PATH = '/assets/sites/index.json';

    async function fetchJson(path) {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`No se pudo cargar ${path}: ${response.status}`);
        }
        return response.json();
    }

    function sanitizePathname(pathname) {
        const raw = typeof pathname === 'string' ? pathname : '/';
        const withoutQuery = raw.split('?')[0].split('#')[0];
        const withoutIndex = withoutQuery.replace(/\/index\.html?$/i, '');
        const trimmed = withoutIndex.replace(/\/+$/, '');
        return trimmed || '/';
    }

    function findSiteEntry(pathname, sites = []) {
        const normalizedPath = sanitizePathname(pathname);
        const entries = Array.isArray(sites) ? [...sites] : [];
        const sorted = entries.sort((a, b) => (b.basePath || '').length - (a.basePath || '').length);
        const match = sorted.find(site => {
            const base = sanitizePathname(site.basePath || '/');

            if (base === '/') {
                return normalizedPath === '/' || normalizedPath === '';
            }

            return normalizedPath === base || normalizedPath.startsWith(`${base}/`);
        });

        const fallback = sorted.find(site => sanitizePathname(site.basePath || '/') === '/');

        return { match, fallback, normalizedPath };
    }

    function applyColorPalette(colors = {}) {
        const paletteStyleId = 'site-color-palette';
        const colorMap = {
            '--bg': colors.background,
            '--bg-soft': colors.backgroundSoft,
            '--card': colors.card,
            '--text-main': colors.textMain,
            '--text-muted': colors.textMuted,
            '--border': colors.border,
            '--border-strong': colors.borderStrong,
            '--panel-border': colors.panelBorder,
            '--panel-border-strong': colors.panelBorderStrong,
            '--primary': colors.primary,
            '--primary-hover': colors.primaryHover || colors.primary,
            '--accent': colors.accent,
            '--danger': colors.danger,
            '--warning': colors.warning,
            '--info': colors.info,
            '--success': colors.success,
            '--success-strong': colors.successStrong || colors.success,
            ''--shadow': colors.shadow,
            '--surface-strong': colors.surfaceStrong,
            '--surface-soft': colors.surfaceSoft,
            '--surface-overlay': colors.surfaceOverlay,
            '--topbar-bg': colors.topbarBackground,
            '--topbar-bg-light': colors.topbarBackgroundLight,
            '--topbar-border': colors.topbarBorder,
            '--topbar-border-light': colors.topbarBorderLight,
            '--footer-text': colors.footerText,
            '--button-text': colors.buttonText,
            '--ticket-available': colors.ticketAvailable,
            '--ticket-available-strong': colors.ticketAvailableStrong,
            '--ticket-reserved': colors.ticketReserved,
            '--ticket-reserved-strong': colors.ticketReservedStrong,
            '--ticket-sold': colors.ticketSold,
            '--ticket-sold-strong': colors.ticketSoldStrong,
            '--ticket-hover-shadow': colors.ticketHoverShadow,
            '--background-gradient': colors.backgroundGradient
        };

        const declarations = Object.entries(colorMap)
            .filter(([, value]) => Boolean(value))
            .map(([variable, value]) => `    ${variable}: ${value};`)
            .join('\n');

        let paletteStyle = document.getElementById(paletteStyleId);
        if (!paletteStyle) {
            paletteStyle = document.createElement('style');
            paletteStyle.id = paletteStyleId;
            document.head.appendChild(paletteStyle);
        }

        if (!declarations) {
            paletteStyle.textContent = '';
            return;
        }

        paletteStyle.textContent = `:root[data-theme="dark"], :root:not([data-theme="light"]) {\n${declarations}\n}`;
    }

    function applyBranding(config = {}) {
        const branding = config.branding || {};
        const assets = config.assets || {};
        const resolvePath = (value) => {
            if (!value) return null;
            if (/^https?:\/\//.test(value)) return value;
            if (value.startsWith('/')) return value;

            const basePath = (assets.basePath || '').replace(/\/+$/, '');
            const normalizedValue = value.replace(/^\/+/, '');
            if (basePath) {
                return `${basePath}/${normalizedValue}`;
            }
            return `/${normalizedValue}`;
        };

        if (branding.documentTitle) {
            document.title = branding.documentTitle;
        } else if (branding.heroTitle) {
            document.title = `${branding.heroTitle} | ${document.title}`;
        }

        const topbarTitle = document.querySelector('.topbar-title');
        if (topbarTitle && branding.topbarTitle) {
            topbarTitle.textContent = branding.topbarTitle;
        }

        const topbarSubtitle = document.querySelector('.topbar-meta');
        if (topbarSubtitle && branding.topbarSubtitle) {
            topbarSubtitle.textContent = branding.topbarSubtitle;
        }

        const heroTitle = document.querySelector('.hero-card .card-title');
        if (heroTitle && branding.heroTitle) {
            heroTitle.textContent = branding.heroTitle;
        }

        const heroSubtitle = document.querySelector('.hero-card .card-subtitle');
        if (heroSubtitle && branding.heroSubtitle) {
            heroSubtitle.textContent = branding.heroSubtitle;
        }

        const heroCard = document.querySelector('.hero-card');
        const heroImage = resolvePath(assets.heroImage);
        if (heroCard && heroImage) {
            heroCard.style.backgroundImage = `linear-gradient(135deg, rgba(0,0,0,0.45), rgba(0,0,0,0.2)), url(${heroImage})`;
            heroCard.style.backgroundSize = 'cover';
            heroCard.style.backgroundPosition = 'center';
        }
        
        const logoMark = document.querySelector('.logo-mark');
        if (logoMark && branding.logoSymbol) {
            logoMark.textContent = branding.logoSymbol;
        }

        const logoImage = document.querySelector('.logo-image');
        const logoSrc = resolvePath(assets.logo || branding.logo);
        if (logoImage) {
            if (logoSrc) {
                logoImage.src = logoSrc;
                logoImage.alt = branding.logoAlt || branding.topbarTitle || 'Logo';
                logoImage.classList.add('is-visible');
                logoMark && logoMark.classList.add('hidden');
            } else {
                logoImage.removeAttribute('src');
                logoImage.classList.remove('is-visible');
                logoMark && logoMark.classList.remove('hidden');
            }
        }
    }

    function applyTypography(typography = {}) {
        const root = document.documentElement;
        if (typography.fontFamily) {
            root.style.setProperty('--font-body', typography.fontFamily);
        }
        if (typography.headingFont) {
            root.style.setProperty('--font-heading', typography.headingFont);
        }
    }

    function renderSiteNotFound(data) {
        const requested = data && data.requestedBasePath ? data.requestedBasePath : window.location.pathname;
        const availableSites = (data && data.index && Array.isArray(data.index.sites)) ? data.index.sites : [];
        const links = availableSites
            .map(site => `<li><strong>${site.name}</strong> — <code>${site.basePath}</code></li>`)
            .join('');

        document.body.innerHTML = `
            <main class="app-shell" style="max-width: 960px; margin: 48px auto; padding: 0 16px;">
                <section class="card hero-card" style="display: grid; gap: 12px;">
                    <h1 class="card-title">404 – Sitio no configurado</h1>
                    <p class="card-subtitle">No existe configuración para la ruta <strong>${requested}</strong>.</p>
                    ${links ? `<ul style="color: var(--text-muted); line-height: 1.6;">${links}</ul>` : ''}
                </section>
            </main>
        `;
    }

    async function resolveSiteFromPath() {
        const index = await fetchJson(INDEX_PATH);
        const { match, fallback, normalizedPath } = findSiteEntry(window.location.pathname, index.sites);

        const target = match || fallback;

        if (!target) {
            return { notFound: true, requestedBasePath: normalizedPath, index };
        }

        const config = await fetchJson(target.config);
        return { entry: target, config, index, requestedBasePath: normalizedPath };
    }

    window.SiteLoader = {
        applyBranding,
        applyColorPalette,
        applyTypography,
        renderSiteNotFound,
        resolveSiteFromPath
    };
})();
