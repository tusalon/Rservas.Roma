// super-admin-app.js

const supabase = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

const SUPER_ADMIN_EMAIL = 'rservasroma@gmail.com';

function SuperAdminApp() {
    const [cargando, setCargando] = React.useState(true);
    const [negocios, setNegocios] = React.useState([]);
    const [negocioSeleccionado, setNegocioSeleccionado] = React.useState(null);
    const [mostrarDetalle, setMostrarDetalle] = React.useState(false);
    const [filtro, setFiltro] = React.useState('todos');
    const [verificado, setVerificado] = React.useState(false);

    React.useEffect(() => {
        verificarSuperAdmin();
    }, []);

    const verificarSuperAdmin = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) throw error;
            
            if (!user || user.email !== SUPER_ADMIN_EMAIL) {
                alert('Acceso denegado. Solo super admin puede entrar.');
                window.location.href = 'index.html';
                return;
            }
            
            setVerificado(true);
            cargarNegocios();
        } catch (error) {
            console.error('Error verificando usuario:', error);
            alert('Error al verificar usuario');
            window.location.href = 'index.html';
        }
    };

    const cargarNegocios = async () => {
        setCargando(true);
        try {
            const { data, error } = await supabase
                .from('vista_negocios_admin')
                .select('*')
                .order('fecha_registro', { ascending: false });

            if (error) throw error;
            
            // Eliminar duplicados
            const unicos = data.filter((item, index, self) => 
                index === self.findIndex(t => t.id === item.id)
            );
            
            setNegocios(unicos);
        } catch (error) {
            console.error('Error cargando negocios:', error);
            alert('Error al cargar los negocios: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    const negociosFiltrados = negocios.filter(neg => {
        if (filtro === 'todos') return true;
        if (filtro === 'activos') return neg.estado_suscripcion === 'activa';
        if (filtro === 'trial') return neg.estado_suscripcion === 'trial';
        if (filtro === 'suspendidos') return neg.estado_suscripcion === 'suspendida';
        return true;
    });

    const verDetalle = (negocio) => {
        setNegocioSeleccionado(negocio);
        setMostrarDetalle(true);
    };

    if (!verificado) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">👑 Super Admin - Rservas.Roma</h1>
                            <p className="text-gray-500 mt-1">Gestión de todos los negocios</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={cargarNegocios}
                                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                            >
                                🔄 Actualizar
                            </button>
                        </div>
                    </div>

                    {/* Métricas rápidas */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        <div className="bg-pink-50 p-4 rounded-lg">
                            <p className="text-sm text-pink-600">Total negocios</p>
                            <p className="text-2xl font-bold">{negocios.length}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600">Activos</p>
                            <p className="text-2xl font-bold">{negocios.filter(n => n.estado_suscripcion === 'activa').length}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="text-sm text-yellow-600">En trial</p>
                            <p className="text-2xl font-bold">{negocios.filter(n => n.estado_suscripcion === 'trial').length}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-purple-600">Ingresos mensuales</p>
                            <p className="text-2xl font-bold">${negocios.reduce((acc, n) => acc + (n.monto_ultimo_pago || 0), 0)}</p>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setFiltro('todos')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                filtro === 'todos' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFiltro('activos')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                filtro === 'activos' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            Activos
                        </button>
                        <button
                            onClick={() => setFiltro('trial')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                filtro === 'trial' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            En prueba
                        </button>
                    </div>
                </div>

                {/* Lista de negocios */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">📋 Lista de negocios</h2>
                    
                    {negocios.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No hay negocios para mostrar</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {negociosFiltrados.map(negocio => (
                                <div
                                    key={negocio.id}
                                    className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                                    onClick={() => verDetalle(negocio)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg">{negocio.nombre}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    negocio.estado_suscripcion === 'activa' ? 'bg-green-100 text-green-700' :
                                                    negocio.estado_suscripcion === 'trial' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {negocio.estado_suscripcion}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    negocio.plan_actual === 'premium' ? 'bg-purple-100 text-purple-700' :
                                                    negocio.plan_actual === 'pro' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {negocio.plan_actual}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Email</p>
                                                    <p className="font-medium">{negocio.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Teléfono</p>
                                                    <p className="font-medium">{negocio.telefono}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Registro</p>
                                                    <p className="font-medium">{new Date(negocio.fecha_registro).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Días activo</p>
                                                    <p className="font-medium">{negocio.dias_activo}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Profesionales</p>
                                                    <p className="font-medium">{negocio.profesionales_activas}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Reservas mes</p>
                                                    <p className="font-medium">{negocio.reservas_mes}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Clientas</p>
                                                    <p className="font-medium">{negocio.clientas_activas}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    verDetalle(negocio);
                                                }}
                                                className="px-3 py-1 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700"
                                            >
                                                Ver detalle
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de detalle */}
            {mostrarDetalle && negocioSeleccionado && (
                <DetalleNegocio
                    negocio={negocioSeleccionado}
                    onCerrar={() => setMostrarDetalle(false)}
                    onActualizar={cargarNegocios}
                />
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SuperAdminApp />);