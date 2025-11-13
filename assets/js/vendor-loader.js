(function setupSecureVendors() {
    const secureConfig = Object.freeze({
        serviceUrl: 'https://ekascpppeqlrmeybveni.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYXNjcHBwZXFscm1leWJ2ZW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzU1ODMsImV4cCI6MjA3ODU1MTU4M30.4fwM4bS1gqFF266LgcaoJ1xj9MCw0pg3--B9qKk3M1o'
    });

    Object.defineProperty(window, 'SECURE_ENV', {
        value: secureConfig,
        writable: false,
        configurable: false,
        enumerable: false
    });

    function notify(eventName, detail) {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    function ensureSupabaseAvailable() {
        return typeof window.supabase === 'object' &&
            window.supabase !== null &&
            typeof window.supabase.createClient === 'function';
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
    script.async = false;
    script.crossOrigin = 'anonymous';
    script.onload = function () {
        if (ensureSupabaseAvailable()) {
            notify('vendor:loaded');
        } else {
            notify('vendor:error', { message: 'La biblioteca segura no expuso la API esperada.' });
        }
    };
    script.onerror = function (error) {
        notify('vendor:error', { message: 'No se pudo cargar la biblioteca segura', error });
    };

    document.head.appendChild(script);
})();
