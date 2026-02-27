// utils/servicios.js - Gestión de servicios por negocio

console.log('💅 servicios.js cargado');

window.salonServicios = {
    // Obtener todos los servicios del negocio actual
    getAll: async function(activos = true) {
        const negocioId = localStorage.getItem('negocio_id');
        
        if (!negocioId) {
            console.error('❌ No hay negocio_id en localStorage');
            return [];
        }
        
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/servicios?negocio_id=eq.${negocioId}&select=*&order=nombre.asc`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    }
                }
            );
            
            if (!response.ok) {
                console.error('Error response:', await response.text());
                return [];
            }
            
            const data = await response.json();
            
            if (activos) {
                return data.filter(s => s.activo === true);
            }
            return data;
            
        } catch (error) {
            console.error('Error cargando servicios:', error);
            return [];
        }
    },
    
    // Obtener un servicio por ID
    getById: async function(id) {
        const negocioId = localStorage.getItem('negocio_id');
        
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/servicios?id=eq.${id}&negocio_id=eq.${negocioId}&select=*`,
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
            console.error('Error obteniendo servicio:', error);
            return null;
        }
    },
    
    // Crear un nuevo servicio (automáticamente asignado al negocio actual)
    crear: async function(servicio) {
        const negocioId = localStorage.getItem('negocio_id');
        
        if (!negocioId) {
            alert('Error: No se pudo identificar el negocio');
            return null;
        }
        
        try {
            console.log('➕ Creando servicio para negocio:', negocioId);
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/servicios`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        nombre: servicio.nombre,
                        duracion: servicio.duracion,
                        precio: servicio.precio,
                        descripcion: servicio.descripcion || '',
                        categoria: servicio.categoria || 'Uñas',
                        activo: true,
                        imagen: servicio.imagen || null,
                        negocio_id: negocioId
                    })
                }
            );
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Error al crear servicio:', error);
                return null;
            }
            
            const nuevo = await response.json();
            console.log('✅ Servicio creado:', nuevo);
            
            return nuevo[0];
        } catch (error) {
            console.error('Error en crear:', error);
            return null;
        }
    },
    
    // Actualizar un servicio
    actualizar: async function(id, cambios) {
        const negocioId = localStorage.getItem('negocio_id');
        
        try {
            console.log('✏️ Actualizando servicio', id, 'con:', cambios);
            
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/servicios?id=eq.${id}&negocio_id=eq.${negocioId}`,
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
                console.error('Error al actualizar servicio:', error);
                return null;
            }
            
            const actualizado = await response.json();
            console.log('✅ Servicio actualizado:', actualizado);
            
            return actualizado[0];
        } catch (error) {
            console.error('Error en actualizar:', error);
            return null;
        }
    },
    
    // Eliminar un servicio
    eliminar: async function(id) {
        const negocioId = localStorage.getItem('negocio_id');
        
        try {
            console.log('🗑️ Eliminando servicio:', id);
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/servicios?id=eq.${id}&negocio_id=eq.${negocioId}`,
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
                console.error('Error al eliminar servicio:', error);
                return false;
            }
            
            console.log('✅ Servicio eliminado');
            return true;
        } catch (error) {
            console.error('Error en eliminar:', error);
            return false;
        }
    }
};

console.log('✅ salonServicios inicializado (multi-negocio)');