// ============================================
// CONFIGURACIÓN NUEVA - RSERVAS.ROMA
// ============================================
// FECHA: 26/02/2024
// PROYECTO: Rservas.Roma
// ============================================

(function() {
    // Credenciales NUEVAS de Supabase
    const NUEVA_URL = 'https://zorhclhvykikaachfrmp.supabase.co';
    const NUEVA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcmhjbGh2eWtpa2FhY2hmcm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDQzMzUsImV4cCI6MjA4NzcyMDMzNX0.reauF3UfNTFJFZ3Mnzf8ctYH1d5p7C3msi7AvYJUaos';

    // Asignar a window
    window.SUPABASE_URL = NUEVA_URL;
    window.SUPABASE_ANON_KEY = NUEVA_KEY;

    // Mostrar confirmación CLARA
    console.log('%c🚀 NUEVA CONFIGURACIÓN ACTIVADA', 'background: #c49b63; color: black; font-size: 14px; padding: 4px;');
    console.log('📌 Proyecto: Rservas.Roma');
    console.log('🔗 URL:', NUEVA_URL);
    console.log('🔑 KEY:', NUEVA_KEY.substring(0, 20) + '...');
    console.log('⏰ Cargado:', new Date().toLocaleString());
})();