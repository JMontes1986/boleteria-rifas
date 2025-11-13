// =========================
// CONFIGURACIÓN DE SEGURIDAD
// =========================

const SECURE_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 3,
    LOCKOUT_TIME: 5 * 60 * 1000, // 5 minutos
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
    MAX_SELLER_NAME_LENGTH: 100,
    MAX_USERNAME_LENGTH: 50
};

const THEME_STORAGE_KEY = 'boleteria-theme-preference';

// Estado de seguridad
let securityState = {
    loginAttempts: 0,
    blockedUntil: null,
    currentSession: null,
    securityLogs: [],
    activeSessions: 0,
    blockedAttempts: 0
};

// Variables globales
let supabaseClient;
let tickets = {};
let sellers = [];
let currentSellerData = null;
let captchaSolution = 0;
let vendorSession = { isAuthenticated: false, seller: null };
let realtimeInitialized = false;
let realtimeChannels = [];
let supabaseLibraryPendingLogged = false;

const AREA_CODES = [
    { code: '+1', country: 'Estados Unidos / Canadá' },
    { code: '+7', country: 'Rusia / Kazajistán' },
    { code: '+20', country: 'Egipto' },
    { code: '+27', country: 'Sudáfrica' },
    { code: '+30', country: 'Grecia' },
    { code: '+31', country: 'Países Bajos' },
    { code: '+32', country: 'Bélgica' },
    { code: '+33', country: 'Francia' },
    { code: '+34', country: 'España' },
    { code: '+36', country: 'Hungría' },
    { code: '+39', country: 'Italia' },
    { code: '+40', country: 'Rumania' },
    { code: '+41', country: 'Suiza' },
    { code: '+43', country: 'Austria' },
    { code: '+44', country: 'Reino Unido' },
    { code: '+45', country: 'Dinamarca' },
    { code: '+46', country: 'Suecia' },
    { code: '+47', country: 'Noruega' },
    { code: '+48', country: 'Polonia' },
    { code: '+49', country: 'Alemania' },
    { code: '+51', country: 'Perú' },
    { code: '+52', country: 'México' },
    { code: '+53', country: 'Cuba' },
    { code: '+54', country: 'Argentina' },
    { code: '+55', country: 'Brasil' },
    { code: '+56', country: 'Chile' },
    { code: '+57', country: 'Colombia' },
    { code: '+58', country: 'Venezuela' },
    { code: '+60', country: 'Malasia' },
    { code: '+61', country: 'Australia' },
    { code: '+62', country: 'Indonesia' },
    { code: '+63', country: 'Filipinas' },
    { code: '+64', country: 'Nueva Zelanda' },
    { code: '+65', country: 'Singapur' },
    { code: '+66', country: 'Tailandia' },
    { code: '+81', country: 'Japón' },
    { code: '+82', country: 'Corea del Sur' },
    { code: '+84', country: 'Vietnam' },
    { code: '+86', country: 'China' },
    { code: '+90', country: 'Turquía' },
    { code: '+91', country: 'India' },
    { code: '+92', country: 'Pakistán' },
    { code: '+93', country: 'Afganistán' },
    { code: '+94', country: 'Sri Lanka' },
    { code: '+95', country: 'Birmania' },
    { code: '+98', country: 'Irán' },
    { code: '+211', country: 'Sudán del Sur' },
    { code: '+212', country: 'Marruecos' },
    { code: '+213', country: 'Argelia' },
    { code: '+216', country: 'Túnez' },
    { code: '+218', country: 'Libia' },
    { code: '+220', country: 'Gambia' },
    { code: '+221', country: 'Senegal' },
    { code: '+222', country: 'Mauritania' },
    { code: '+223', country: 'Malí' },
    { code: '+224', country: 'Guinea' },
    { code: '+225', country: 'Costa de Marfil' },
    { code: '+226', country: 'Burkina Faso' },
    { code: '+227', country: 'Níger' },
    { code: '+228', country: 'Togo' },
    { code: '+229', country: 'Benín' },
    { code: '+230', country: 'Mauricio' },
    { code: '+231', country: 'Liberia' },
    { code: '+232', country: 'Sierra Leona' },
    { code: '+233', country: 'Ghana' },
    { code: '+234', country: 'Nigeria' },
    { code: '+235', country: 'Chad' },
    { code: '+236', country: 'República Centroafricana' },
    { code: '+237', country: 'Camerún' },
    { code: '+238', country: 'Cabo Verde' },
    { code: '+239', country: 'Santo Tomé y Príncipe' },
    { code: '+240', country: 'Guinea Ecuatorial' },
    { code: '+241', country: 'Gabón' },
    { code: '+242', country: 'República del Congo' },
    { code: '+243', country: 'República Democrática del Congo' },
    { code: '+244', country: 'Angola' },
    { code: '+245', country: 'Guinea-Bisáu' },
    { code: '+246', country: 'Territorio Británico del Océano Índico' },
    { code: '+248', country: 'Seychelles' },
    { code: '+249', country: 'Sudán' },
    { code: '+250', country: 'Ruanda' },
    { code: '+251', country: 'Etiopía' },
    { code: '+252', country: 'Somalia' },
    { code: '+253', country: 'Yibuti' },
    { code: '+254', country: 'Kenia' },
    { code: '+255', country: 'Tanzania' },
    { code: '+256', country: 'Uganda' },
    { code: '+257', country: 'Burundi' },
    { code: '+258', country: 'Mozambique' },
    { code: '+260', country: 'Zambia' },
    { code: '+261', country: 'Madagascar' },
    { code: '+262', country: 'Reunión' },
    { code: '+263', country: 'Zimbabue' },
    { code: '+264', country: 'Namibia' },
    { code: '+265', country: 'Malaui' },
    { code: '+266', country: 'Lesoto' },
    { code: '+267', country: 'Botsuana' },
    { code: '+268', country: 'Suazilandia' },
    { code: '+269', country: 'Comoras' },
    { code: '+290', country: 'Santa Elena' },
    { code: '+291', country: 'Eritrea' },
    { code: '+297', country: 'Aruba' },
    { code: '+298', country: 'Islas Feroe' },
    { code: '+299', country: 'Groenlandia' },
    { code: '+350', country: 'Gibraltar' },
    { code: '+351', country: 'Portugal' },
    { code: '+352', country: 'Luxemburgo' },
    { code: '+353', country: 'Irlanda' },
    { code: '+354', country: 'Islandia' },
    { code: '+355', country: 'Albania' },
    { code: '+356', country: 'Malta' },
    { code: '+357', country: 'Chipre' },
    { code: '+358', country: 'Finlandia' },
    { code: '+359', country: 'Bulgaria' },
    { code: '+370', country: 'Lituania' },
    { code: '+371', country: 'Letonia' },
    { code: '+372', country: 'Estonia' },
    { code: '+373', country: 'Moldavia' },
    { code: '+374', country: 'Armenia' },
    { code: '+375', country: 'Bielorrusia' },
    { code: '+376', country: 'Andorra' },
    { code: '+377', country: 'Mónaco' },
    { code: '+378', country: 'San Marino' },
    { code: '+379', country: 'Ciudad del Vaticano' },
    { code: '+380', country: 'Ucrania' },
    { code: '+381', country: 'Serbia' },
    { code: '+382', country: 'Montenegro' },
    { code: '+383', country: 'Kosovo' },
    { code: '+385', country: 'Croacia' },
    { code: '+386', country: 'Eslovenia' },
    { code: '+387', country: 'Bosnia y Herzegovina' },
    { code: '+389', country: 'Macedonia del Norte' },
    { code: '+420', country: 'República Checa' },
    { code: '+421', country: 'Eslovaquia' },
    { code: '+423', country: 'Liechtenstein' },
    { code: '+500', country: 'Islas Malvinas' },
    { code: '+501', country: 'Belice' },
    { code: '+502', country: 'Guatemala' },
    { code: '+503', country: 'El Salvador' },
    { code: '+504', country: 'Honduras' },
    { code: '+505', country: 'Nicaragua' },
    { code: '+506', country: 'Costa Rica' },
    { code: '+507', country: 'Panamá' },
    { code: '+508', country: 'San Pedro y Miquelón' },
    { code: '+509', country: 'Haití' },
    { code: '+590', country: 'Guadalupe' },
    { code: '+591', country: 'Bolivia' },
    { code: '+592', country: 'Guyana' },
    { code: '+593', country: 'Ecuador' },
    { code: '+594', country: 'Guayana Francesa' },
    { code: '+595', country: 'Paraguay' },
    { code: '+596', country: 'Martinica' },
    { code: '+597', country: 'Surinam' },
    { code: '+598', country: 'Uruguay' },
    { code: '+599', country: 'Antillas Neerlandesas' },
    { code: '+670', country: 'Timor Oriental' },
    { code: '+671', country: 'Guam' },
    { code: '+672', country: 'Territorios Externos de Australia' },
    { code: '+673', country: 'Brunéi' },
    { code: '+674', country: 'Nauru' },
    { code: '+675', country: 'Papúa Nueva Guinea' },
    { code: '+676', country: 'Tonga' },
    { code: '+677', country: 'Islas Salomón' },
    { code: '+678', country: 'Vanuatu' },
    { code: '+679', country: 'Fiyi' },
    { code: '+680', country: 'Palaos' },
    { code: '+681', country: 'Wallis y Futuna' },
    { code: '+682', country: 'Islas Cook' },
    { code: '+683', country: 'Niue' },
    { code: '+684', country: 'Samoa Americana' },
    { code: '+685', country: 'Samoa' },
    { code: '+686', country: 'Kiribati' },
    { code: '+687', country: 'Nueva Caledonia' },
    { code: '+688', country: 'Tuvalu' },
    { code: '+689', country: 'Polinesia Francesa' },
    { code: '+690', country: 'Tokelau' },
    { code: '+691', country: 'Micronesia' },
    { code: '+692', country: 'Islas Marshall' },
    { code: '+850', country: 'Corea del Norte' },
    { code: '+852', country: 'Hong Kong' },
    { code: '+853', country: 'Macao' },
    { code: '+855', country: 'Camboya' },
    { code: '+856', country: 'Laos' },
    { code: '+870', country: 'Inmarsat' },
    { code: '+880', country: 'Bangladés' },
    { code: '+886', country: 'Taiwán' },
    { code: '+960', country: 'Maldivas' },
    { code: '+961', country: 'Líbano' },
    { code: '+962', country: 'Jordania' },
    { code: '+963', country: 'Siria' },
    { code: '+964', country: 'Irak' },
    { code: '+965', country: 'Kuwait' },
    { code: '+966', country: 'Arabia Saudita' },
    { code: '+967', country: 'Yemen' },
    { code: '+968', country: 'Omán' },
    { code: '+970', country: 'Palestina' },
    { code: '+971', country: 'Emiratos Árabes Unidos' },
    { code: '+972', country: 'Israel' },
    { code: '+973', country: 'Baréin' },
    { code: '+974', country: 'Catar' },
    { code: '+975', country: 'Bután' },
    { code: '+976', country: 'Mongolia' },
    { code: '+977', country: 'Nepal' },
    { code: '+992', country: 'Tayikistán' },
    { code: '+993', country: 'Turkmenistán' },
    { code: '+994', country: 'Azerbaiyán' },
    { code: '+995', country: 'Georgia' },
    { code: '+996', country: 'Kirguistán' },
    { code: '+998', country: 'Uzbekistán' }
];

// NUEVA: Configuración del sistema
let systemConfig = {
    totalTickets: 1000,
    ticketPrice: 1000,
    configId: 1
};

// =========================
// FUNCIONES DE CONFIGURACIÓN DEL SISTEMA
// =========================

// Actualizar configuración del sistema
async function updateSystemConfig() {
    if (!validateSession()) {
        showAlert('Sesión expirada. Por favor, inicie sesión nuevamente.', 'warning');
        return;
    }

    const newTotalTickets = parseInt(document.getElementById('totalTicketsSelect').value);
    const newTicketPrice = parseInt(document.getElementById('ticketPriceInput').value);

    // Validaciones
    if (!newTotalTickets || ![100, 500, 1000].includes(newTotalTickets)) {
        showAlert('Cantidad de boletas inválida. Debe ser 100, 500 o 1000.', 'danger');
        return;
    }

    if (!newTicketPrice || newTicketPrice < 100 || newTicketPrice > 100000) {
        showAlert('Precio inválido. Debe estar entre $100 y $100,000.', 'danger');
        return;
    }

    // Verificar si hay cambios que requieran reinicio
    const ticketCountChanged = newTotalTickets !== systemConfig.totalTickets;
    const currentSoldTickets = Object.values(tickets).filter(t => t.estado === 'vendida').length;

    if (ticketCountChanged && currentSoldTickets > 0) {
        if (!confirm(`⚠️ ADVERTENCIA: Cambiar la cantidad de boletas reiniciará el sistema y eliminará todas las ventas actuales (${currentSoldTickets} boletas vendidas).\n\n¿Desea continuar?`)) {
            return;
        }
    }

    try {
        document.getElementById('updateConfigBtn').disabled = true;
        showAlert('Actualizando configuración del sistema...', 'info');

        const oldConfig = { ...systemConfig };

        // Actualizar configuración
        systemConfig.totalTickets = newTotalTickets;
        systemConfig.ticketPrice = newTicketPrice;

        // Guardar en Supabase si está disponible
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('configuracion_sistema')
                    .upsert({
                        id: 1,
                        total_boletas: newTotalTickets,
                        precio_boleta: newTicketPrice,
                        actualizado_por: securityState.currentSession.username,
                        fecha_actualizacion: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    })
                    .select();

                if (error) throw error;
                console.log('Configuración guardada en BD:', data);
            } catch (error) {
                console.warn('Error guardando en BD, continuando localmente:', error);
            }
        }

        // Si cambió el número de boletas, reinicializar
        if (ticketCountChanged) {
            await reinitializeTicketsWithNewCount();
        }

        // Actualizar todas las interfaces
        updateConfigDisplay();
        updateAllPriceDisplays();
        updateStats();

        const totalPossible = newTotalTickets * newTicketPrice;
        showAlert(`✅ Configuración actualizada: ${newTotalTickets} boletas a $${newTicketPrice.toLocaleString()} c/u (Total posible: $${totalPossible.toLocaleString()})`, 'success');
        logSecurityEvent('CONFIG_UPDATE', `Configuración actualizada: ${oldConfig.totalTickets}→${newTotalTickets} boletas, $${oldConfig.ticketPrice}→$${newTicketPrice}`);

    } catch (error) {
        console.error('Error actualizando configuración:', error);
        showAlert('Error actualizando configuración: ' + error.message, 'danger');

        // Revertir cambios en caso de error
        systemConfig.totalTickets = oldConfig.totalTickets;
        systemConfig.ticketPrice = oldConfig.ticketPrice;
        document.getElementById('totalTicketsSelect').value = oldConfig.totalTickets;
        document.getElementById('ticketPriceInput').value = oldConfig.ticketPrice;
        updateConfigDisplay();

    } finally {
        document.getElementById('updateConfigBtn').disabled = false;
    }
}

// Cargar configuración del sistema
async function loadSystemConfig() {
    try {
        showAlert('Cargando configuración del sistema...', 'info');

        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('configuracion_sistema')
                .select('*')
                .eq('id', 1)
                .single();

            if (data) {
                systemConfig = {
                    totalTickets: data.total_boletas || 1000,
                    ticketPrice: data.precio_boleta || 1000,
                    configId: data.id || 1
                };
                console.log('Configuración cargada desde BD:', systemConfig);
            } else {
                console.log('No hay configuración en BD, usando por defecto');
            }
        } else {
            console.log('Sin conexión BD, usando configuración por defecto');
        }

        // Actualizar interfaz
        document.getElementById('totalTicketsSelect').value = systemConfig.totalTickets;
        document.getElementById('ticketPriceInput').value = systemConfig.ticketPrice;
        updateConfigDisplay();
        updateAllPriceDisplays();

        showAlert('Configuración cargada correctamente', 'success');
        logSecurityEvent('CONFIG_LOAD', `Configuración cargada: ${systemConfig.totalTickets} boletas a $${systemConfig.ticketPrice}`);

    } catch (error) {
        console.error('Error cargando configuración:', error);
        showAlert('Error cargando configuración: ' + error.message, 'warning');
        updateConfigDisplay();
    }
}

// Reinicializar boletas con nueva cantidad
async function reinitializeTicketsWithNewCount() {
    try {
        showAlert(`Reinicializando sistema con ${systemConfig.totalTickets} boletas...`, 'info');

        if (supabaseClient) {
            // Limpiar boletas existentes
            const { error: deleteError } = await supabaseClient
                .from('boletas')
                .delete()
                .neq('numero', 0);

            if (deleteError) throw deleteError;

            // Crear nuevas boletas
            const boletasArray = [];
            for (let i = 1; i <= systemConfig.totalTickets; i++) {
                boletasArray.push({
                    numero: i,
                    estado: 'disponible',
                    vendedor: null,
                    fecha: null,
                    comprador: null,
                    celular: null
                });
            }

            // Insertar en lotes de 100
            for (let i = 0; i < boletasArray.length; i += 100) {
                const batch = boletasArray.slice(i, i + 100);
                const { error: insertError } = await supabaseClient
                    .from('boletas')
                    .insert(batch);

                if (insertError) throw insertError;
            }
        }

        // Actualizar datos locales
        tickets = {};
        for (let i = 1; i <= systemConfig.totalTickets; i++) {
            tickets[i] = {
                numero: i,
                estado: 'disponible',
                vendedor: null,
                 fecha: null,
                comprador: null,
                celular: null
            };
        }

        // Actualizar interfaces
        if (currentSellerData) {
            createTicketGrid();
        }
        updateStats();
        updateDashboard();

        showAlert(`✅ Sistema reinicializado con ${systemConfig.totalTickets} boletas`, 'success');
        logSecurityEvent('TICKETS_REINIT', `Sistema reinicializado con ${systemConfig.totalTickets} boletas`);

    } catch (error) {
        console.error('Error reinicializando boletas:', error);
        throw error;
    }
}

// Vista previa de cambios
function previewChanges() {
    const newTotalTickets = parseInt(document.getElementById('totalTicketsSelect').value);
    const newTicketPrice = parseInt(document.getElementById('ticketPriceInput').value);

    if (!newTotalTickets || !newTicketPrice) {
        showAlert('Complete todos los campos para ver la vista previa', 'warning');
        return;
    }

    const preview = document.getElementById('configPreview');
    const previewText = document.getElementById('previewText');

    const currentSold = Object.values(tickets).filter(t => t.estado === 'vendida').length;
    const newTotalPossible = newTotalTickets * newTicketPrice;
    const currentRevenue = currentSold * systemConfig.ticketPrice;
    const newRevenue = currentSold * newTicketPrice;

    let previewHTML = `
        <strong>Configuración Actual:</strong> ${systemConfig.totalTickets} boletas a $${systemConfig.ticketPrice.toLocaleString()} c/u<br>
        <strong>Nueva Configuración:</strong> ${newTotalTickets} boletas a $${newTicketPrice.toLocaleString()} c/u<br>
        <strong>Total Posible:</strong> $${newTotalPossible.toLocaleString()}<br>
    `;

    if (currentSold > 0) {
        previewHTML += `<strong>Boletas Vendidas:</strong> ${currentSold}<br>`;
        previewHTML += `<strong>Ingresos Actuales:</strong> $${currentRevenue.toLocaleString()}<br>`;
        previewHTML += `<strong>Nuevos Ingresos:</strong> $${newRevenue.toLocaleString()}<br>`;
    }

    if (newTotalTickets !== systemConfig.totalTickets) {
        previewHTML += `<br><span style="color: #dc3545;"><strong>⚠️ ADVERTENCIA:</strong> Cambiar la cantidad reiniciará todas las boletas</span>`;
    }

    previewText.innerHTML = previewHTML;
    preview.style.display = 'block';

    setTimeout(() => {
        preview.style.display = 'none';
    }, 10000);
}

// Actualizar display de configuración
function updateConfigDisplay() {
    const totalPossible = systemConfig.totalTickets * systemConfig.ticketPrice;
    document.getElementById('currentConfigDisplay').textContent = 
        `Boletas: ${systemConfig.totalTickets} | Precio: $${systemConfig.ticketPrice.toLocaleString()} c/u | Total posible: $${totalPossible.toLocaleString()}`;
}

// Actualizar todos los displays de precio
function updateAllPriceDisplays() {
    // Actualizar precio en sección de vendedores
    const currentPriceSpan = document.getElementById('currentPriceDisplay');
    if (currentPriceSpan) {
        currentPriceSpan.textContent = systemConfig.ticketPrice.toLocaleString();
    }

    // Actualizar total de boletas en dashboard
    const dashTotalSpan = document.getElementById('dashTotalTickets');
    if (dashTotalSpan) {
        dashTotalSpan.textContent = systemConfig.totalTickets;
    }

    updateStats();
}

// =========================
// FUNCIONES DE SEGURIDAD (ORIGINALES)
// =========================

// Sanitizar input para prevenir XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';

    return input
        .replace(/[<>]/g, '') // Remover brackets
        .replace(/javascript:/gi, '') // Remover javascript:
        .replace(/on\w+=/gi, '') // Remover event handlers
        .replace(/script/gi, '') // Remover script
        .trim()
        .substring(0, 1000); // Limitar longitud
}

function normalizeVendorUsername(input) {
    return sanitizeInput(input)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, SECURE_CONFIG.MAX_USERNAME_LENGTH);
}

async function hashPassword(password) {
    if (!password) return '';
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error('El navegador no soporta hashing seguro.');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Escape HTML para prevenir XSS
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        if (unsafe === null || unsafe === undefined) return '';
        unsafe = String(unsafe);
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatCurrency(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        const fallback = Number(value) || 0;
        return `$${Math.round(fallback).toLocaleString()}`;
    }
    return `$${Math.round(amount).toLocaleString()}`;
}

// Poblar lista de códigos de área
function populateAreaCodes() {
    const list = document.getElementById('areaCodeList');
    if (!list) return;
    list.innerHTML = '';
    AREA_CODES.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.code;
        opt.textContent = `${c.country} (${c.code})`;
        list.appendChild(opt);
    });
}

// Mostrar modal para ingresar celular
function promptPhoneNumber() {
    return new Promise(resolve => {
        const modal = document.getElementById('phoneModal');
        const areaInput = document.getElementById('modalAreaCode');
        const phoneInput = document.getElementById('modalPhone');
        const okBtn = document.getElementById('phoneModalOk');
        const cancelBtn = document.getElementById('phoneModalCancel');

        function close(result) {
            modal.classList.add('hidden');
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            resolve(result);
        }

        function onOk() {
            close({ area: areaInput.value, phone: phoneInput.value });
        }

        function onCancel() {
            close(null);
        }

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);

        areaInput.value = areaInput.value || '+57';
        phoneInput.value = '';
        modal.classList.remove('hidden');
        phoneInput.focus();
    });
}

// Generar CAPTCHA simple
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    captchaSolution = num1 + num2;
    document.getElementById('captchaQuestion').textContent = `¿Cuánto es ${num1} + ${num2}?`;
}

// Validar CAPTCHA
function validateCaptcha() {
    const userAnswer = parseInt(document.getElementById('captchaAnswer').value);
    return userAnswer === captchaSolution;
}

// Rate limiting para login
function isLoginAllowed() {
    if (securityState.blockedUntil && Date.now() < securityState.blockedUntil) {
        const remainingTime = Math.ceil((securityState.blockedUntil - Date.now()) / 1000);
        return { allowed: false, message: `Bloqueado por ${remainingTime} segundos` };
    }

    if (securityState.loginAttempts >= SECURE_CONFIG.MAX_LOGIN_ATTEMPTS) {
        securityState.blockedUntil = Date.now() + SECURE_CONFIG.LOCKOUT_TIME;
        securityState.blockedAttempts++;
        logSecurityEvent('ACCOUNT_LOCKED', 'Cuenta bloqueada por exceso de intentos');
        return { allowed: false, message: 'Cuenta bloqueada por 5 minutos' };
    }

    return { allowed: true };
}

// Generar token de sesión seguro
function generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Crear sesión segura
function createSecureSession(username) {
    const sessionToken = generateSecureToken();
    const sessionData = {
        token: sessionToken,
        username: username,
        loginTime: Date.now(),
        lastActivity: Date.now(),
        expiresAt: Date.now() + SECURE_CONFIG.SESSION_TIMEOUT
    };

    securityState.currentSession = sessionData;
    securityState.activeSessions = 1;
    updateSessionInfo();

    // Mostrar pestaña de seguridad para administradores
    toggleSecurityTab(true);

    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.style.display = 'inline-flex';
    }

    // Auto-logout después del timeout
    setTimeout(() => {
        if (securityState.currentSession && securityState.currentSession.token === sessionToken) {
            logout();
        }
    }, SECURE_CONFIG.SESSION_TIMEOUT);

    return sessionData;
}

// Validar sesión activa
function validateSession() {
    if (!securityState.currentSession) return false;

    if (Date.now() > securityState.currentSession.expiresAt) {
        logout();
        return false;
    }

    // Actualizar última actividad
    securityState.currentSession.lastActivity = Date.now();
    return true;
}

// Logout seguro
function logout() {
    if (securityState.currentSession) {
        logSecurityEvent('LOGOUT', `Usuario ${securityState.currentSession.username} cerró sesión`);
        securityState.currentSession = null;
        securityState.activeSessions = 0;
        document.getElementById('adminPanel').style.display = 'none';

        // Ocultar pestaña de seguridad
        toggleSecurityTab(false);

        const adminLogoutBtn = document.getElementById('adminLogoutBtn');
        if (adminLogoutBtn) {
            adminLogoutBtn.style.display = 'none';
        }

        const adminLoginSection = document.getElementById('adminLoginSection');
        if (adminLoginSection) {
            adminLoginSection.style.display = 'block';
        }

        const sessionUserLabel = document.getElementById('adminSessionUser');
        if (sessionUserLabel) {
            sessionUserLabel.textContent = 'administrador';
        }

        updateSessionInfo();
        showAlert('Sesión cerrada por seguridad', 'info');
    }
}

// Mostrar/ocultar pestaña de seguridad
function toggleSecurityTab(show) {
    const securityTab = document.getElementById('securityTab');
    if (show) {
        securityTab.classList.remove('hidden');
    } else {
        securityTab.classList.add('hidden');
        // Si está en la pestaña de seguridad, cambiar a dashboard
        if (document.getElementById('security').classList.contains('active')) {
            showTab('dashboard');
        }
    }
}

// Log de eventos de seguridad
function logSecurityEvent(type, message, level = 'INFO') {
    const logEntry = {
        timestamp: new Date().toISOString(),
        type: type,
        message: sanitizeInput(message),
        level: level,
        ip: 'CLIENT',
        userAgent: navigator.userAgent.substring(0, 100)
    };

    securityState.securityLogs.unshift(logEntry);

    // Mantener solo los últimos 100 logs
    if (securityState.securityLogs.length > 100) {
        securityState.securityLogs = securityState.securityLogs.slice(0, 100);
    }

    updateSecurityStats();
    updateSecurityLogs();

    if (level === 'WARNING' || level === 'ERROR') {
        console.warn('Security Event:', logEntry);
    }
}

// Actualizar información de sesión
function updateSessionInfo() {
    const sessionInfo = document.getElementById('sessionInfo');
    if (securityState.currentSession) {
        const timeLeft = Math.ceil((securityState.currentSession.expiresAt - Date.now()) / 60000);
        sessionInfo.textContent = `Sesión: ${securityState.currentSession.username} (${timeLeft}min)`;
    } else {
        sessionInfo.textContent = 'Sesión: No autenticado';
    }
}

// Actualizar estadísticas de seguridad
function updateSecurityStats() {
    document.getElementById('securityAttempts').textContent = securityState.loginAttempts;
    document.getElementById('securityBlocked').textContent = securityState.blockedAttempts;
    document.getElementById('securitySessions').textContent = securityState.activeSessions;
}

// Actualizar logs de seguridad
function updateSecurityLogs() {
    const logsList = document.getElementById('logsList');
    if (!logsList) return;

    let html = '';
    securityState.securityLogs.slice(0, 20).forEach(log => {
        const color = log.level === 'ERROR' ? '#dc3545' : 
                     log.level === 'WARNING' ? '#ffc107' : '#6c757d';

        html += `
            <div style="margin: 5px 0; padding: 8px; background: white; border-radius: 4px; border-left: 3px solid ${color};">
                <small style="color: ${color}; font-weight: bold;">[${log.type}]</small>
                <span style="color: #333;">${escapeHtml(log.message)}</span>
                <br><small style="color: #6c757d;">${new Date(log.timestamp).toLocaleString()}</small>
            </div>
        `;
    });

    logsList.innerHTML = html || '<p style="color: #6c757d;">No hay eventos de seguridad registrados.</p>';
}

// =========================
// FUNCIONES PRINCIPALES SECURIZADAS
// =========================

// Inicializar Supabase
function initSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }

    try {
        showAlert('🔒 Solicitando credenciales seguras al servidor...', 'info');

        const env = window.SECURE_ENV || {};
        const serviceUrl = env.serviceUrl;
        const anonKey = env.anonKey;

        if (!serviceUrl || !anonKey) {
            throw new Error('Credenciales de servicio no disponibles');
        }

        if (typeof supabase === 'undefined') {
            if (!supabaseLibraryPendingLogged) {
                logSecurityEvent('SUPABASE_PENDING', 'Librería externa aún no disponible. Esperando carga segura...', 'WARNING');
                supabaseLibraryPendingLogged = true;
            }
            return null;
        }

        const { createClient } = supabase;
        supabaseClient = createClient(serviceUrl, anonKey);
        supabaseLibraryPendingLogged = false;

        logSecurityEvent('SUPABASE_INIT', 'Cliente Supabase inicializado correctamente');
        loadInitialData();

        return supabaseClient;
    } catch (error) {
        logSecurityEvent('SUPABASE_ERROR', `Error inicializando Supabase: ${error.message}`, 'ERROR');
        showAlert('Error de conexión segura: ' + error.message, 'danger');
        return null;
    }
}

// Login de administrador SECURIZADO
async function loginAdmin() {
    const username = sanitizeInput(document.getElementById('adminUser').value);
    const password = document.getElementById('adminPass').value;

    if (!username || !password) {
        showAlert('Todos los campos son obligatorios', 'danger');
        return;
    }

    if (username.length > SECURE_CONFIG.MAX_USERNAME_LENGTH) {
        showAlert('Nombre de usuario demasiado largo', 'danger');
        return;
    }

    if (!validateCaptcha()) {
        showAlert('CAPTCHA incorrecto', 'danger');
        generateCaptcha();
        document.getElementById('captchaAnswer').value = '';
        return;
    }

    const loginCheck = isLoginAllowed();
    if (!loginCheck.allowed) {
        showAlert(loginCheck.message, 'warning');
        document.getElementById('loginAttempts').textContent = loginCheck.message;
        return;
    }

    try {
        document.getElementById('loginBtn').disabled = true;
        logSecurityEvent('LOGIN_ATTEMPT', `Intento de login para usuario: ${username}`);

        const isValidCredentials = await validateCredentialsSecurely(username, password);

        if (isValidCredentials) {
            securityState.loginAttempts = 0;
            document.getElementById('loginAttempts').textContent = '';

            const session = createSecureSession(username);
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('adminLoginSection').style.display = 'none';

            const sessionUserLabel = document.getElementById('adminSessionUser');
            if (sessionUserLabel) {
                sessionUserLabel.textContent = username;
            }

            showAlert('¡Login exitoso! Sesión segura iniciada', 'success');
            logSecurityEvent('LOGIN_SUCCESS', `Login exitoso para usuario: ${username}`, 'INFO');

            // Limpiar campos
            document.getElementById('adminUser').value = '';
            document.getElementById('adminPass').value = '';
            document.getElementById('captchaAnswer').value = '';
            generateCaptcha();

            // Cargar configuración y datos
            await loadSystemConfig();
            updateSellersList();
        } else {
            securityState.loginAttempts++;
            const remainingAttempts = SECURE_CONFIG.MAX_LOGIN_ATTEMPTS - securityState.loginAttempts;

            showAlert('Credenciales incorrectas', 'danger');
            document.getElementById('loginAttempts').textContent = 
                `Intentos restantes: ${remainingAttempts}`;

            logSecurityEvent('LOGIN_FAILED', `Login fallido para usuario: ${username}`, 'WARNING');

            generateCaptcha();
            document.getElementById('captchaAnswer').value = '';
        }

    } catch (error) {
        logSecurityEvent('LOGIN_ERROR', `Error en login: ${error.message}`, 'ERROR');
        showAlert('Error en el sistema de autenticación', 'danger');
    } finally {
        document.getElementById('loginBtn').disabled = false;
    }
}

// Validación segura de credenciales
async function validateCredentialsSecurely(username, password) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const client = initSupabase();

    if (!client) {
        logSecurityEvent('LOGIN_VALIDATION_ERROR', 'Cliente Supabase no disponible para validar credenciales', 'ERROR');
        return false;
    }

    try {
        const hashedPassword = await hashPassword(password);
        const { data, error } = await client
            .from('administradores')
            .select('password_hash')
            .eq('username', username)
            .limit(1);

        if (error) {
            logSecurityEvent('LOGIN_VALIDATION_ERROR', `Error consultando administrador: ${error.message}`, 'ERROR');
            return false;
        }

        if (!data || data.length === 0) {
            logSecurityEvent('LOGIN_INVALID_USER', `Usuario administrador no encontrado: ${username}`, 'WARNING');
            return false;
        }

        const isValid = data[0].password_hash === hashedPassword;

        if (!isValid) {
            logSecurityEvent('LOGIN_INVALID_PASSWORD', `Contraseña inválida para usuario administrador: ${username}`, 'WARNING');
        }

        return isValid;
    } catch (error) {
        logSecurityEvent('LOGIN_VALIDATION_EXCEPTION', `Fallo validando credenciales: ${error.message}`, 'ERROR');
        return false;
    }
}

// Agregar vendedor SECURIZADO
async function addSeller() {
    if (!validateSession()) {
        showAlert('Sesión expirada. Por favor, inicie sesión nuevamente.', 'warning');
        return;
    }

    const name = sanitizeInput(document.getElementById('sellerName').value);
    const password = document.getElementById('sellerPassword').value;
    const confirmPassword = document.getElementById('sellerPasswordConfirm').value;

    if (!name) {
        showAlert('Por favor ingrese un nombre válido', 'danger');
        return;
    }

    if (name.length > SECURE_CONFIG.MAX_SELLER_NAME_LENGTH) {
        showAlert('Nombre demasiado largo', 'danger');
        return;
    }

    const username = normalizeVendorUsername(name);
    if (!username) {
        showAlert('No se pudo generar un usuario válido. Use solo letras y números.', 'danger');
        return;
    }

    if (!password || password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres', 'danger');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'danger');
        return;
    }

    if (sellers.find(s => s.nombre.toLowerCase() === name.toLowerCase())) {
        showAlert('Este vendedor ya existe', 'danger');
        return;
    }

    if (sellers.find(s => s.username === username)) {
        showAlert('El usuario generado ya está en uso. Modifique el nombre.', 'danger');
        return;
    }

    try {
        document.getElementById('addSellerBtn').disabled = true;

        if (supabaseClient) {
            const passwordHash = await hashPassword(password);
            const { data, error } = await supabaseClient
                .from('vendedores')
                .insert([{ nombre: name, username, password_hash: passwordHash }])
                .select();

            if (error) throw error;

            document.getElementById('sellerName').value = '';
            document.getElementById('sellerPassword').value = '';
            document.getElementById('sellerPasswordConfirm').value = '';
            await loadSellers();
            showAlert(`Vendedor "${escapeHtml(name)}" agregado correctamente. Usuario: ${escapeHtml(username)}`, 'success');
            logSecurityEvent('SELLER_ADDED', `Vendedor agregado: ${name} (usuario: ${username})`);
        } else {
            showAlert('Sin conexión a base de datos', 'warning');
        }

    } catch (error) {
        logSecurityEvent('SELLER_ERROR', `Error agregando vendedor: ${error.message}`, 'ERROR');
        showAlert('Error agregando vendedor: ' + error.message, 'danger');
    } finally {
        document.getElementById('addSellerBtn').disabled = false;
    }
}

function setVendorLoginMessage(message, type = 'danger') {
    const el = document.getElementById('vendorLoginMessage');
    if (!el) return;
    let color = '#dc3545';
    if (type === 'success') {
        color = '#28a745';
    } else if (type === 'info') {
        color = '#0d6efd';
    }
    el.style.color = color;
    el.textContent = message || '';
}

function updateVendorUI() {
    const loginSection = document.getElementById('vendorLogin');
    const panel = document.getElementById('sellerPanel');
    const welcome = document.getElementById('sellerWelcome');
    const notice = document.getElementById('sellerReservationNotice');

    if (vendorSession.isAuthenticated && panel && loginSection) {
        loginSection.style.display = 'none';
        panel.style.display = 'block';
        if (welcome && vendorSession.seller) {
            welcome.textContent = `Bienvenido ${vendorSession.seller.nombre}`;
        }
        if (notice) {
            notice.style.display = 'none';
        }
    } else {
        if (loginSection) loginSection.style.display = 'block';
        if (panel) panel.style.display = 'none';
        if (welcome) welcome.textContent = 'Bienvenido';
        setVendorLoginMessage('');
    }
}

async function releaseVendorReservations(vendorName, { silent = false } = {}) {
    if (!supabaseClient || !vendorName) return 0;

    try {
        const { data, error } = await supabaseClient
            .from('boletas')
            .update({
                estado: 'disponible',
                vendedor: null,
                fecha: null,
                comprador: null,
                celular: null
            })
            .eq('estado', 'reservada')
            .eq('vendedor', vendorName)
            .select('numero');

        if (error) throw error;

        const released = data ? data.length : 0;
        if (released > 0) {
            logSecurityEvent('RESERVATION_RELEASE', `Reservas liberadas automáticamente para ${vendorName}: ${released}`);
            if (!silent) {
                showAlert(`Se liberaron ${released} boletas en proceso del vendedor ${vendorName}`, 'info');
            }
        }

        return released;
    } catch (error) {
        if (!silent) {
            showAlert('Error liberando reservas: ' + error.message, 'danger');
        }
        logSecurityEvent('RESERVATION_RELEASE_ERROR', `Error liberando reservas para ${vendorName}: ${error.message}`, 'ERROR');
        return 0;
    }
}

async function releaseReservation(ticketNumber, { silent = false } = {}) {
    if (!supabaseClient || !currentSellerData) return 0;

    try {
        const { data, error } = await supabaseClient
            .from('boletas')
            .update({
                estado: 'disponible',
                vendedor: null,
                fecha: null,
                comprador: null,
                celular: null
            })
            .eq('numero', ticketNumber)
            .eq('estado', 'reservada')
            .eq('vendedor', currentSellerData.nombre)
            .select();

        if (error) throw error;

        const released = data ? data.length : 0;
        if (released > 0) {
            tickets[ticketNumber] = {
                numero: ticketNumber,
                estado: 'disponible',
                vendedor: null,
                comprador: null,
                celular: null,
                fecha: null
            };
            updateTicketElements(ticketNumber);
            updateStats();
            updateSellersList();
            if (!silent) {
                showAlert(`Reserva de la boleta ${ticketNumber} liberada.`, 'info');
            }
            logSecurityEvent('TICKET_RESERVATION_CANCEL', `Reserva cancelada para boleta ${ticketNumber} por ${currentSellerData.nombre}`);
        }

        return released;
    } catch (error) {
        if (!silent) {
            showAlert('Error liberando reserva: ' + error.message, 'danger');
        }
        logSecurityEvent('TICKET_RESERVATION_CANCEL_ERROR', `Error cancelando reserva ${ticketNumber}: ${error.message}`, 'ERROR');
        return 0;
    }
}

async function loginVendor() {
    if (!supabaseClient) {
        setVendorLoginMessage('Sistema desconectado. Intente más tarde.');
        return;
    }

    const usernameInput = document.getElementById('vendorUsername');
    const passwordInput = document.getElementById('vendorPassword');
    const username = normalizeVendorUsername(usernameInput.value);
    const password = passwordInput.value;

    if (!username || !password) {
        setVendorLoginMessage('Ingrese usuario y contraseña válidos.');
        return;
    }

    try {
        document.getElementById('vendorLoginBtn').disabled = true;
        setVendorLoginMessage('Verificando credenciales...', 'info');

        const hashedPassword = await hashPassword(password);
        const { data, error } = await supabaseClient
            .from('vendedores')
            .select('id, nombre, username, password_hash')
            .eq('username', username)
            .limit(1);

        if (error) throw error;

        const record = Array.isArray(data) ? data[0] : data;

        if (!record || record.password_hash !== hashedPassword) {
            setVendorLoginMessage('Usuario o contraseña incorrectos.');
            logSecurityEvent('VENDOR_LOGIN_FAILED', `Intento fallido de vendedor: ${username}`, 'WARNING');
            return;
        }

        vendorSession = {
            isAuthenticated: true,
            seller: { id: record.id, nombre: record.nombre, username: record.username }
        };
        currentSellerData = vendorSession.seller;

        usernameInput.value = '';
        passwordInput.value = '';

        const released = await releaseVendorReservations(record.nombre, { silent: true });
        updateVendorUI();
        setVendorLoginMessage('');

        createTicketGrid();
        updateStats();
        showAlert(`Sesión iniciada para ${escapeHtml(record.nombre)}.`, 'success');
        logSecurityEvent('VENDOR_LOGIN', `Vendedor autenticado: ${record.nombre}`);

        if (released > 0) {
            const notice = document.getElementById('sellerReservationNotice');
            if (notice) {
                notice.textContent = `Se liberaron ${released} boletas que estaban en proceso en otra sesión.`;
                notice.style.display = 'block';
            }
        }

        await loadTickets();
    } catch (error) {
        setVendorLoginMessage('Error autenticando vendedor: ' + error.message);
        logSecurityEvent('VENDOR_LOGIN_ERROR', `Error autenticando vendedor ${username}: ${error.message}`, 'ERROR');
    } finally {
        document.getElementById('vendorLoginBtn').disabled = false;
    }
}

async function logoutVendor() {
    if (!vendorSession.isAuthenticated) {
        return;
    }

    const vendorName = vendorSession.seller ? vendorSession.seller.nombre : null;
    const released = await releaseVendorReservations(vendorName || '', { silent: true });

    vendorSession = { isAuthenticated: false, seller: null };
    currentSellerData = null;

    updateVendorUI();
    clearTicketForm();
    showAlert('Sesión de vendedor cerrada correctamente.', 'info');
    logSecurityEvent('VENDOR_LOGOUT', `Vendedor cerró sesión: ${vendorName || 'desconocido'}`);

    if (released > 0) {
        showAlert(`Se liberaron ${released} boletas que estaban en proceso.`, 'info');
    }
}

// =========================
// FUNCIONES PRINCIPALES
// =========================

// Inicializar aplicación
async function loadInitialData() {
    try {
        updateConnectionStatus('connected');
        await loadSellers();
        await loadTickets();
        await initializeTicketsIfNeeded();

        // Cargar configuración inicial
        await loadSystemConfig();

        setupRealtimeSubscriptions();

        showAlert('Sistema cargado con seguridad avanzada', 'success');
        logSecurityEvent('APP_INIT', 'Aplicación inicializada correctamente');
    } catch (error) {
        logSecurityEvent('APP_ERROR', `Error inicializando aplicación: ${error.message}`, 'ERROR');
        updateConnectionStatus('disconnected');
        showAlert('Error cargando la aplicación: ' + error.message, 'danger');
    }
}

// Cargar vendedores
async function loadSellers() {
    try {
        if (!supabaseClient) return;

        const { data, error } = await supabaseClient
            .from('vendedores')
            .select('id, nombre, username')
            .order('nombre');

        if (error) throw error;

        sellers = (data || []).map(seller => ({
            ...seller,
            username: seller.username || normalizeVendorUsername(seller.nombre)
        }));
        updateSellerDropdown();
        updateSellersList();
        logSecurityEvent('DATA_LOAD', 'Vendedores cargados correctamente');
    } catch (error) {
        logSecurityEvent('DATA_ERROR', `Error cargando vendedores: ${error.message}`, 'ERROR');
        showAlert('Error cargando vendedores: ' + error.message, 'danger');
    }
}

// Cargar boletas
async function loadTickets() {
    try {
        if (!supabaseClient) return;

        const { data, error } = await supabaseClient
            .from('boletas')
            .select('*')
            .order('numero');

        if (error) throw error;

        tickets = {};
        if (data) {
            data.forEach(ticket => {
                tickets[ticket.numero] = {
                    numero: ticket.numero,
                    estado: ticket.estado,
                    vendedor: ticket.vendedor,
                    fecha: ticket.fecha,
                    comprador: ticket.comprador || null,
                    celular: ticket.celular || null
                };
            });
        }

        updateStats();
        logSecurityEvent('DATA_LOAD', 'Boletas cargadas correctamente');
    } catch (error) {
        logSecurityEvent('DATA_ERROR', `Error cargando boletas: ${error.message}`, 'ERROR');
        showAlert('Error cargando boletas: ' + error.message, 'danger');
    }
}

function setupRealtimeSubscriptions() {
    if (!supabaseClient || realtimeInitialized) return;
    realtimeInitialized = true;

    const ticketsChannel = supabaseClient
        .channel('realtime-boletas')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'boletas' }, payload => {
            const data = payload.new || payload.old;
            if (!data) return;

            if (payload.eventType === 'DELETE') {
                tickets[data.numero] = {
                    numero: data.numero,
                    estado: 'disponible',
                    vendedor: null,
                    comprador: null,
                    celular: null,
                    fecha: null
                };
            } else {
                tickets[data.numero] = {
                    numero: data.numero,
                    estado: data.estado,
                    vendedor: data.vendedor,
                    comprador: data.comprador || null,
                    celular: data.celular || null,
                    fecha: data.fecha || null
                };
            }

            updateTicketElements(data.numero);
            updateStats();
            updateSellersList();
        })
        .subscribe(status => {
            if (status === 'SUBSCRIBED') {
                logSecurityEvent('REALTIME_SUBSCRIBED', 'Suscripción en tiempo real a boletas activa');
            }
        });

    realtimeChannels.push(ticketsChannel);

    const sellersChannel = supabaseClient
        .channel('realtime-vendedores')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vendedores' }, () => {
            loadSellers();
        })
        .subscribe();

    realtimeChannels.push(sellersChannel);
}

// Inicializar boletas si no existen
async function initializeTicketsIfNeeded() {
    try {
        const { count, error } = await supabaseClient
            .from('boletas')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;

        if (count === 0) {
            showAlert(`Inicializando ${systemConfig.totalTickets} boletas...`, 'info');

            const boletasArray = [];
            for (let i = 1; i <= systemConfig.totalTickets; i++) {
                boletasArray.push({
                    numero: i,
                    estado: 'disponible',
                    vendedor: null,
                    fecha: null,
                    comprador: null,
                    celular: null
                });
            }

            for (let i = 0; i < boletasArray.length; i += 100) {
                const batch = boletasArray.slice(i, i + 100);
                const { error: insertError } = await supabaseClient
                    .from('boletas')
                    .insert(batch);

                if (insertError) throw insertError;
            }

            await loadTickets();
            showAlert(`${systemConfig.totalTickets} boletas inicializadas correctamente`, 'success');
            logSecurityEvent('DATA_INIT', `${systemConfig.totalTickets} boletas inicializadas`);
        }
    } catch (error) {
        logSecurityEvent('DATA_ERROR', `Error inicializando boletas: ${error.message}`, 'ERROR');
        showAlert('Error inicializando boletas: ' + error.message, 'danger');
    }
}

// Alternar estado de boleta SECURIZADO
async function toggleTicketState(ticketNumber, options = {}) {
    const { buyerName, buyerPhone, saleValue, fromForm = false } = options;

    if (!vendorSession.isAuthenticated || !currentSellerData) {
        showAlert('Inicie sesión como vendedor para gestionar boletas.', 'danger');
        return;
    }

    if (ticketNumber < 1 || ticketNumber > systemConfig.totalTickets) {
        logSecurityEvent('INVALID_TICKET', `Intento de acceso a boleta inválida: ${ticketNumber}`, 'WARNING');
        showAlert(`Número de boleta inválido (1-${systemConfig.totalTickets})`, 'danger');
        return;
    }

    const sellerName = currentSellerData.nombre;
    const currentTicket = tickets[ticketNumber] || {
        numero: ticketNumber,
        estado: 'disponible',
        vendedor: null,
        comprador: null,
        celular: null,
        fecha: null
    };

    if (currentTicket.estado === 'vendida' && currentTicket.vendedor && currentTicket.vendedor !== sellerName) {
        showAlert(`La boleta ${ticketNumber} ya fue vendida por ${currentTicket.vendedor}.`, 'warning');
        return;
    }

    if (currentTicket.estado === 'reservada' && currentTicket.vendedor && currentTicket.vendedor !== sellerName) {
        showAlert(`La boleta ${ticketNumber} está en proceso por ${currentTicket.vendedor}.`, 'warning');
        return;
    }

    if (!supabaseClient) {
        showAlert('Sin conexión a base de datos', 'warning');
        return;
    }

    try {
        if (currentTicket.estado === 'vendida') {
            if (!confirm('¿Desea liberar esta boleta vendida? Esta acción eliminará los datos del comprador.')) {
                return;
            }

            const { data: releaseData, error: releaseError } = await supabaseClient
                .from('boletas')
                .update({
                    estado: 'disponible',
                    vendedor: null,
                    fecha: null,
                    comprador: null,
                    celular: null
                })
                .eq('numero', ticketNumber)
                .eq('estado', 'vendida')
                .eq('vendedor', sellerName)
                .select();

            if (releaseError) throw releaseError;

            if (!releaseData || releaseData.length === 0) {
                showAlert('No fue posible liberar la boleta. Intente actualizar.', 'warning');
                return;
            }

            tickets[ticketNumber] = {
                numero: ticketNumber,
                estado: 'disponible',
                vendedor: null,
                comprador: null,
                celular: null,
                fecha: null
            };
            updateTicketElements(ticketNumber);
            updateStats();
            updateSellersList();
            showAlert(`Boleta ${ticketNumber} liberada correctamente`, 'success');
            logSecurityEvent('TICKET_RELEASE', `Boleta ${ticketNumber} liberada por ${sellerName}`);
            return;
        }

         // Asegurar reserva
        if (currentTicket.estado !== 'reservada') {
            const now = new Date().toISOString();
            const { data: reserveData, error: reserveError } = await supabaseClient
                .from('boletas')
                .update({
                    estado: 'reservada',
                    vendedor: sellerName,
                    fecha: now,
                    comprador: null,
                    celular: null
                })
                .eq('numero', ticketNumber)
                .eq('estado', 'disponible')
                .select();

            if (reserveError) throw reserveError;

            if (!reserveData || reserveData.length === 0) {
                showAlert('La boleta ya no está disponible.', 'warning');
                await loadTickets();
                return;
            }

            tickets[ticketNumber] = {
                ...reserveData[0]
            };
            updateTicketElements(ticketNumber);
            logSecurityEvent('TICKET_RESERVE', `Boleta ${ticketNumber} reservada por ${sellerName}`);
        }

        const manualBuyerInput = Object.prototype.hasOwnProperty.call(options, 'buyerName');
        const manualPhoneInput = Object.prototype.hasOwnProperty.call(options, 'buyerPhone');

         let sanitizedBuyer = '';
        if (manualBuyerInput) {
            const buyerCandidate = typeof buyerName === 'string' ? buyerName : String(buyerName || '');
            sanitizedBuyer = sanitizeInput(buyerCandidate);
            if (!sanitizedBuyer) {
                await releaseReservation(ticketNumber, { silent: true });
                showAlert('Debes ingresar el nombre del comprador.', 'warning');
                return;
            }
        } else {
            const promptedName = prompt('Nombre del comprador');
            sanitizedBuyer = sanitizeInput(promptedName || '');
            if (!sanitizedBuyer) {
                await releaseReservation(ticketNumber, { silent: true });
                showAlert('Venta cancelada. La boleta vuelve a estar disponible.', 'info');
                return;
            }
        }

        let finalPhone = '';
        if (manualPhoneInput) {
            const phoneCandidate = sanitizeInput((buyerPhone || '').toString()).replace(/\s+/g, '');
            const digitsOnly = phoneCandidate.replace(/[^\d+]/g, '');
            if (!digitsOnly) {
                await releaseReservation(ticketNumber, { silent: true });
                showAlert('Debes ingresar un número de contacto válido.', 'warning');
                return;
            }
            finalPhone = digitsOnly.startsWith('+') ? digitsOnly : `+57${digitsOnly}`;
        } else {
            const phoneData = await promptPhoneNumber();
            if (!phoneData) {
                await releaseReservation(ticketNumber, { silent: true });
                showAlert('Venta cancelada. La boleta vuelve a estar disponible.', 'info');
                return;
            }

            const areaCode = sanitizeInput(phoneData.area || '+57').replace(/[^\d+]/g, '');
            const phoneNumber = sanitizeInput(phoneData.phone || '');
            const sanitizedPhone = phoneNumber.replace(/\D/g, '');
            if (!sanitizedPhone) {
                await releaseReservation(ticketNumber, { silent: true });
                showAlert('Debe ingresar un número de celular válido.', 'warning');
                return;
            }
            const finalArea = areaCode.startsWith('+') ? areaCode : '+' + areaCode;
            finalPhone = finalArea + sanitizedPhone;
        }

        const numericSaleValue = Number(saleValue);
        const normalizedAmount = Number.isFinite(numericSaleValue) && numericSaleValue > 0
            ? Math.round(numericSaleValue)
            : systemConfig.ticketPrice;
        
        const salePayload = {
            estado: 'vendida',
            vendedor: sellerName,
            fecha: new Date().toISOString(),
            comprador: sanitizedBuyer,
            celular: finalPhone
        };

        const { data: saleData, error: saleError } = await supabaseClient
            .from('boletas')
            .update(salePayload)
            .eq('numero', ticketNumber)
            .eq('estado', 'reservada')
            .eq('vendedor', sellerName)
            .select();

        if (saleError) {
            await releaseReservation(ticketNumber, { silent: true });
            throw saleError;
        }

        if (!saleData || saleData.length === 0) {
            showAlert('No se pudo completar la venta. Intente nuevamente.', 'warning');
            await loadTickets();
            return;
        }

        tickets[ticketNumber] = {
            ...saleData[0],
            valorPersonalizado: normalizedAmount !== systemConfig.ticketPrice ? normalizedAmount : undefined
        };
        updateTicketElements(ticketNumber);
        updateStats();
        updateSellersList();

        const revenue = formatCurrency(normalizedAmount);
        showAlert(`Boleta ${ticketNumber} vendida correctamente (${revenue})`, 'success');
        logSecurityEvent('TICKET_SOLD', `Boleta ${ticketNumber} vendida por ${sellerName} - ${revenue}`);

        if (fromForm) {
            clearTicketForm();
        }

    } catch (error) {
        logSecurityEvent('TICKET_ERROR', `Error actualizando boleta ${ticketNumber}: ${error.message}`, 'ERROR');
        showAlert('Error actualizando boleta: ' + error.message, 'danger');
    }
}

// Sistema de pestañas
function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'dashboard') {
        updateDashboard();
    } else if (tabName === 'seller') {
        if (currentSellerData) {
            createTicketGrid();
        }
    } else if (tabName === 'security') {
        updateSecurityLogs();
        updateSecurityStats();
    }

    logSecurityEvent('NAVIGATION', `Usuario navegó a pestaña: ${tabName}`);
}

// Función para mostrar logs de seguridad
function showSecurityLogs() {
    if (!validateSession()) {
        showAlert('Sesión expirada', 'warning');
        return;
    }

    showTab('security');
    logSecurityEvent('SECURITY_AUDIT', 'Administrador accedió a logs de seguridad');
}

// Verificar estado de la base de datos
async function verifyDatabaseState() {
    if (!validateSession()) {
        showAlert('Sesión expirada', 'warning');
        return;
    }

    if (!supabaseClient) {
        showAlert('No hay conexión con Supabase', 'danger');
        return;
    }

    try {
        document.getElementById('verifyDbBtn').disabled = true;
        showAlert('Verificando estado de la base de datos...', 'info');

        const { data: boletasData, error: boletasError, count: totalBoletas } = await supabaseClient
            .from('boletas')
            .select('*', { count: 'exact' });

        if (boletasError) throw boletasError;

        const disponibles = boletasData.filter(b => b.estado === 'disponible').length;
        const vendidas = boletasData.filter(b => b.estado === 'vendida').length;
        const ingresosTotales = vendidas * systemConfig.ticketPrice;

        const { data: vendedoresData, error: vendedoresError, count: totalVendedores } = await supabaseClient
            .from('vendedores')
            .select('*', { count: 'exact' });

        if (vendedoresError) throw vendedoresError;

        let resumen = `📊 ESTADO DE LA BASE DE DATOS:\n\n`;
        resumen += `⚙️ CONFIGURACIÓN:\n`;
        resumen += `   • Boletas configuradas: ${systemConfig.totalTickets}\n`;
        resumen += `   • Precio por boleta: $${systemConfig.ticketPrice.toLocaleString()}\n`;
        resumen += `   • Ingresos máximos posibles: $${(systemConfig.totalTickets * systemConfig.ticketPrice).toLocaleString()}\n\n`;
        resumen += `🎫 BOLETAS:\n`;
        resumen += `   • Total en BD: ${totalBoletas}\n`;
        resumen += `   • Disponibles: ${disponibles}\n`;
        resumen += `   • Vendidas: ${vendidas}\n`;
        resumen += `   • Ingresos actuales: $${ingresosTotales.toLocaleString()}\n`;
        resumen += `   • Progreso: ${((vendidas / systemConfig.totalTickets) * 100).toFixed(1)}%\n\n`;
        resumen += `👥 VENDEDORES: ${totalVendedores}\n\n`;

        if (vendedoresData.length > 0) {
            resumen += `📈 VENTAS POR VENDEDOR:\n`;
            vendedoresData.forEach(vendedor => {
                const ventasVendedor = boletasData.filter(b => b.vendedor === vendedor.nombre).length;
                const ingresosVendedor = ventasVendedor * systemConfig.ticketPrice;
                resumen += `   • ${vendedor.nombre}: ${ventasVendedor} boletas ($${ingresosVendedor.toLocaleString()})\n`;
            });
        }

        alert(resumen);
        showAlert('Verificación completada', 'success');
        logSecurityEvent('DB_AUDIT', 'Verificación de estado de base de datos realizada');

    } catch (error) {
        logSecurityEvent('DB_ERROR', `Error verificando base de datos: ${error.message}`, 'ERROR');
        showAlert('Error verificando base de datos: ' + error.message, 'danger');
    } finally {
        document.getElementById('verifyDbBtn').disabled = false;
    }
}

// Función para probar conexión
async function testConnection() {
    try {
        document.getElementById('testConnBtn').disabled = true;
        document.getElementById('testConnBtn').textContent = '⏳ Actualizando...';
        showAlert('Probando conexión segura...', 'info');

        if (!supabaseClient) {
            if (!initSupabase()) {
                throw new Error('No se pudo inicializar Supabase');
            }
        }

        const { data, error } = await supabaseClient
            .from('vendedores')
            .select('count', { count: 'exact', head: true })
            .limit(1);

        if (error) throw error;

        showAlert('¡Conexión exitosa!', 'success');
        updateConnectionStatus('connected');
        logSecurityEvent('CONNECTION_TEST', 'Test de conexión exitoso');

        await loadSellers();
        await loadTickets();

    } catch (error) {
        logSecurityEvent('CONNECTION_ERROR', `Error en test de conexión: ${error.message}`, 'ERROR');
        showAlert('Error de conexión: ' + error.message, 'danger');
        updateConnectionStatus('disconnected');
    } finally {
        document.getElementById('testConnBtn').disabled = false;
        document.getElementById('testConnBtn').textContent = 'Actualizar';
    }
}

// Actualizar estado de conexión
function updateConnectionStatus(status) {
    const statusEl = document.getElementById('connectionStatus');
    if (status === 'connected') {
        statusEl.className = 'connection-status connected';
        statusEl.textContent = '🟢 Conectado';
    } else if (status === 'disconnected') {
        statusEl.className = 'connection-status disconnected';
        statusEl.textContent = '🔴 Desconectado';
    } else {
        statusEl.className = 'connection-status disconnected';
        statusEl.textContent = '🟡 Conectando...';
    }
}

// Actualizar dropdown de vendedores
function updateSellerDropdown() {
    const select = document.getElementById('currentSeller');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccione un vendedor</option>';

    sellers.forEach(seller => {
        const option = document.createElement('option');
        option.value = seller.id;
        option.textContent = `${escapeHtml(seller.nombre)} (${escapeHtml(seller.username || '')})`;
        select.appendChild(option);
    });
}

// Actualizar lista de vendedores
function updateSellersList() {
    const container = document.getElementById('sellersList');
    if (!container) return;

    if (sellers.length === 0) {
        container.innerHTML = '<p>No hay vendedores registrados</p>';
        return;
    }

    let html = '<h4>Vendedores Registrados:</h4><ul>';
    sellers.forEach(seller => {
        const ventas = Object.values(tickets).filter(t => t.vendedor === seller.nombre && t.estado === 'vendida').length;
        const ingresos = ventas * systemConfig.ticketPrice;
        const username = seller.username ? ` (${escapeHtml(seller.username)})` : '';

        html += `
            <li>
                <strong>${escapeHtml(seller.nombre)}</strong>${username}
                - Ventas: ${ventas}
                - Ingresos: $${ingresos.toLocaleString()}
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}

function clearTicketForm() {
    const form = document.getElementById('ticketSaleForm');
    if (!form) return;
    form.reset();

    const ticketInput = document.getElementById('ticketNumberInput');
    if (ticketInput) {
        ticketInput.focus();
    }
}

async function handleTicketFormSubmit(event) {
    event.preventDefault();

    if (!vendorSession.isAuthenticated || !currentSellerData) {
        showAlert('Inicie sesión como vendedor para registrar boletas.', 'warning');
        return;
    }

    const ticketInput = document.getElementById('ticketNumberInput');
    const buyerInput = document.getElementById('buyerNameInput');
    const phoneInput = document.getElementById('buyerPhoneInput');
    const valueInput = document.getElementById('ticketValueInput');

    const ticketNumber = parseInt(ticketInput?.value, 10);
    if (!Number.isInteger(ticketNumber) || ticketNumber < 1 || ticketNumber > systemConfig.totalTickets) {
        showAlert(`Ingrese un número de boleta entre 1 y ${systemConfig.totalTickets}.`, 'warning');
        return;
    }

    const buyerName = buyerInput?.value || '';
    const phoneValue = phoneInput?.value || '';

    if (!buyerName.trim() || !phoneValue.trim()) {
        showAlert('Completa el nombre y el teléfono del comprador.', 'warning');
        return;
    }

    const saleValue = valueInput && valueInput.value ? Number(valueInput.value) : undefined;
    const submitButton = event.target.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        await toggleTicketState(ticketNumber, {
            buyerName,
            buyerPhone: phoneValue,
            saleValue,
            fromForm: true
        });
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}

// Manejar cambio de vendedor
document.addEventListener('DOMContentLoaded', function() {
    updateVendorUI();
    
    const select = document.getElementById('currentSeller');
    if (select) {
        select.addEventListener('change', function() {
            const sellerId = this.value;
            if (sellerId) {
                currentSellerData = sellers.find(s => s.id == sellerId);
                document.getElementById('sellerPanel').style.display = 'block';
                createTicketGrid();
                updateStats();
                logSecurityEvent('SELLER_SELECT', `Vendedor seleccionado: ${currentSellerData.nombre}`);
            } else {
                currentSellerData = null;
                document.getElementById('sellerPanel').style.display = 'none';
            }
        });
    }

    const saleForm = document.getElementById('ticketSaleForm');
    if (saleForm) {
        saleForm.addEventListener('submit', handleTicketFormSubmit);
    }

    const resetButton = document.getElementById('ticketFormReset');
    if (resetButton) {
        resetButton.addEventListener('click', clearTicketForm);
    }
});

function getTicketTooltip(ticketData) {
    if (!ticketData) return '';

    if (ticketData.estado === 'vendida') {
        const dateStr = ticketData.fecha ? new Date(ticketData.fecha).toLocaleString() : '';
        return `Vendida por: ${escapeHtml(ticketData.vendedor || 'Desconocido')} | Comprador: ${escapeHtml(ticketData.comprador || 'N/A')} | Cel: ${escapeHtml(ticketData.celular || 'N/A')} | Fecha: ${dateStr}`;
    }

    if (ticketData.estado === 'reservada') {
        const dateStr = ticketData.fecha ? new Date(ticketData.fecha).toLocaleTimeString() : '';
        return `En proceso por: ${escapeHtml(ticketData.vendedor || 'Desconocido')} ${dateStr ? '| Inicio: ' + dateStr : ''}`;
    }

    return `Disponible - $${systemConfig.ticketPrice.toLocaleString()}`;
}

function applyTicketVisual(element, ticketData, { isDashboard = false } = {}) {
    if (!element || !ticketData) return;
    const baseClass = isDashboard ? 'ticket dashboard' : 'ticket';
    element.className = `${baseClass} ${ticketData.estado}`.trim();
    element.textContent = ticketData.numero;
    element.title = getTicketTooltip(ticketData);
}

function updateTicketElements(ticketNumber) {
    const data = tickets[ticketNumber] || {
        numero: ticketNumber,
        estado: 'disponible',
        vendedor: null,
        comprador: null,
        celular: null,
        fecha: null
    };

    const gridElement = document.querySelector(`#ticketGrid .ticket[data-ticket-number="${ticketNumber}"]`);
    applyTicketVisual(gridElement, data);

    const dashboardElement = document.querySelector(`#dashboardTicketGrid .ticket[data-ticket-number="${ticketNumber}"]`);
    applyTicketVisual(dashboardElement, data, { isDashboard: true });
}

function updateLatestTicketsTable() {
    const tableBody = document.getElementById('latestTicketsBody');
    if (!tableBody) return;

    const soldTickets = Object.values(tickets)
        .filter(ticket => ticket.estado === 'vendida')
        .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
        .slice(0, 6);

    if (soldTickets.length === 0) {
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="4">Sin movimientos recientes</td></tr>';
        return;
    }

    const rows = soldTickets.map(ticket => {
        const buyer = escapeHtml(ticket.comprador || 'Sin comprador');
        const formattedDate = ticket.fecha ? new Date(ticket.fecha).toLocaleString() : '-';
        const amount = formatCurrency(ticket.valorPersonalizado ?? systemConfig.ticketPrice);

        return `
            <tr>
                <td>${ticket.numero}</td>
                <td>${buyer}</td>
                <td>${formattedDate}</td>
                <td>${amount}</td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;
}

// Crear grid de boletas
function createTicketGrid() {
    const grid = document.getElementById('ticketGrid');
    const loading = document.getElementById('ticketGridLoading');

    if (!grid) return;

    loading.style.display = 'block';
    grid.style.display = 'none';
    grid.innerHTML = '';

    setTimeout(() => {
        for (let i = 1; i <= systemConfig.totalTickets; i++) {
            const ticket = document.createElement('div');
            const ticketData = tickets[i] || { numero: i, estado: 'disponible', vendedor: null, comprador: null, celular: null, fecha: null };

           ticket.dataset.ticketNumber = i;
            applyTicketVisual(ticket, ticketData);
            ticket.onclick = () => toggleTicketState(i);

            grid.appendChild(ticket);
        }

        loading.style.display = 'none';
        grid.style.display = 'grid';
    }, 100);
}

// Actualizar estadísticas
function updateStats() {
    const available = Object.values(tickets).filter(t => t.estado === 'disponible').length;
    const sold = Object.values(tickets).filter(t => t.estado === 'vendida').length;
    const revenue = sold * systemConfig.ticketPrice;

    const totalEl = document.getElementById('totalTicketsStat');
    if (totalEl) totalEl.textContent = systemConfig.totalTickets;

    const availableEl = document.getElementById('availableCount');
    if (availableEl) availableEl.textContent = available;

    const soldEl = document.getElementById('soldCount');
    if (soldEl) soldEl.textContent = sold;

    const revenueEl = document.getElementById('revenueCount');
    if (revenueEl) revenueEl.textContent = formatCurrency(revenue);
}

// Actualizar dashboard
async function updateDashboard() {
    const dashLoading = document.getElementById('dashboardLoading');
    const dashGrid = document.getElementById('dashboardTicketGrid');

    dashLoading.style.display = 'block';
    dashGrid.style.display = 'none';

    try {
        await loadTickets();

        const available = Object.values(tickets).filter(t => t.estado === 'disponible').length;
        const sold = Object.values(tickets).filter(t => t.estado === 'vendida').length;
        const revenue = sold * systemConfig.ticketPrice;
        const progress = systemConfig.totalTickets > 0 ? ((sold / systemConfig.totalTickets) * 100).toFixed(1) : 0;

        const dashAvailable = document.getElementById('dashAvailable');
        if (dashAvailable) dashAvailable.textContent = available;

        const dashSold = document.getElementById('dashSold');
        if (dashSold) dashSold.textContent = sold;

        const dashRevenue = document.getElementById('dashRevenue');
        if (dashRevenue) dashRevenue.textContent = formatCurrency(revenue);

        const dashProgress = document.getElementById('dashProgress');
        if (dashProgress) dashProgress.textContent = `${progress}%`;

        dashGrid.innerHTML = '';
        for (let i = 1; i <= systemConfig.totalTickets; i++) {
            const ticket = document.createElement('div');
            const ticketData = tickets[i] || { numero: i, estado: 'disponible', vendedor: null, comprador: null, celular: null, fecha: null };

            ticket.dataset.ticketNumber = i;
            applyTicketVisual(ticket, ticketData);
            ticket.onclick = () => showTicketInfo(i);
            dashGrid.appendChild(ticket);
        }

        updateSalesBySeller();

        dashLoading.style.display = 'none';
        dashGrid.style.display = 'grid';

    } catch (error) {
        logSecurityEvent('DASHBOARD_ERROR', `Error actualizando dashboard: ${error.message}`, 'ERROR');
        showAlert('Error cargando dashboard: ' + error.message, 'danger');
    }
}

// Actualizar ventas por vendedor
function updateSalesBySeller() {
    const container = document.getElementById('salesBySeller');
    let html = '<h4>📈 Ventas por Vendedor</h4>';

    if (sellers.length === 0) {
        html += '<p>No hay vendedores registrados</p>';
    } else {
        html += '<div class="stats-grid">';
        sellers.forEach(seller => {
            const ventas = Object.values(tickets).filter(t => t.vendedor === seller.nombre && t.estado === 'vendida').length;
            const ingresos = ventas * systemConfig.ticketPrice;
            html += `
                <div class="stat-card">
                    <h3>${ventas}</h3>
                    <p>${escapeHtml(seller.nombre)}</p>
                    <small>$${ingresos.toLocaleString()}</small>
                </div>
            `;
        });
        html += '</div>';
    }

    container.innerHTML = html;
}

function showTicketInfo(numero) {
    const ticket = tickets[numero];
    if (!ticket) return;
    const vendedor = ticket.vendedor || 'Desconocido';
    const comprador = ticket.comprador || 'N/A';
    const celular = ticket.celular || 'N/A';
    const fecha = ticket.fecha ? new Date(ticket.fecha).toLocaleString() : 'N/A';
    const estado = ticket.estado === 'reservada' ? 'En proceso' : (ticket.estado === 'vendida' ? 'Vendida' : 'Disponible');
    alert(`Boleta #${numero}\nEstado: ${estado}\nVendedor: ${vendedor}\nComprador: ${comprador}\nCel: ${celular}\nFecha: ${fecha}`);
}

// Reiniciar sistema SECURIZADO
async function resetSystem() {
    if (!validateSession()) {
        showAlert('Sesión expirada', 'warning');
        return;
    }

    if (confirm('⚠️ ¿Está seguro de reiniciar todo el sistema? Esta acción eliminará todas las boletas y vendedores y será registrada en los logs de seguridad.')) {
        try {
            document.getElementById('resetBtn').disabled = true;
            logSecurityEvent('SYSTEM_RESET', 'Administrador inició reinicio completo del sistema', 'WARNING');

            if (supabaseClient) {
                const { error: boletasError } = await supabaseClient
                    .from('boletas')
                    .delete()
                    .neq('numero', 0);

                if (boletasError) throw boletasError;

                const { error: vendedoresError } = await supabaseClient
                    .from('vendedores')
                    .delete()
                    .neq('id', 0);

                if (vendedoresError) throw vendedoresError;

                showAlert('Sistema reiniciado en la base de datos', 'success');
                logSecurityEvent('SYSTEM_RESET', 'Sistema reiniciado exitosamente', 'INFO');
            }

            tickets = {};
            sellers = [];
            currentSellerData = null;

            document.getElementById('sellerPanel').style.display = 'none';
            document.getElementById('currentSeller').innerHTML = '<option value="">No hay vendedores</option>';

            if (supabaseClient) {
                await initializeTicketsIfNeeded();
            }

            updateSellersList();
            updateStats();

        } catch (error) {
            logSecurityEvent('SYSTEM_RESET_ERROR', `Error reiniciando sistema: ${error.message}`, 'ERROR');
            showAlert('Error reiniciando sistema: ' + error.message, 'danger');
        } finally {
            document.getElementById('resetBtn').disabled = false;
        }
    }
}

// Sistema de alertas mejorado
function showAlert(message, type) {
    const alertsContainer = document.getElementById('alerts');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = sanitizeInput(message);

    alertsContainer.appendChild(alert);

    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function getStoredThemePreference() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
        logSecurityEvent('THEME_STORAGE_ERROR', 'No se pudo leer la preferencia de tema almacenada', 'WARNING');
        return null;
    }
}

function storeThemePreference(theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        logSecurityEvent('THEME_STORAGE_ERROR', 'No se pudo guardar la preferencia de tema', 'WARNING');
    }
}

function applyThemePreference(theme) {
    const root = document.documentElement;
    const resolvedTheme = theme === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', resolvedTheme);

    const toggleButton = document.getElementById('themeToggleBtn');
    if (toggleButton) {
        const isLight = resolvedTheme === 'light';
        toggleButton.textContent = isLight ? '🌙 Modo oscuro' : '☀️ Modo claro';
        toggleButton.setAttribute('aria-pressed', isLight ? 'true' : 'false');
        toggleButton.title = isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
    }
}

function resolveInitialTheme() {
    const storedTheme = getStoredThemePreference();
    if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
    }

    if (window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    return 'dark';
}

function toggleThemePreference() {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyThemePreference(next);
    storeThemePreference(next);
    logSecurityEvent('THEME_CHANGE', `Modo ${next === 'light' ? 'claro' : 'oscuro'} activado`, 'INFO');
}

function initThemeToggle() {
    const initialTheme = resolveInitialTheme();
    applyThemePreference(initialTheme);
    logSecurityEvent('THEME_INIT', `Tema ${initialTheme === 'light' ? 'claro' : 'oscuro'} aplicado`, 'INFO');

    const toggleButton = document.getElementById('themeToggleBtn');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleThemePreference);
    }

    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        const handleChange = event => {
            const storedTheme = getStoredThemePreference();
            if (!storedTheme) {
                const nextTheme = event.matches ? 'light' : 'dark';
                applyThemePreference(nextTheme);
                logSecurityEvent('THEME_AUTO', `Tema ${nextTheme === 'light' ? 'claro' : 'oscuro'} aplicado por preferencia del sistema`, 'INFO');
            }
        };
        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handleChange);
        }
    }
}

// =========================
// INICIALIZACIÓN SEGURA
// =========================

document.addEventListener('vendor:loaded', function() {
    supabaseLibraryPendingLogged = false;
    logSecurityEvent('SUPABASE_VENDOR', 'Biblioteca segura cargada correctamente');
    initSupabase();
});

document.addEventListener('vendor:error', function(event) {
    const detail = event && event.detail && event.detail.message ? event.detail.message : 'Error desconocido';
    logSecurityEvent('SUPABASE_VENDOR_ERROR', `Error cargando biblioteca segura: ${detail}`, 'ERROR');
    showAlert('Error cargando librerías de seguridad. Revise la conexión segura.', 'danger');
});

document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();
    
    // Generar CAPTCHA inicial
    generateCaptcha();

    // Inicializar configuración del sistema
    updateConfigDisplay();

    // Inicializar logs de seguridad
    logSecurityEvent('APP_START', 'Aplicación iniciada', 'INFO');

    // Inicializar aplicación
    showAlert('🔒 Iniciando sistema con seguridad avanzada...', 'info');
    initSupabase();

    populateAreaCodes();

    // Actualizar información de sesión cada minuto
    setInterval(updateSessionInfo, 60000);

    // Actualizar estadísticas de seguridad cada 5 segundos
    setInterval(updateSecurityStats, 5000);
});

// Manejar errores globales
window.addEventListener('error', function(e) {
    logSecurityEvent('JS_ERROR', `Error JavaScript: ${e.message}`, 'ERROR');
    showAlert('Error inesperado en la aplicación', 'danger');
});

// Detectar actividad sospechosa
let rapidClickCount = 0;
let lastClickTime = 0;

document.addEventListener('click', function(e) {
    const now = Date.now();
    if (now - lastClickTime < 100) {
        rapidClickCount++;
        if (rapidClickCount > 10) {
            logSecurityEvent('SUSPICIOUS_ACTIVITY', 'Actividad sospechosa: clicks muy rápidos detectados', 'WARNING');
            rapidClickCount = 0;
        }
    } else {
        rapidClickCount = 0;
    }
    lastClickTime = now;
});

// Log al cerrar la aplicación
window.addEventListener('beforeunload', function(e) {
    logSecurityEvent('APP_CLOSE', 'Usuario cerrando aplicación');
});
