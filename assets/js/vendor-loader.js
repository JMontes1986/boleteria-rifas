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

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = false;
    script.onload = function () {
        notify('vendor:loaded');
    };
    script.onerror = function (error) {
        notify('vendor:error', { message: 'No se pudo cargar la biblioteca segura', error });
    };

    document.head.appendChild(script);
})();
