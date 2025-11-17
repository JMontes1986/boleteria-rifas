(function () {
    const indexPath = '/assets/sites/index.json';
    const siteList = document.getElementById('siteList');
    const siteListEmpty = document.getElementById('siteListEmpty');
    const siteDetailsSection = document.getElementById('siteDetailsSection');
    const siteDetails = document.getElementById('siteDetails');
    const siteDetailsTitle = document.getElementById('siteDetailsTitle');
    const copyIndexSnippetBtn = document.getElementById('copyIndexSnippet');

    const newSiteForm = document.getElementById('newSiteForm');
    const downloadConfigBtn = document.getElementById('downloadConfig');
    const copyConfigBtn = document.getElementById('copyConfig');
    const copyNewIndexBtn = document.getElementById('copyNewIndex');
    const resetFormBtn = document.getElementById('resetForm');

    const configPreview = document.getElementById('configPreview');
    const indexPreview = document.getElementById('indexPreview');
    const sqlPreview = document.getElementById('sqlPreview');
    const newSitePreview = document.getElementById('newSitePreview');
    const previewBadge = document.getElementById('previewBadge');

    const defaultColors = {
        background: '#0b1120',
        backgroundSoft: '#111827',
        card: '#0f172a',
        textMain: '#f9fafb',
        textMuted: '#9ca3af',
        border: '#1f2937',
        borderStrong: '#334155',
        panelBorder: 'rgba(148, 163, 184, 0.18)',
        panelBorderStrong: 'rgba(148, 163, 184, 0.28)',
        primary: '#22c55e',
        primaryHover: '#16a34a',
        accent: '#38bdf8',
        danger: '#f87171',
        warning: '#fbbf24',
        info: '#38bdf8',
        success: '#22c55e',
        successStrong: '#16a34a',
        shadow: '0 20px 40px rgba(15, 23, 42, 0.7)',
        surfaceStrong: 'rgba(15, 23, 42, 0.92)',
        surfaceSoft: 'rgba(15, 23, 42, 0.88)',
        surfaceOverlay: 'rgba(8, 11, 22, 0.9)',
        topbarBackground: 'rgba(15, 23, 42, 0.92)',
        topbarBackgroundLight: 'rgba(255, 255, 255, 0.88)',
        topbarBorder: 'rgba(148, 163, 184, 0.14)',
        topbarBorderLight: 'rgba(148, 163, 184, 0.25)',
        footerText: '#94a3b8',
        buttonText: '#0f172a',
        ticketAvailable: 'rgba(34, 197, 94, 0.18)',
        ticketAvailableStrong: 'rgba(34, 197, 94, 0.35)',
        ticketReserved: 'rgba(251, 191, 36, 0.18)',
        ticketReservedStrong: 'rgba(251, 191, 36, 0.35)',
        ticketSold: 'rgba(248, 113, 113, 0.22)',
        ticketSoldStrong: 'rgba(248, 113, 113, 0.45)',
        ticketHoverShadow: '0 10px 18px rgba(2, 6, 23, 0.65)',
        backgroundGradient: 'radial-gradient(circle at top, #111827 0, #0b1120 40%, #020617 100%)'
    };

    const defaultTypography = {
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        headingFont: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    };

    const state = {
        sites: [],
        selectedSite: null,
        generatedConfig: null,
        generatedIndexSnippet: null
    };

    function safeSlug(value) {
        return (value || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    function normalizeBasePath(basePath, slug) {
        const trimmed = (basePath || '').trim();
        if (!trimmed) {
            return slug === 'default' ? '/' : `/${slug}`;
        }
        if (!trimmed.startsWith('/')) {
            return `/${trimmed}`;
        }
        return trimmed.replace(/\/$/, '') || '/';
    }

    function setEmptyState(isEmpty) {
        siteListEmpty.style.display = isEmpty ? 'block' : 'none';
        siteList.style.display = isEmpty ? 'none' : 'grid';
    }

    function createMetaBlock(label, value) {
        const div = document.createElement('div');
        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        const strongEl = document.createElement('strong');
        strongEl.textContent = value;
        div.appendChild(labelEl);
        div.appendChild(strongEl);
        return div;
    }

    function showSiteDetails(site, config) {
        siteDetailsSection.style.display = 'block';
        siteDetailsTitle.textContent = `${site.name} (${site.id})`;

        const metadataGrid = document.createElement('div');
        metadataGrid.className = 'metadata-grid';
        metadataGrid.appendChild(createMetaBlock('Base path', site.basePath));
        metadataGrid.appendChild(createMetaBlock('Archivo de config', site.config));
        metadataGrid.appendChild(createMetaBlock('Hero', config?.branding?.heroTitle || '—'));
        metadataGrid.appendChild(createMetaBlock('Logo', config?.assets?.logo || '—'));

        const detailCard = document.createElement('div');
        detailCard.className = 'admin-hub-card';
        const subtitle = config?.branding?.heroSubtitle || 'Sin descripción definida';
        detailCard.innerHTML = `
            <p class="eyebrow">Marca & textos</p>
            <h3 class="card-title">${config?.branding?.heroTitle || site.name}</h3>
            <p class="card-subtitle">${subtitle}</p>
            <div class="metadata-grid" style="margin-top: 12px;">
                <div><span>Título topbar</span><strong>${config?.branding?.topbarTitle || '—'}</strong></div>
                <div><span>Subtítulo topbar</span><strong>${config?.branding?.topbarSubtitle || '—'}</strong></div>
                <div><span>Assets base</span><strong>${config?.assets?.basePath || '—'}</strong></div>
                <div><span>Tipografía</span><strong>${config?.typography?.fontFamily || '—'}</strong></div>
            </div>
        `;

        const indexSnippet = JSON.stringify({
            id: site.id,
            name: site.name,
            basePath: site.basePath,
            config: site.config
        }, null, 2);

        copyIndexSnippetBtn.dataset.snippet = indexSnippet;
        copyIndexSnippetBtn.style.display = 'inline-flex';

        const codeBlock = document.createElement('pre');
        codeBlock.className = 'code-block';
        codeBlock.textContent = `// Extracto de config\n${JSON.stringify(config, null, 2)}`;

        const sqlBlock = document.createElement('pre');
        sqlBlock.className = 'code-block';
        sqlBlock.textContent = buildSqlSnippet(site.id);

        siteDetails.innerHTML = '';
        const metaWrapper = document.createElement('div');
        metaWrapper.appendChild(metadataGrid);
        siteDetails.appendChild(metaWrapper);
        siteDetails.appendChild(detailCard);
        siteDetails.appendChild(codeBlock);
        siteDetails.appendChild(sqlBlock);
    }

    function buildSqlSnippet(slug) {
        return `-- Inserta la configuración base\ninsert into public.configuracion_sistema (sitio_slug, id, total_boletas, precio_boleta, actualizado_por, fecha_actualizacion)\nvalues ('${slug}', 1, 1000, 10000, 'admin', now())\non conflict (sitio_slug, id) do update\nset total_boletas = excluded.total_boletas,\n    precio_boleta = excluded.precio_boleta,\n    actualizado_por = excluded.actualizado_por,\n    fecha_actualizacion = excluded.fecha_actualizacion;\n\n-- Administrador inicial\ninsert into public.administradores (username, password_hash, sitio_slug)\nvalues ('admin_${slug}', '<hash-sha256>', '${slug}')\non conflict (sitio_slug, username) do update set password_hash = excluded.password_hash;\n\n-- Vendedor base (opcional)\ninsert into public.vendedores (nombre, username, password_hash, sitio_slug)\nvalues ('Vendedor demo', 'vendedor_${slug}', '<hash-sha256>', '${slug}')\non conflict (sitio_slug, username) do update set password_hash = excluded.password_hash;`;
    }

    async function fetchConfig(path) {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`No se pudo cargar ${path}: ${response.status}`);
        }
        return response.json();
    }

    async function viewSite(site) {
        siteDetailsSection.style.display = 'block';
        siteDetailsTitle.textContent = 'Cargando configuración...';
        siteDetails.innerHTML = '<div class="empty-state">Leyendo config.json...</div>';
        copyIndexSnippetBtn.style.display = 'none';

        try {
            const config = await fetchConfig(site.config);
            state.selectedSite = { ...site, config };
            showSiteDetails(site, config);
        } catch (error) {
            siteDetails.innerHTML = `<div class="empty-state">${error.message}</div>`;
            siteDetailsTitle.textContent = 'No se pudo cargar la configuración';
            console.error(error);
        }
    }

    function renderSites(sites) {
        siteList.innerHTML = '';
        if (!sites || sites.length === 0) {
            setEmptyState(true);
            return;
        }

        setEmptyState(false);
        sites.forEach(site => {
            const card = document.createElement('div');
            card.className = 'admin-hub-card';

            card.innerHTML = `
                <div class="section-header" style="margin-bottom: 8px;">
                    <div>
                        <p class="eyebrow">${site.id}</p>
                        <h3 class="card-title">${site.name}</h3>
                        <p class="card-subtitle">${site.basePath}</p>
                    </div>
                    <span class="badge">${site.config}</span>
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" data-action="view">Ver detalles</button>
                    <a class="btn btn-secondary" href="${site.basePath}" target="_blank" rel="noreferrer">Abrir sitio</a>
                </div>
            `;

            const viewBtn = card.querySelector('[data-action="view"]');
            viewBtn.addEventListener('click', () => viewSite(site));
            siteList.appendChild(card);
        });
    }

    async function loadSites() {
        siteList.innerHTML = '<div class="empty-state">Cargando sitios...</div>';
        setEmptyState(false);
        siteListEmpty.textContent = 'No se encontraron sitios en el índice.';
        try {
            const response = await fetch(indexPath, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`No se pudo cargar el índice (${response.status})`);
            }
            const index = await response.json();
            state.sites = index.sites || [];
            renderSites(state.sites);
        } catch (error) {
            siteListEmpty.textContent = error.message;
            setEmptyState(true);
            console.error(error);
        }
    }

    function buildConfigFromForm(formValues) {
        const slug = safeSlug(formValues.slug);
        const name = formValues.name || slug;
        const basePath = normalizeBasePath(formValues.basePath, slug);

        const branding = {
            documentTitle: name,
            topbarTitle: formValues.topbarTitle || name,
            topbarSubtitle: formValues.topbarSubtitle || 'Panel personalizado',
            heroTitle: formValues.heroTitle || name,
            heroSubtitle: formValues.heroSubtitle || 'Configura rifas, vendedores y ventas en minutos.',
            logoSymbol: formValues.logoSymbol || '🎟️'
        };

        return {
            id: slug,
            name,
            basePath,
            branding,
            colors: { ...defaultColors },
            typography: { ...defaultTypography },
            assets: {
                basePath: `/assets/sites/${slug}`,
                heroImage: 'hero.svg',
                logo: 'logo.svg'
            }
        };
    }

    function onGenerateConfig(event) {
        event.preventDefault();
        const slug = safeSlug(document.getElementById('siteSlug').value);
        const name = document.getElementById('siteName').value.trim();
        const basePathInput = document.getElementById('siteBasePath').value;

        if (!slug) {
            alert('Ingresa un slug válido (letras, números o guiones).');
            return;
        }

        if (!/^[a-z0-9-]+$/.test(slug)) {
            alert('El slug solo puede contener letras minúsculas, números y guiones.');
            return;
        }

        const config = buildConfigFromForm({
            slug,
            name,
            basePath: basePathInput,
            heroTitle: document.getElementById('heroTitle').value.trim(),
            heroSubtitle: document.getElementById('heroSubtitle').value.trim(),
            topbarTitle: document.getElementById('topbarTitle').value.trim(),
            topbarSubtitle: document.getElementById('topbarSubtitle').value.trim(),
            logoSymbol: document.getElementById('logoSymbol').value.trim()
        });

        const indexEntry = {
            id: config.id,
            name: config.name,
            basePath: config.basePath,
            config: `/assets/sites/${config.id}/config.json`
        };

        state.generatedConfig = config;
        state.generatedIndexSnippet = JSON.stringify(indexEntry, null, 2);

        configPreview.textContent = JSON.stringify(config, null, 2);
        indexPreview.textContent = state.generatedIndexSnippet;
        sqlPreview.textContent = buildSqlSnippet(config.id);
        newSitePreview.style.display = 'block';
        previewBadge.textContent = 'Listo para descargar';

        downloadConfigBtn.disabled = false;
        copyConfigBtn.disabled = false;
        copyNewIndexBtn.disabled = false;
    }

    function resetForm() {
        newSiteForm.reset();
        newSitePreview.style.display = 'none';
        downloadConfigBtn.disabled = true;
        copyConfigBtn.disabled = true;
        copyNewIndexBtn.disabled = true;
        state.generatedConfig = null;
        state.generatedIndexSnippet = null;
    }

    function downloadConfig() {
        if (!state.generatedConfig) return;
        const blob = new Blob([JSON.stringify(state.generatedConfig, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${state.generatedConfig.id}-config.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    async function copyText(text, label) {
        try {
            await navigator.clipboard.writeText(text);
            previewBadge.textContent = `${label} copiado`;
            setTimeout(() => {
                previewBadge.textContent = 'Listo para descargar';
            }, 1400);
        } catch (error) {
            alert('No se pudo copiar el contenido');
            console.error(error);
        }
    }

    function setupEvents() {
        document.getElementById('reloadSites')?.addEventListener('click', loadSites);
        copyIndexSnippetBtn?.addEventListener('click', () => {
            const snippet = copyIndexSnippetBtn.dataset.snippet;
            if (snippet) {
                copyText(snippet, 'Entrada');
            }
        });

        newSiteForm?.addEventListener('submit', onGenerateConfig);
        resetFormBtn?.addEventListener('click', resetForm);
        downloadConfigBtn?.addEventListener('click', downloadConfig);
        copyConfigBtn?.addEventListener('click', () => {
            if (state.generatedConfig) {
                copyText(JSON.stringify(state.generatedConfig, null, 2), 'Config');
            }
        });
        copyNewIndexBtn?.addEventListener('click', () => {
            if (state.generatedIndexSnippet) {
                copyText(state.generatedIndexSnippet, 'Index');
            }
        });
    }

    setupEvents();
    loadSites();
})();
