// utils/whatsapp-helper.js - Helper universal para WhatsApp (Rservas.Roma)

console.log('📱 whatsapp-helper.js cargado');

// Detectar si es dispositivo móvil
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detectar si es Android (para usar intent://)
const isAndroid = () => {
    return /Android/i.test(navigator.userAgent);
};

// Detectar si es iOS
const isIOS = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// Función principal que SIEMPRE funciona con Business
window.enviarWhatsAppBusiness = function(telefono, mensaje, esBusiness = true) {
    const telefonoLimpio = telefono.replace(/\D/g, '');
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    console.log('📤 Enviando WhatsApp a:', telefonoLimpio);
    console.log('📱 Dispositivo:', isMobile() ? 'Móvil' : 'Desktop');
    
    if (esBusiness) {
        if (isAndroid()) {
            const intentUrl = `intent://send/${telefonoLimpio}?text=${mensajeCodificado}#Intent;package=com.whatsapp.w4b;scheme=whatsapp;end;`;
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = intentUrl;
            document.body.appendChild(iframe);
            
            setTimeout(() => {
                document.body.removeChild(iframe);
                window.location.href = `https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
            }, 800);
            
            return;
        }
        
        if (isIOS()) {
            const businessUrl = `whatsapp://send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
            window.location.href = businessUrl;
            
            setTimeout(() => {
                window.location.href = `https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
            }, 1000);
            
            return;
        }
    }
    
    if (!isMobile()) {
        window.open(`https://web.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`, '_blank');
    } else {
        window.location.href = `https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
    }
};

// Versión simplificada
window.enviarWhatsAppUniversal = function(telefono, mensaje) {
    const telefonoLimpio = telefono.replace(/\D/g, '');
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    if (isMobile()) {
        const startTime = Date.now();
        
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log('✅ App de WhatsApp se abrió correctamente');
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                clearTimeout(timeout);
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        if (isAndroid()) {
            const intentUrl = `intent://send/${telefonoLimpio}?text=${mensajeCodificado}#Intent;package=com.whatsapp.w4b;scheme=whatsapp;end;`;
            const link = document.createElement('a');
            link.href = intentUrl;
            link.click();
        } else {
            window.location.href = `whatsapp://send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
        }
        
        const timeout = setTimeout(() => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            console.log('⚠️ App no respondió, usando API');
            window.location.href = `https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
        }, 1500);
        
    } else {
        window.open(`https://web.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`, '_blank');
    }
};

// 🔥 FUNCIÓN: Notificar a clienta aprobada
window.notificarClienteAprobado = function(telefono, nombre) {
    const fechaHoy = new Date();
    const fechaStr = `${fechaHoy.getFullYear()}-${(fechaHoy.getMonth()+1).toString().padStart(2,'0')}-${fechaHoy.getDate().toString().padStart(2,'0')}`;
    const fechaConDia = window.formatFechaCompleta ? 
        window.formatFechaCompleta(fechaStr) : 
        fechaStr;
    
    const mensaje = 
`✅ *¡FELICIDADES! Has sido ACEPTADA en Rservas.Roma*

Hola *${nombre}*, nos complace informarte que tu solicitud de acceso ha sido *APROBADA*.

🎉 *Ya puede reservar turnos:*
• Reservar online las 24/7
• Cancelar turnos desde la app
• Recibir recordatorios automáticos

📱 *Ingresar ahora mismo:*
1. Abrir Rservas.Roma desde tu celular
2. Iniciar sesión con tu número
3. Elegir servicio, profesional y horario

✨ *Belleza que se nota*

Rservas.Roma - Tu espacio de belleza

_${fechaConDia}_`;

    window.enviarWhatsAppBusiness(telefono, mensaje, true);
};

// 🔥 FUNCIÓN: Cancelación de turnos
window.notificarCancelacion = function(telefono, nombre, fecha, hora, servicio, profesional) {
    let fechaConDia = fecha;
    
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        fechaConDia = window.formatFechaCompleta ? 
            window.formatFechaCompleta(fecha) : 
            fecha;
    }
    
    const mensaje = 
`❌ *CANCELACIÓN DE TURNO - Rservas.Roma*

Hola *${nombre}*, lamentamos informarte que tu turno ha sido cancelado.

📅 *Fecha:* ${fechaConDia}
⏰ *Hora:* ${hora}
💅 *Servicio:* ${servicio}
👩‍🎨 *Profesional:* ${profesional}

🔔 *Motivo:* Cancelación por administración

📱 *¿Querés reprogramar?*
Podés hacerlo desde la app

DisculpE las molestias. Esperamos verte pronto ✨

Rservas.Roma - Belleza que se nota`;

    window.enviarWhatsAppUniversal(telefono, mensaje);
};

console.log('✅ whatsapp-helper.js listo para usar');