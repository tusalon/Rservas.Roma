// utils/profesionales.js - Gestión de profesionales para salón de belleza

console.log('💅 profesionales.js cargado');

let profesionalesCache = [];
let ultimaActualizacion = 0;
const CACHE_DURATION = 5 * 60 * 1000;

async function cargarProfesionalesDesdeDB() {
    try {
        console.log('🌐 Cargando profesionales desde Supabase...');
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/profesionales?select=*&order=nombre.asc`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                }
            }
        );
        
        if (!response.ok) {
            console.error('Error response:', await response.text());
            return null;
        }
        
        const data = await response.json();
        console.log('✅ Profesionales cargados:', data);
        profesionalesCache = data;
        ultimaActualizacion = Date.now();
        return data;
    } catch (error) {
        console.error('Error cargando profesionales:', error);
        return null;
    }
}

window.salonProfesionales = {
    getAll: async function(activos = true) {
        if (Date.now() - ultimaActualizacion < CACHE_DURATION && profesionalesCache.length > 0) {
            if (activos) {
                return profesionalesCache.filter(p => p.activo === true);
            }
            return [...profesionalesCache];
        }
        
        const datos = await cargarProfesionalesDesdeDB();
        if (datos) {
            if (activos) {
                return datos.filter(p => p.activo === true);
            }
            return datos;
        }
        
        return [];
    },
    
    getById: async function(id) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/profesionales?id=eq.${id}&select=*`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    }
                }
            );
            if (!response.ok) return null;
            const data = await response.json();
            return data[0] || null;
        } catch (error) {
            console.error('Error obteniendo profesional:', error);
            return null;
        }
    },
    
    crear: async function(profesional) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/profesionales`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        nombre: profesional.nombre,
                        especialidad: profesional.especialidad,
                        color: profesional.color || 'bg-pink-600',
                        avatar: profesional.avatar || '💅',
                        activo: true,
                        telefono: profesional.telefono || null,
                        password: profesional.password || null,
                        nivel: profesional.nivel || 1
                    })
                }
            );
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Error al crear profesional:', error);
                return null;
            }
            
            const nuevo = await response.json();
            console.log('✅ Profesional creado:', nuevo);
            
            profesionalesCache = await cargarProfesionalesDesdeDB() || profesionalesCache;
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('profesionalesActualizados'));
            }
            
            return nuevo[0];
        } catch (error) {
            console.error('Error en crear:', error);
            return null;
        }
    },
    
    actualizar: async function(id, cambios) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/profesionales?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(cambios)
                }
            );
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Error al actualizar profesional:', error);
                return null;
            }
            
            const actualizado = await response.json();
            console.log('✅ Profesional actualizado:', actualizado);
            
            profesionalesCache = await cargarProfesionalesDesdeDB() || profesionalesCache;
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('profesionalesActualizados'));
            }
            
            return actualizado[0];
        } catch (error) {
            console.error('Error en actualizar:', error);
            return null;
        }
    },
    
    eliminar: async function(id) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/profesionales?id=eq.${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    }
                }
            );
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Error al eliminar profesional:', error);
                return false;
            }
            
            console.log('✅ Profesional eliminado');
            
            profesionalesCache = await cargarProfesionalesDesdeDB() || profesionalesCache;
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('profesionalesActualizados'));
            }
            
            return true;
        } catch (error) {
            console.error('Error en eliminar:', error);
            return false;
        }
    }
};

setTimeout(async () => {
    await window.salonProfesionales.getAll(false);
}, 1000);

console.log('✅ salonProfesionales inicializado');