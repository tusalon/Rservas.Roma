// super-admin-app.js - VERSIÓN CON MODAL DE DETALLE Y RESUMEN DE PAGOS

console.log('🔥 super-admin-app.js CARGADO');

window.supabase = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);

function SuperAdminApp() {
    const [negocios, setNegocios] = React.useState([]);
    const [cargando, setCargando] = React.useState(true);
    const [negocioSeleccionado, setNegocioSeleccionado] = React.useState(null);
    const [mostrarDetalle, setMostrarDetalle] = React.useState(false);

    React.useEffect(() => {
        cargarNegocios();
    }, []);

    const cargarNegocios = async () => {
        console.log('📥 Cargando negocios...');
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
            
            console.log('✅ Negocios cargados:', unicos.length);
            setNegocios([...unicos]); // Forzar nuevo array
        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            setCargando(false);
        }
    };

    const verDetalle = (negocio) => {
        console.log('🔍 Ver detalle de:', negocio.nombre);
        setNegocioSeleccionado(negocio);
        setMostrarDetalle(true);
    };

    if (cargando) {
        return React.createElement('div', { className: 'text-center p-6' },
            React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto' }),
            React.createElement('p', { className: 'mt-4 text-gray-600' }, 'Cargando...')
        );
    }

    return React.createElement('div', { className: 'p-6 max-w-7xl mx-auto' },
        React.createElement('h1', { className: 'text-2xl font-bold mb-4' }, '👑 Super Admin - Rservas.Roma'),
        
        // 🔥 RESUMEN DE PAGOS
        React.createElement(ResumenPagos, null),
        
        React.createElement('button', {
            onClick: cargarNegocios,
            className: 'bg-pink-600 text-white px-4 py-2 rounded-lg mb-4 hover:bg-pink-700'
        }, '🔄 Actualizar'),
        
        React.createElement('div', { className: 'space-y-3' },
            negocios.map(neg => 
                React.createElement('div', {
                    key: neg.id,
                    className: 'bg-white p-4 rounded-lg shadow border cursor-pointer hover:shadow-md transition',
                    onClick: () => verDetalle(neg)
                },
                    React.createElement('div', { className: 'flex justify-between items-start' },
                        React.createElement('div', null,
                            React.createElement('h3', { className: 'font-bold text-lg' }, neg.nombre),
                            React.createElement('p', { className: 'text-sm text-gray-600' }, neg.email),
                            React.createElement('p', { className: 'text-xs text-gray-400' }, `ID: ${neg.id}`)
                        ),
                        React.createElement('div', null,
                            React.createElement('span', {
                                className: `px-2 py-1 rounded-full text-xs font-medium ${
                                    neg.estado_suscripcion === 'activa' ? 'bg-green-100 text-green-700' :
                                    neg.estado_suscripcion === 'trial' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`
                            }, neg.estado_suscripcion),
                            React.createElement('span', {
                                className: `ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    neg.plan_actual === 'premium' ? 'bg-purple-100 text-purple-700' :
                                    neg.plan_actual === 'pro' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                }`
                            }, neg.plan_actual)
                        )
                    ),
                    React.createElement('div', { className: 'grid grid-cols-4 gap-4 mt-3 text-sm' },
                        React.createElement('div', null,
                            React.createElement('p', { className: 'text-gray-500' }, 'Teléfono'),
                            React.createElement('p', { className: 'font-medium' }, neg.telefono)
                        ),
                        React.createElement('div', null,
                            React.createElement('p', { className: 'text-gray-500' }, 'Registro'),
                            React.createElement('p', { className: 'font-medium' }, new Date(neg.fecha_registro).toLocaleDateString())
                        ),
                        React.createElement('div', null,
                            React.createElement('p', { className: 'text-gray-500' }, 'Días activo'),
                            React.createElement('p', { className: 'font-medium' }, neg.dias_activo)
                        ),
                        React.createElement('div', null,
                            React.createElement('p', { className: 'text-gray-500' }, 'Profesionales'),
                            React.createElement('p', { className: 'font-medium' }, neg.profesionales_activas)
                        )
                    )
                )
            )
        ),

        // Modal de detalle
        mostrarDetalle && negocioSeleccionado && React.createElement(DetalleNegocio, {
            negocio: negocioSeleccionado,
            onCerrar: () => setMostrarDetalle(false),
            onActualizar: cargarNegocios
        })
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(SuperAdminApp));