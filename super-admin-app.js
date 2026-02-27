// super-admin-app.js - VERSIÓN SIMPLIFICADA

window.supabase = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);

const SUPER_ADMIN_EMAIL = 'rservasroma@gmail.com';

function SuperAdminApp() {
    const [negocios, setNegocios] = React.useState([]);
    const [cargando, setCargando] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        cargarNegocios();
    }, []);

    const cargarNegocios = async () => {
        setCargando(true);
        try {
            const { data, error } = await window.supabase
                .from('vista_negocios_admin')
                .select('*')
                .order('fecha_registro', { ascending: false });

            if (error) throw error;
            
            // Eliminar duplicados
            const unicos = data.filter((item, index, self) => 
                index === self.findIndex(t => t.id === item.id)
            );
            
            setNegocios([...unicos]);
            setError(null);
        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">👑 Super Admin - Rservas.Roma</h1>
                    <button
                        onClick={cargarNegocios}
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
                    >
                        🔄 Actualizar
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                        Error: {error}
                    </div>
                )}

                <div className="space-y-3">
                    {negocios.map(neg => (
                        <div key={neg.id} className="bg-white p-4 rounded-lg shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{neg.nombre}</h3>
                                    <p className="text-sm text-gray-600">{neg.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">ID: {neg.id}</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        neg.estado_suscripcion === 'activa' ? 'bg-green-100 text-green-700' :
                                        neg.estado_suscripcion === 'trial' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {neg.estado_suscripcion}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        neg.plan_actual === 'premium' ? 'bg-purple-100 text-purple-700' :
                                        neg.plan_actual === 'pro' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {neg.plan_actual}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                                <div>
                                    <p className="text-gray-500">Teléfono</p>
                                    <p className="font-medium">{neg.telefono}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Registro</p>
                                    <p className="font-medium">{new Date(neg.fecha_registro).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Días activo</p>
                                    <p className="font-medium">{neg.dias_activo}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Profesionales</p>
                                    <p className="font-medium">{neg.profesionales_activas}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SuperAdminApp />);