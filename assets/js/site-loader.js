(function setupSiteLoader() {
    const INDEX_PATH = '/assets/sites/index.json';

    async function fetchJson(path) {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`No se pudo cargar ${path}: ${response.status}`);
        }
        return response.json();
    }

    function normalizeBasePath(pathname) {
        const cleaned = pathname.replace(/\/+$/, '');
        const segments = cleaned.split('/').filter(Boolean);
        return segments.length ? `/${segments[0]}` : '/';
    }

    function applyColorPalette(colors = {}) {
        const root = document.documentElement;
        const colorMap = {
            '--bg': colors.background,
            '--bg-soft': colors.backgroundSoft,
            '--card': colors.card,
            '--text-main': colors.textMain,
            '--text-muted': colors.textMuted,
            '--border': colors.border,
            '--border-strong': colors.borderStrong,
            '--primary': colors.primary,
            '--primary-hover': colors.primaryHover || colors.primary,
            '--accent': colors.accent,
            '--shadow': colors.shadow
        };

        Object.entries(colorMap).forEach(([variable, value]) => {
            if (value) {
                root.style.setProperty(variable, value);
            }
        });

        if (colors.backgroundGradient) {
            document.body.style.background = colors.backgroundGradient;
        }
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
        const requestedBasePath = normalizeBasePath(window.location.pathname);
        const matched = Array.isArray(index.sites)
            ? index.sites.find(site => site.basePath === requestedBasePath)
            : null;

        if (!matched && requestedBasePath !== '/') {
            return { notFound: true, requestedBasePath, index };
        }

        const target = matched || (Array.isArray(index.sites) ? index.sites.find(site => site.basePath === '/') : null);
        if (!target) {
            return { notFound: true, requestedBasePath, index };
        }

        const config = await fetchJson(target.config);
        return { entry: target, config, index, requestedBasePath };
    }

    window.SiteLoader = {
        applyBranding,
        applyColorPalette,
        renderSiteNotFound,
        resolveSiteFromPath
    };
})();
