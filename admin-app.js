// admin-app.js - VERSIÓN CORREGIDA PARA RSERVAS.ROMA
// ============================================
// SOLO USA PROFESIONALES (NO BARBEROS)
// ============================================

// ============================================
// FUNCIONES DE SUPABASE
// ============================================
async function getAllBookings() {
    try {
        const res = await fetch(
            `${window.SUPABASE_URL}/rest/v1/reservas?select=*&order=fecha.desc,hora_inicio.asc`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                }
            }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
}

async function cancelBooking(id) {
    try {
        const res = await fetch(
            `${window.SUPABASE_URL}/rest/v1/reservas?id=eq.${id}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: 'Cancelado' })
            }
        );
        return res.ok;
    } catch (error) {
        console.error('Error cancel booking:', error);
        return false;
    }
}

async function createBooking(bookingData) {
    try {
        const res = await fetch(
            `${window.SUPABASE_URL}/rest/v1/reservas`,
            {
                method: 'POST',
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(bookingData)
            }
        );
        
        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }
        
        const data = await res.json();
        return { success: true, data: Array.isArray(data) ? data[0] : data };
    } catch (error) {
        console.error('Error creating booking:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// FUNCIÓN PARA MARCAR TURNOS COMO COMPLETADOS
// ============================================
async function marcarTurnosCompletados() {
    try {
        const ahora = new Date();
        const hoy = ahora.toISOString().split('T')[0];
        const horaActual = ahora.getHours();
        const minutosActuales = ahora.getMinutes();
        const totalMinutosActual = horaActual * 60 + minutosActuales;
        
        console.log('⏰ Verificando turnos para marcar como completados...');
        
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/reservas?estado=eq.Reservado&fecha=lte.${hoy}&select=id,fecha,hora_inicio,hora_fin,cliente_nombre,servicio,profesional_nombre`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                }
            }
        );
        
        if (!response.ok) {
            console.error('Error al buscar turnos para completar');
            return;
        }
        
        const turnos = await response.json();
        
        const turnosACompletar = turnos.filter(turno => {
            if (turno.fecha < hoy) return true;
            
            if (turno.fecha === hoy) {
                const [horas, minutos] = turno.hora_inicio.split(':').map(Number);
                const totalMinutosTurno = horas * 60 + minutos;
                return totalMinutosTurno <= totalMinutosActual;
            }
            
            return false;
        });
        
        if (turnosACompletar.length > 0) {
            console.log(`✅ ${turnosACompletar.length} turnos a marcar como completados`);
            
            for (const turno of turnosACompletar) {
                await fetch(
                    `${window.SUPABASE_URL}/rest/v1/reservas?id=eq.${turno.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ estado: 'Completado' })
                    }
                );
            }
            
            console.log(`✅ ${turnosACompletar.length} turnos marcados como completados`);
        }
        
    } catch (error) {
        console.error('Error marcando turnos completados:', error);
    }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatTo12Hour = (time) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
};

const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

const getCurrentLocalDate = () => {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const day = ahora.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const indiceToHoraLegible = (indice) => {
    const horas = Math.floor(indice / 2);
    const minutos = indice % 2 === 0 ? '00' : '30';
    return `${horas.toString().padStart(2, '0')}:${minutos}`;
};

// ============================================
// FUNCIÓN PARA ENVIAR MENSAJE DE CANCELACIÓN
// ============================================
const enviarCancelacionWhatsApp = (bookingData) => {
    try {
        const fechaConDia = window.formatFechaCompleta ? 
            window.formatFechaCompleta(bookingData.fecha) : 
            bookingData.fecha;
        
        const mensaje = 
`❌ *CANCELACIÓN DE TURNO - Rservas.Roma*

Hola *${bookingData.cliente_nombre}*, lamentamos informarte que tu turno ha sido cancelado.

📅 *Fecha:* ${fechaConDia}
⏰ *Hora:* ${formatTo12Hour(bookingData.hora_inicio)}
💅 *Servicio:* ${bookingData.servicio}
👩‍🎨 *Profesional:* ${bookingData.profesional_nombre || bookingData.trabajador_nombre || 'No asignada'}

🔔 *Motivo:* Cancelación por administración

📱 *¿Querés reprogramar?*
Podés hacerlo desde la app

Disculpá las molestias. Esperamos verte pronto ✨

Rservas.Roma - Belleza que se nota`;

        const telefono = bookingData.cliente_whatsapp.replace(/\D/g, '');
        const encodedText = encodeURIComponent(mensaje);
        
        window.open(`https://api.whatsapp.com/send?phone=${telefono}&text=${encodedText}`, '_blank');
        
        console.log('📤 Mensaje de cancelación enviado a:', telefono);
    } catch (error) {
        console.error('Error enviando mensaje de cancelación:', error);
    }
};

// ============================================
// COMPONENTE PRINCIPAL - SOLO PROFESIONALES
// ============================================
function AdminApp() {
    const [bookings, setBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filterDate, setFilterDate] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('activas');
    
    // ✅ SOLO USA PROFESIONALES (NO BARBEROS)
    const [userRole, setUserRole] = React.useState('admin');
    const [userNivel, setUserNivel] = React.useState(3);
    const [profesional, setProfesional] = React.useState(null);
    
    const [tabActivo, setTabActivo] = React.useState('reservas');
    
    const [showClientesPendientes, setShowClientesPendientes] = React.useState(false);
    const [clientesPendientes, setClientesPendientes] = React.useState([]);
    const [showClientesAutorizados, setShowClientesAutorizados] = React.useState(false);
    const [clientesAutorizados, setClientesAutorizados] = React.useState([]);
    const [errorClientes, setErrorClientes] = React.useState('');
    const [cargandoClientes, setCargandoClientes] = React.useState(false);

    const [showNuevaReservaModal, setShowNuevaReservaModal] = React.useState(false);
    const [nuevaReservaData, setNuevaReservaData] = React.useState({
        cliente_nombre: '',
        cliente_whatsapp: '',
        servicio: '',
        profesional_id: '',
        fecha: '',
        hora_inicio: ''
    });

    const [serviciosList, setServiciosList] = React.useState([]);
    const [profesionalesList, setProfesionalesList] = React.useState([]);
    const [horariosDisponibles, setHorariosDisponibles] = React.useState([]);
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [diasLaborales, setDiasLaborales] = React.useState([]);
    const [fechasConHorarios, setFechasConHorarios] = React.useState({});

    // ============================================
    // DETECTAR ROL DEL USUARIO - SOLO PROFESIONALES
    // ============================================
    React.useEffect(() => {
        // ✅ Usar getProfesionalAutenticado (NO barbero)
        const profesionalAuth = window.getProfesionalAutenticado?.();
        
        if (profesionalAuth) {
            console.log('👩‍🎨 Usuario detectado como profesional:', profesionalAuth);
            setUserRole('profesional');
            setProfesional(profesionalAuth);
            setUserNivel(profesionalAuth.nivel || 1);
            
            setNuevaReservaData(prev => ({
                ...prev,
                profesional_id: profesionalAuth.id
            }));
        } else {
            console.log('👑 Usuario detectado como dueña');
            setUserRole('admin');
            setUserNivel(3);
        }
    }, []);

    // Cargar datos para el modal
    React.useEffect(() => {
        const cargarDatosModal = async () => {
            if (window.salonServicios) {
                const servicios = await window.salonServicios.getAll(true);
                setServiciosList(servicios || []);
            }
            if (window.salonProfesionales) {
                const profesionales = await window.salonProfesionales.getAll(true);
                setProfesionalesList(profesionales || []);
            }
        };
        cargarDatosModal();
    }, []);

    // ============================================
    // FUNCIONES DE CLIENTES
    // ============================================
    
    const loadClientesPendientes = async () => {
        console.log('🔄 Cargando clientes pendientes...');
        setCargandoClientes(true);
        try {
            if (typeof window.getClientesPendientes !== 'function') {
                console.error('❌ getClientesPendientes no está definida');
                setErrorClientes('Error: Sistema de clientes no disponible');
                setClientesPendientes([]);
                return;
            }
            
            const pendientes = await window.getClientesPendientes();
            console.log('📋 Pendientes obtenidos:', pendientes);
            
            if (Array.isArray(pendientes)) {
                setClientesPendientes(pendientes);
            } else {
                console.error('❌ pendientes no es un array:', pendientes);
                setClientesPendientes([]);
            }
            setErrorClientes('');
        } catch (error) {
            console.error('Error cargando pendientes:', error);
            setErrorClientes('Error al cargar solicitudes');
            setClientesPendientes([]);
        } finally {
            setCargandoClientes(false);
        }
    };

    const loadClientesAutorizados = async () => {
        console.log('🔄 Cargando clientes autorizados...');
        setCargandoClientes(true);
        try {
            if (typeof window.getClientesAutorizados !== 'function') {
                console.error('❌ getClientesAutorizados no está definida');
                setClientesAutorizados([]);
                return;
            }
            
            const autorizados = await window.getClientesAutorizados();
            console.log('📋 Autorizados obtenidos:', autorizados);
            
            if (Array.isArray(autorizados)) {
                setClientesAutorizados(autorizados);
            } else {
                console.error('❌ autorizados no es un array:', autorizados);
                setClientesAutorizados([]);
            }
        } catch (error) {
            console.error('Error cargando autorizados:', error);
            setClientesAutorizados([]);
        } finally {
            setCargandoClientes(false);
        }
    };

    const handleAprobarCliente = async (whatsapp) => {
        console.log('✅ Aprobando:', whatsapp);
        try {
            if (typeof window.aprobarCliente !== 'function') {
                alert('Error: Sistema de clientes no disponible');
                return;
            }
            const cliente = await window.aprobarCliente(whatsapp);
            if (cliente) {
                await loadClientesPendientes();
                await loadClientesAutorizados();
                alert(`✅ Cliente ${cliente.nombre} aprobada`);
                
                const mensaje = `✅ ¡Hola ${cliente.nombre}! Tu acceso a Rservas.Roma ha sido APROBADO. Ya podés reservar turnos desde la app.`;
                const telefono = cliente.whatsapp.replace(/\D/g, '');
                const encodedText = encodeURIComponent(mensaje);
                window.open(`https://api.whatsapp.com/send?phone=${telefono}&text=${encodedText}`, '_blank');
            }
        } catch (error) {
            console.error('Error aprobando:', error);
            alert('Error al aprobar cliente');
        }
    };

    const handleRechazarCliente = async (whatsapp) => {
        if (!confirm('¿Rechazar esta solicitud?')) return;
        console.log('❌ Rechazando:', whatsapp);
        try {
            if (typeof window.rechazarCliente !== 'function') {
                alert('Error: Sistema de clientes no disponible');
                return;
            }
            const resultado = await window.rechazarCliente(whatsapp);
            if (resultado) {
                await loadClientesPendientes();
            }
        } catch (error) {
            console.error('Error rechazando:', error);
            alert('Error al rechazar cliente');
        }
    };

    const handleEliminarAutorizado = async (whatsapp) => {
        if (!confirm('¿Seguro que querés eliminar esta cliente autorizada? Perderá el acceso a la app.')) return;
        console.log('🗑️ Eliminando autorizado:', whatsapp);
        try {
            if (typeof window.eliminarClienteAutorizado !== 'function') {
                alert('Error: Función no disponible');
                return;
            }
            const resultado = await window.eliminarClienteAutorizado(whatsapp);
            if (resultado) {
                await loadClientesAutorizados();
                alert(`✅ Cliente eliminada`);
            }
        } catch (error) {
            console.error('Error eliminando autorizado:', error);
            alert('Error al eliminar cliente');
        }
    };

    // ============================================
    // FUNCIONES DE RESERVAS
    // ============================================
    const fetchBookings = async () => {
        setLoading(true);
        try {
            let data;
            
            // ✅ Usar getReservasPorProfesional (NO barbero)
            if (userRole === 'profesional' && profesional) {
                console.log(`📋 Cargando reservas de profesional ${profesional.id}...`);
                data = await window.getReservasPorProfesional?.(profesional.id, false) || [];
            } else {
                data = await getAllBookings();
            }
            
            if (Array.isArray(data)) {
                data.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora_inicio.localeCompare(b.hora_inicio));
                
                await marcarTurnosCompletados();
                
                if (userRole === 'profesional' && profesional) {
                    data = await window.getReservasPorProfesional?.(profesional.id, false) || [];
                } else {
                    data = await getAllBookings();
                }
                
                setBookings(Array.isArray(data) ? data : []);
            } else {
                setBookings([]);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            alert('Error al cargar las reservas');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const intervalo = setInterval(() => {
            console.log('⏰ Verificando turnos para completar...');
            
            marcarTurnosCompletados().then(() => {
                fetchBookings();
            });
            
        }, 60000);
        
        return () => clearInterval(intervalo);
    }, []);

    React.useEffect(() => {
        fetchBookings();
        
        if (userRole === 'admin' || (userRole === 'profesional' && userNivel >= 2)) {
            loadClientesAutorizados();
        }
        
        console.log('🔍 Verificando auth:', {
            userRole,
            userNivel,
            profesional
        });
    }, [userRole, userNivel, profesional]);

    const handleCancel = async (id, bookingData) => {
        if (!confirm(`¿Cancelar reserva de ${bookingData.cliente_nombre}?`)) return;
        
        const ok = await cancelBooking(id);
        if (ok) {
            enviarCancelacionWhatsApp(bookingData);
            
            try {
                const fechaConDia = window.formatFechaCompleta ? 
                    window.formatFechaCompleta(bookingData.fecha) : 
                    bookingData.fecha;
                
                const mensajeLimpio = 
`CANCELACION POR ADMIN

Cliente: ${bookingData.cliente_nombre}
WhatsApp: ${bookingData.cliente_whatsapp}
Servicio: ${bookingData.servicio}
Fecha: ${fechaConDia}
Hora: ${formatTo12Hour(bookingData.hora_inicio)}
Profesional: ${bookingData.profesional_nombre || bookingData.trabajador_nombre || 'No asignada'}

La administradora canceló la reserva.`;

                fetch('https://ntfy.sh/rservas-roma', {
                    method: 'POST',
                    body: mensajeLimpio,
                    headers: {
                        'Title': 'Cancelación por admin - Rservas.Roma',
                        'Priority': 'default',
                        'Tags': 'x'
                    }
                });
                
            } catch (error) {
                console.error('Error enviando notificación:', error);
            }
            
            alert('✅ Reserva cancelada y cliente notificada');
            fetchBookings();
        } else {
            alert('❌ Error al cancelar');
        }
    };

    const handleLogout = () => {
        if (confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminLoginTime');
            localStorage.removeItem('profesionalAuth'); // ✅ CORREGIDO
            localStorage.removeItem('userRole');
            
            console.log('🚪 Sesión cerrada, redirigiendo a la app de clientes');
            window.location.href = 'index.html';
        }
    };

    const getFilteredBookings = () => {
        let filtradas = filterDate
            ? bookings.filter(b => b.fecha === filterDate)
            : [...bookings];
        
        if (statusFilter === 'activas') {
            return filtradas.filter(b => b.estado === 'Reservado');
        } else if (statusFilter === 'completadas') {
            return filtradas.filter(b => b.estado === 'Completado');
        } else if (statusFilter === 'canceladas') {
            return filtradas.filter(b => b.estado === 'Cancelado');
        } else {
            return filtradas;
        }
    };

    const activasCount = bookings.filter(b => b.estado === 'Reservado').length;
    const completadasCount = bookings.filter(b => b.estado === 'Completado').length;
    const canceladasCount = bookings.filter(b => b.estado === 'Cancelado').length;
    const filteredBookings = getFilteredBookings();

    // ============================================
    // PESTAÑAS DISPONIBLES - SOLO PROFESIONALES
    // ============================================
    const getTabsDisponibles = () => {
        const tabs = [];
        tabs.push({ id: 'reservas', icono: '📅', label: userRole === 'profesional' ? 'Mis Turnos' : 'Reservas' });
        
        if (userRole === 'admin' || (userRole === 'profesional' && userNivel >= 2)) {
            tabs.push({ id: 'configuracion', icono: '⚙️', label: 'Configuración' });
            tabs.push({ id: 'clientes', icono: '👤', label: 'Clientas' });
        }
        
        if (userRole === 'admin' || (userRole === 'profesional' && userNivel >= 3)) {
            tabs.push({ id: 'servicios', icono: '💅', label: 'Servicios' });
            tabs.push({ id: 'profesionales', icono: '👩‍🎨', label: 'Profesionales' }); // ✅ CORREGIDO
        }
        
        return tabs;
    };

    const abrirModalNuevaReserva = () => {
        setNuevaReservaData({
            cliente_nombre: '',
            cliente_whatsapp: '',
            servicio: '',
            profesional_id: userRole === 'profesional' ? profesional?.id : '',
            fecha: '',
            hora_inicio: ''
        });
        setCurrentDate(new Date());
        setDiasLaborales([]);
        setFechasConHorarios({});
        setShowNuevaReservaModal(true);
    };

    const tabsDisponibles = getTabsDisponibles();

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-4">
                
                {/* HEADER */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center flex-wrap gap-2">
                    <div>
                        <h1 className="text-xl font-bold">
                            {userRole === 'profesional' 
                                ? `Panel de ${profesional?.nombre}`
                                : 'Panel Admin - Rservas.Roma'
                            }
                        </h1>
                        {userRole === 'profesional' && (
                            <p className="text-xs mt-1">
                                <span className={`px-2 py-0.5 rounded-full ${
                                    userNivel === 1 ? 'bg-gray-100 text-gray-600' :
                                    userNivel === 2 ? 'bg-blue-100 text-blue-600' :
                                    'bg-purple-100 text-purple-600'
                                }`}>
                                    {userNivel === 1 && '🔰 Principiante'}
                                    {userNivel === 2 && '⭐ Intermedia'}
                                    {userNivel === 3 && '👑 Experta'}
                                </span>
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={abrirModalNuevaReserva}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition transform hover:scale-105 shadow-md"
                            title="Crear reserva para una clienta"
                        >
                            <span>📅</span>
                            <span className="hidden sm:inline">Nueva Reserva</span>
                        </button>
                        <button 
                            onClick={fetchBookings} 
                            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                            title="Actualizar"
                        >
                            🔄
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                            title="Cerrar sesión"
                        >
                            🚪
                        </button>
                    </div>
                </div>

                {/* MODAL NUEVA RESERVA */}
                {showNuevaReservaModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">📅 Nueva Reserva Manual</h3>
                                <button 
                                    onClick={() => setShowNuevaReservaModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre de la Cliente *
                                    </label>
                                    <input
                                        type="text"
                                        value={nuevaReservaData.cliente_nombre}
                                        onChange={(e) => setNuevaReservaData({...nuevaReservaData, cliente_nombre: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="Ej: María Pérez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        WhatsApp de la Cliente *
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                            +53
                                        </span>
                                        <input
                                            type="tel"
                                            value={nuevaReservaData.cliente_whatsapp}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                setNuevaReservaData({...nuevaReservaData, cliente_whatsapp: value});
                                            }}
                                            className="w-full px-4 py-2 rounded-r-lg border border-gray-300"
                                            placeholder="53111111"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">8 dígitos después del +53</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Servicio *
                                    </label>
                                    <select
                                        value={nuevaReservaData.servicio}
                                        onChange={(e) => setNuevaReservaData({...nuevaReservaData, servicio: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="">Seleccionar servicio</option>
                                        {serviciosList.map(s => (
                                            <option key={s.id} value={s.nombre}>
                                                {s.nombre} ({s.duracion} min - ${s.precio})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Profesional *
                                    </label>
                                    {userRole === 'profesional' && userNivel <= 2 ? (
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                Reserva asignada a vos: <strong>{profesional?.nombre}</strong>
                                            </p>
                                        </div>
                                    ) : (
                                        <select
                                            value={nuevaReservaData.profesional_id}
                                            onChange={(e) => setNuevaReservaData({...nuevaReservaData, profesional_id: e.target.value})}
                                            className="w-full border rounded-lg px-3 py-2"
                                        >
                                            <option value="">Seleccionar profesional</option>
                                            {profesionalesList.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nombre} - {p.especialidad}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Fecha y horarios... (mantener el código existente) */}
                                
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowNuevaReservaModal(false)}
                                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={async () => {
                                            // Lógica para crear reserva
                                            if (!nuevaReservaData.cliente_nombre || !nuevaReservaData.cliente_whatsapp || 
                                                !nuevaReservaData.servicio || !nuevaReservaData.profesional_id || 
                                                !nuevaReservaData.fecha || !nuevaReservaData.hora_inicio) {
                                                alert('Completá todos los campos');
                                                return;
                                            }

                                            const servicio = serviciosList.find(s => s.nombre === nuevaReservaData.servicio);
                                            const profesional = profesionalesList.find(p => p.id === parseInt(nuevaReservaData.profesional_id));
                                            
                                            const endTime = calculateEndTime(nuevaReservaData.hora_inicio, servicio.duracion);
                                            
                                            const bookingData = {
                                                cliente_nombre: nuevaReservaData.cliente_nombre,
                                                cliente_whatsapp: `53${nuevaReservaData.cliente_whatsapp.replace(/\D/g, '')}`,
                                                servicio: nuevaReservaData.servicio,
                                                duracion: servicio.duracion,
                                                profesional_id: nuevaReservaData.profesional_id,
                                                profesional_nombre: profesional.nombre,
                                                fecha: nuevaReservaData.fecha,
                                                hora_inicio: nuevaReservaData.hora_inicio,
                                                hora_fin: endTime,
                                                estado: "Reservado"
                                            };

                                            const result = await createBooking(bookingData);
                                            
                                            if (result.success) {
                                                alert('✅ Reserva creada exitosamente');
                                                setShowNuevaReservaModal(false);
                                                fetchBookings();
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Crear Reserva
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PESTAÑAS */}
                <div className="bg-white p-2 rounded-xl shadow-sm flex flex-wrap gap-2">
                    {tabsDisponibles.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setTabActivo(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                tabActivo === tab.id 
                                    ? 'bg-pink-600 text-white shadow-md scale-105' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <span>{tab.icono}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* CONTENIDO DE LAS PESTAÑAS */}
                {tabActivo === 'configuracion' && (
                    <ConfigPanel 
                        profesionalId={userRole === 'profesional' ? profesional?.id : null}
                        modoRestringido={userRole === 'profesional' && userNivel === 2}
                    />
                )}

                {tabActivo === 'servicios' && (userRole === 'admin' || userNivel >= 3) && (
                    <ServiciosPanel />
                )}

                {tabActivo === 'profesionales' && (userRole === 'admin' || userNivel >= 3) && (
                    <ProfesionalesPanel />
                )}

                {tabActivo === 'clientes' && (userRole === 'admin' || userNivel >= 2) && (
                    <div className="space-y-4">
                        {/* Clientes Autorizados */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                            <button
                                onClick={() => {
                                    setShowClientesAutorizados(!showClientesAutorizados);
                                    if (!showClientesAutorizados) loadClientesAutorizados();
                                }}
                                className="flex items-center justify-between w-full"
                            >
                                <div className="flex items-center gap-2">
                                    <span>✅</span>
                                    <span className="font-medium">Clientas Autorizadas</span>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                        {clientesAutorizados.length}
                                    </span>
                                </div>
                                <span>{showClientesAutorizados ? '▲' : '▼'}</span>
                            </button>
                            
                            {showClientesAutorizados && (
                                <div className="mt-4">
                                    {clientesAutorizados.length === 0 ? (
                                        <p className="text-gray-500">No hay clientas autorizadas</p>
                                    ) : (
                                        clientesAutorizados.map((cliente, index) => (
                                            <div key={index} className="bg-green-50 p-3 rounded-lg mb-2">
                                                <p className="font-bold">{cliente.nombre}</p>
                                                <p className="text-sm">📱 +{cliente.whatsapp}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Solicitudes Pendientes */}
                        {(userRole === 'admin' || userNivel >= 3) && (
                            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500">
                                <button
                                    onClick={() => {
                                        setShowClientesPendientes(!showClientesPendientes);
                                        if (!showClientesPendientes) loadClientesPendientes();
                                    }}
                                    className="flex items-center justify-between w-full"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>⏳</span>
                                        <span className="font-medium">Solicitudes Pendientes</span>
                                        {clientesPendientes.length > 0 && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                                {clientesPendientes.length}
                                            </span>
                                        )}
                                    </div>
                                    <span>{showClientesPendientes ? '▲' : '▼'}</span>
                                </button>
                                
                                {showClientesPendientes && (
                                    <div className="mt-4">
                                        {clientesPendientes.length === 0 ? (
                                            <p className="text-gray-500">No hay solicitudes pendientes</p>
                                        ) : (
                                            clientesPendientes.map((cliente, index) => (
                                                <div key={index} className="bg-yellow-50 p-3 rounded-lg mb-2">
                                                    <p className="font-bold">{cliente.nombre}</p>
                                                    <p className="text-sm">📱 +{cliente.whatsapp}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* RESERVAS */}
                {tabActivo === 'reservas' && (
                    <>
                        {userRole === 'profesional' && profesional && (
                            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                                <p className="text-pink-800 font-medium">
                                    Hola {profesional.nombre} 👋 - Mostrando tus turnos ({filteredBookings.length})
                                </p>
                            </div>
                        )}

                        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                            <div className="flex flex-wrap gap-3 items-center">
                                <input 
                                    type="date" 
                                    value={filterDate} 
                                    onChange={(e) => setFilterDate(e.target.value)} 
                                    className="border rounded-lg px-3 py-2 text-sm"
                                />
                                {filterDate && (
                                    <button onClick={() => setFilterDate('')} className="text-red-500 text-sm">
                                        Limpiar filtro
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setStatusFilter('activas')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        statusFilter === 'activas' 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    Activas ({activasCount})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('completadas')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        statusFilter === 'completadas' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    Completadas ({completadasCount})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('canceladas')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        statusFilter === 'canceladas' 
                                            ? 'bg-red-500 text-white' 
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    Canceladas ({canceladasCount})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('todas')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        statusFilter === 'todas' 
                                            ? 'bg-gray-800 text-white' 
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    Todas ({bookings.length})
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                                <p className="text-gray-500 mt-4">Cargando reservas...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredBookings.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl">
                                        <p className="text-gray-500">No hay reservas para mostrar</p>
                                    </div>
                                ) : (
                                    filteredBookings.map(b => (
                                        <div key={b.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${
                                            b.estado === 'Reservado' ? 'border-l-pink-500' :
                                            b.estado === 'Completado' ? 'border-l-green-500' :
                                            'border-l-red-500'
                                        }`}>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-semibold">
                                                    {window.formatFechaCompleta ? window.formatFechaCompleta(b.fecha) : b.fecha}
                                                </span>
                                                <span className="text-sm bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                                                    {formatTo12Hour(b.hora_inicio)}
                                                </span>
                                            </div>
                                            <div className="text-sm space-y-1">
                                                <p><span className="font-medium">👤 Cliente:</span> {b.cliente_nombre}</p>
                                                <p><span className="font-medium">📱 WhatsApp:</span> {b.cliente_whatsapp}</p>
                                                <p><span className="font-medium">💅 Servicio:</span> {b.servicio}</p>
                                                <p><span className="font-medium">👩‍🎨 Profesional:</span> {b.profesional_nombre || b.trabajador_nombre}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-3 pt-2 border-t">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                    ${b.estado === 'Reservado' ? 'bg-yellow-100 text-yellow-700' : 
                                                      b.estado === 'Completado' ? 'bg-green-100 text-green-700' : 
                                                      'bg-red-100 text-red-700'}`}>
                                                    {b.estado}
                                                </span>
                                                {b.estado === 'Reservado' && (
                                                    <button 
                                                        onClick={() => handleCancel(b.id, b)} 
                                                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 flex items-center gap-1"
                                                    >
                                                        <span>❌</span> Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminApp />);