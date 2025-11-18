(function () {
    const indexPath = '/assets/sites/index.json';
    const siteList = document.getElementById('siteList');
    const siteListEmpty = document.getElementById('siteListEmpty');
    const siteDetailsSection = document.getElementById('siteDetailsSection');
    const siteDetails = document.getElementById('siteDetails');
    const siteDetailsTitle = document.getElementById('siteDetailsTitle');
    const copyIndexSnippetBtn = document.getElementById('copyIndexSnippet');
    const siteActions = document.getElementById('siteActions');
    const reloadSitesSecondary = document.getElementById('reloadSitesSecondary');

    const indexChangesSection = document.getElementById('indexChangesSection');
    const indexFullPreview = document.getElementById('indexFullPreview');
    const indexChangesBadge = document.getElementById('indexChangesBadge');
    const copyIndexFullBtn = document.getElementById('copyIndexFull');
    const downloadIndexFullBtn = document.getElementById('downloadIndexFull');

    const newSiteForm = document.getElementById('newSiteForm');
    const downloadConfigBtn = document.getElementById('downloadConfig');
    const copyConfigBtn = document.getElementById('copyConfig');
    const copyNewIndexBtn = document.getElementById('copyNewIndex');
    const copyNewIndexShortcutBtn = document.getElementById('copyNewIndexShortcut');
    const resetFormBtn = document.getElementById('resetForm');

    const configPreview = document.getElementById('configPreview');
    const indexPreview = document.getElementById('indexPreview');
    const sqlPreview = document.getElementById('sqlPreview');
    const newSitePreview = document.getElementById('newSitePreview');
    const previewBadge = document.getElementById('previewBadge');

    const accessSiteSelector = document.getElementById('accessSiteSelector');
    const clearAccessBtn = document.getElementById('clearAccess');
    const adminForm = document.getElementById('adminForm');
    const adminUsernameInput = document.getElementById('adminUsername');
    const adminRoleInput = document.getElementById('adminRole');
    const adminContactInput = document.getElementById('adminContact');
    const adminList = document.getElementById('adminList');
    const adminBadge = document.getElementById('adminBadge');
    const copyAdminsBtn = document.getElementById('copyAdmins');
    const userForm = document.getElementById('userForm');
    const userUsernameInput = document.getElementById('userUsername');
    const userNameInput = document.getElementById('userName');
    const userRoleInput = document.getElementById('userRole');
    const userList = document.getElementById('userList');
    const userBadge = document.getElementById('userBadge');
    const copyUsersBtn = document.getElementById('copyUsers');
    const copyAccessResumeBtn = document.getElementById('copyAccessResume');
    
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
        generatedIndexSnippet: null,
        indexChanged: false,
        adminsBySite: {},
        usersBySite: {}
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

    function ensureAccessSite(siteId) {
        if (!siteId) return;
        if (!state.adminsBySite[siteId]) {
            state.adminsBySite[siteId] = [];
        }
        if (!state.usersBySite[siteId]) {
            state.usersBySite[siteId] = [];
        }
    }

    function getActiveAccessSite() {
        const selectorValue = accessSiteSelector?.value;
        if (selectorValue) return selectorValue;
        return state.sites?.[0]?.id || '';
    }

    function populateAccessSelector() {
        if (!accessSiteSelector) return;
        const previous = accessSiteSelector.value;
        accessSiteSelector.innerHTML = '';

        if (!state.sites || state.sites.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Sin sitios cargados';
            accessSiteSelector.appendChild(option);
            renderAccessLists('');
            return;
        }

        state.sites.forEach((site, index) => {
            const option = document.createElement('option');
            option.value = site.id;
            option.textContent = `${site.name} (${site.id})`;
            if (previous ? site.id === previous : index === 0) {
                option.selected = true;
            }
            accessSiteSelector.appendChild(option);
            ensureAccessSite(site.id);
        });

        renderAccessLists(getActiveAccessSite());
    }

    function ensureAccessOption(siteId, siteName) {
        if (!accessSiteSelector || !siteId) return;
        const exists = Array.from(accessSiteSelector.options || []).some((opt) => opt.value === siteId);
        if (exists) return;
        const option = document.createElement('option');
        option.value = siteId;
        option.textContent = `${siteName || siteId} (${siteId})`;
        accessSiteSelector.appendChild(option);
        if (!accessSiteSelector.value) {
            accessSiteSelector.value = siteId;
        }
        ensureAccessSite(siteId);
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

    function renderAccessList(container, items, emptyMessage, type, siteId) {
        if (!container) return;
        container.innerHTML = '';

        if (!items || items.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = emptyMessage;
            container.appendChild(empty);
            return;
        }

        items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'access-row';

            const main = document.createElement('div');
            main.className = 'access-row-main';
            const title = document.createElement('strong');
            title.textContent = item.username;
            const meta = document.createElement('p');
            meta.textContent = item.role || item.name || '';
            const extra = document.createElement('small');
            extra.textContent = item.contact || item.name || '';
            main.appendChild(title);
            if (meta.textContent) main.appendChild(meta);
            if (extra.textContent && extra.textContent !== meta.textContent) {
                main.appendChild(extra);
            }

            const actions = document.createElement('div');
            actions.className = 'access-row-actions';
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-ghost';
            removeBtn.textContent = 'Eliminar';
            removeBtn.addEventListener('click', () => removeAccessEntry(type, index, siteId));
            actions.appendChild(removeBtn);

            row.appendChild(main);
            row.appendChild(actions);
            container.appendChild(row);
        });
    }

    function refreshAccessBadges(siteId) {
        const admins = state.adminsBySite[siteId] || [];
        const users = state.usersBySite[siteId] || [];
        if (adminBadge) {
            adminBadge.textContent = `${admins.length} asignados`;
        }
        if (userBadge) {
            userBadge.textContent = `${users.length} registrados`;
        }
    }

    function renderAccessLists(siteId) {
        ensureAccessSite(siteId);
        const admins = state.adminsBySite[siteId] || [];
        const users = state.usersBySite[siteId] || [];

        renderAccessList(adminList, admins, 'Sin administradores definidos', 'admin', siteId);
        renderAccessList(userList, users, 'Sin usuarios registrados', 'user', siteId);
        refreshAccessBadges(siteId);

        if (copyAccessResumeBtn) {
            copyAccessResumeBtn.disabled = !siteId || (admins.length === 0 && users.length === 0);
        }
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

        renderSiteActions(site, config);
    }

    function removeAccessEntry(type, index, siteId) {
        if (!siteId) return;
        if (type === 'admin') {
            state.adminsBySite[siteId]?.splice(index, 1);
        } else {
            state.usersBySite[siteId]?.splice(index, 1);
        }
        renderAccessLists(siteId);
    }

    function addAccessEntry(type, payload) {
        const siteId = getActiveAccessSite();
        if (!siteId) {
            alert('Selecciona un sitio para guardar las credenciales.');
            return;
        }
        ensureAccessSite(siteId);
        const target = type === 'admin' ? state.adminsBySite[siteId] : state.usersBySite[siteId];
        target.push(payload);
        renderAccessLists(siteId);
    }

    function copyAccessList(type) {
        const siteId = getActiveAccessSite();
        if (!siteId) return;
        const list = type === 'admin' ? state.adminsBySite[siteId] : state.usersBySite[siteId];
        if (!list || list.length === 0) return;
        const badge = type === 'admin' ? adminBadge : userBadge;
        const reset = type === 'admin' ? '0 asignados' : '0 registrados';
        copyText(JSON.stringify(list, null, 2), `${type === 'admin' ? 'Admins' : 'Usuarios'} copiados`, badge, reset);
    }

    function buildAccessResume(siteId) {
        const admins = state.adminsBySite[siteId] || [];
        const users = state.usersBySite[siteId] || [];
        const lines = [`Sitio: ${siteId}`, '', 'Administradores:'];
        if (admins.length === 0) {
            lines.push('- Ninguno');
        } else {
            admins.forEach((admin) => {
                lines.push(`- ${admin.username} (${admin.role || 'sin rol'}) ${admin.contact ? '- ' + admin.contact : ''}`);
            });
        }
        lines.push('', 'Usuarios:');
        if (users.length === 0) {
            lines.push('- Ninguno');
        } else {
            users.forEach((user) => {
                lines.push(`- ${user.username} (${user.name || 'sin nombre'}) ${user.role ? '- ' + user.role : ''}`);
            });
        }
        return lines.join('\n');
    }

    function handleCopyAccessResume() {
        const siteId = getActiveAccessSite();
        if (!siteId) return;
        const resume = buildAccessResume(siteId);
        const resetLabel = copyAccessResumeBtn?.textContent || 'Copiar resumen';
        copyText(resume, 'Resumen copiado', copyAccessResumeBtn, resetLabel);
    }

    function clearAccessListsForSite() {
        const siteId = getActiveAccessSite();
        if (!siteId) return;
        state.adminsBySite[siteId] = [];
        state.usersBySite[siteId] = [];
        renderAccessLists(siteId);
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
        if (siteActions) {
            siteActions.style.display = 'none';
        }

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
                <div class="pill-row" style="margin-bottom: 10px;">
                    <span class="pill">BasePath</span>
                    <span class="pill">${site.basePath}</span>
                    <span class="pill">Config local</span>
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" data-action="view">Ver detalles</button>
                    <a class="btn btn-secondary" href="${site.basePath}" target="_blank" rel="noreferrer">Abrir sitio</a>
                    <button class="btn btn-ghost" data-action="copy">Copiar slug</button>
                    <button class="btn btn-danger" data-action="delete">Eliminar del índice</button>
                </div>
            `;

            const viewBtn = card.querySelector('[data-action="view"]');
            viewBtn.addEventListener('click', () => viewSite(site));
            card.querySelector('[data-action="copy"]').addEventListener('click', () => copyText(site.id, 'Slug copiado', indexChangesBadge, indexChangesBadge?.textContent || 'Sin cambios pendientes'));
            card.querySelector('[data-action="delete"]').addEventListener('click', () => removeSiteFromIndex(site.id));
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
            state.indexChanged = false;
            renderSites(state.sites);
            refreshIndexPreview();
            populateAccessSelector();
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
        if (copyNewIndexShortcutBtn) {
            copyNewIndexShortcutBtn.disabled = false;
        }

        ensureAccessOption(config.id, config.name);
        if (accessSiteSelector) {
            accessSiteSelector.value = config.id;
        }
        renderAccessLists(config.id);
    }

    function resetForm() {
        newSiteForm.reset();
        newSitePreview.style.display = 'none';
        downloadConfigBtn.disabled = true;
        copyConfigBtn.disabled = true;
        copyNewIndexBtn.disabled = true;
        if (copyNewIndexShortcutBtn) {
            copyNewIndexShortcutBtn.disabled = true;
        }
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

    async function copyText(text, label, badgeEl = previewBadge, resetLabel = 'Listo para descargar') {
        try {
            await navigator.clipboard.writeText(text);
            if (badgeEl) {
                badgeEl.textContent = label;
                setTimeout(() => {
                    badgeEl.textContent = resetLabel;
                }, 1400);
            }
        } catch (error) {
            alert('No se pudo copiar el contenido');
            console.error(error);
        }
    }

    function renderSiteActions(site) {
        if (!siteActions) return;
        siteActions.style.display = 'grid';

        siteActions.innerHTML = `
            <div class="action-grid">
                <div class="action-card">
                    <p class="eyebrow">Acciones rápidas</p>
                    <div class="pill-row">
                        <span class="pill">${site.basePath}</span>
                        <span class="pill">${site.config}</span>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-secondary" data-action="copy-base">Copiar basePath</button>
                        <button class="btn btn-ghost" data-action="copy-config">Copiar ruta config</button>
                    </div>
                </div>
                <div class="action-card">
                    <p class="eyebrow">Mantenimiento</p>
                    <p>Elimina la entrada del índice o abre el sitio para validar contenido.</p>
                    <div class="form-actions">
                        <a class="btn btn-secondary" href="${site.basePath}" target="_blank" rel="noreferrer">Abrir sitio</a>
                        <button class="btn btn-danger" data-action="delete">Eliminar del índice</button>
                    </div>
                </div>
            </div>
        `;

        siteActions.querySelector('[data-action="copy-base"]').addEventListener('click', () => {
            copyText(site.basePath, 'BasePath copiado', indexChangesBadge, indexChangesBadge?.textContent || 'Sin cambios pendientes');
        });

        siteActions.querySelector('[data-action="copy-config"]').addEventListener('click', () => {
            copyText(site.config, 'Ruta copiada', indexChangesBadge, indexChangesBadge?.textContent || 'Sin cambios pendientes');
        });

        siteActions.querySelector('[data-action="delete"]').addEventListener('click', () => {
            removeSiteFromIndex(site.id);
        });
    }

    function markSitesAsChanged() {
        state.indexChanged = true;
        refreshIndexPreview(true);
    }

    function refreshIndexPreview(forceShow = false) {
        if (!indexFullPreview) return;
        const hasSites = state.sites && state.sites.length > 0;
        indexChangesSection.style.display = hasSites || forceShow ? 'block' : 'none';
        if (!hasSites) {
            indexFullPreview.textContent = '// No hay entradas para generar index.json';
            copyIndexFullBtn.disabled = true;
            downloadIndexFullBtn.disabled = true;
            if (indexChangesBadge) {
                indexChangesBadge.textContent = 'Sin sitios en el índice';
            }
            return;
        }

        const content = JSON.stringify({ sites: state.sites }, null, 2);
        indexFullPreview.textContent = content;
        copyIndexFullBtn.disabled = false;
        downloadIndexFullBtn.disabled = false;
        if (indexChangesBadge) {
            indexChangesBadge.textContent = state.indexChanged ? 'Cambios sin guardar' : 'Sin cambios pendientes';
        }
    }

    function downloadJson(content, filename) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    function removeSiteFromIndex(siteId) {
        const target = state.sites.find((entry) => entry.id === siteId);
        if (!target) return;
        const confirmed = confirm(`¿Deseas eliminar la entrada "${target.name}" del índice local?`);
        if (!confirmed) return;

        state.sites = state.sites.filter((entry) => entry.id !== siteId);
        renderSites(state.sites);
        markSitesAsChanged();

        if (state.selectedSite?.id === siteId) {
            state.selectedSite = null;
            siteDetailsTitle.textContent = 'Sitio eliminado del índice local';
            siteDetails.innerHTML = '<div class="empty-state">Selecciona otro sitio para continuar.</div>';
            copyIndexSnippetBtn.style.display = 'none';
            if (siteActions) {
                siteActions.style.display = 'none';
            }
        }
    }

    function setupEvents() {
        if (copyAccessResumeBtn) {
            copyAccessResumeBtn.disabled = true;
        }
        document.getElementById('reloadSites')?.addEventListener('click', loadSites);
        reloadSitesSecondary?.addEventListener('click', loadSites);
        copyIndexSnippetBtn?.addEventListener('click', () => {
            const snippet = copyIndexSnippetBtn.dataset.snippet;
            if (snippet) {
                copyText(snippet, 'Entrada copiada', indexChangesBadge, indexChangesBadge?.textContent || 'Sin cambios pendientes');
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
        copyNewIndexShortcutBtn?.addEventListener('click', () => {
            if (state.generatedIndexSnippet) {
                copyText(state.generatedIndexSnippet, 'Index');
            }
        });
        
        copyIndexFullBtn?.addEventListener('click', () => {
            copyText(indexFullPreview.textContent, 'index.json copiado', indexChangesBadge, 'Sin cambios pendientes');
        });

        downloadIndexFullBtn?.addEventListener('click', () => {
            downloadJson(indexFullPreview.textContent, 'index.json');
        });

        accessSiteSelector?.addEventListener('change', () => {
            renderAccessLists(getActiveAccessSite());
        });

        clearAccessBtn?.addEventListener('click', clearAccessListsForSite);

        adminForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = adminUsernameInput?.value.trim();
            const role = adminRoleInput?.value.trim();
            const contact = adminContactInput?.value.trim();
            if (!username || !role) {
                alert('Completa usuario y rol del administrador.');
                return;
            }
            addAccessEntry('admin', { username, role, contact });
            adminForm.reset();
        });

        userForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = userUsernameInput?.value.trim();
            const name = userNameInput?.value.trim();
            const role = userRoleInput?.value.trim();
            if (!username || !name) {
                alert('Completa usuario y nombre del operador.');
                return;
            }
            addAccessEntry('user', { username, name, role });
            userForm.reset();
        });

        copyAdminsBtn?.addEventListener('click', () => copyAccessList('admin'));
        copyUsersBtn?.addEventListener('click', () => copyAccessList('user'));
        copyAccessResumeBtn?.addEventListener('click', handleCopyAccessResume);
    }
    
    setupEvents();
    loadSites();
})();
