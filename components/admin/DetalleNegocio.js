// components/admin/DetalleNegocio.js

function DetalleNegocio({ negocio, onCerrar, onActualizar }) {
    const [procesando, setProcesando] = React.useState(false);
    const [historialPagos, setHistorialPagos] = React.useState([]);
    const [cargandoHistorial, setCargandoHistorial] = React.useState(false);

    React.useEffect(() => {
        if (negocio) {
            cargarHistorialPagos();
        }
    }, [negocio]);

    const cargarHistorialPagos = async () => {
        setCargandoHistorial(true);
        try {
            const { data, error } = await window.supabase
                .from('historial_pagos')
                .select('*')
                .eq('negocio_id', negocio.id)
                .order('fecha_pago', { ascending: false });

            if (error) throw error;
            setHistorialPagos(data || []);
        } catch (error) {
            console.error('Error cargando historial:', error);
        } finally {
            setCargandoHistorial(false);
        }
    };

    const handleSuspender = async () => {
        if (!confirm(`¿Estás segura de suspender el negocio "${negocio.nombre}"?`)) return;
        
        setProcesando(true);
        try {
            const { error } = await window.supabase
                .from('suscripciones')
                .update({ estado: 'suspendida' })
                .eq('negocio_id', negocio.id);

            if (error) throw error;

            alert('✅ Negocio suspendido correctamente');
            onActualizar();
            onCerrar();
        } catch (error) {
            console.error('Error suspendiendo:', error);
            alert('Error al suspender el negocio');
        } finally {
            setProcesando(false);
        }
    };

    const handleActivar = async () => {
        if (!confirm(`¿Estás segura de activar el negocio "${negocio.nombre}"?`)) return;
        
        setProcesando(true);
        try {
            const { error } = await window.supabase
                .from('suscripciones')
                .update({ estado: 'activa' })
                .eq('negocio_id', negocio.id);

            if (error) throw error;

            alert('✅ Negocio activado correctamente');
            onActualizar();
            onCerrar();
        } catch (error) {
            console.error('Error activando:', error);
            alert('Error al activar el negocio');
        } finally {
            setProcesando(false);
        }
    };

    const handleCambiarPlan = async (nuevoPlan) => {
        console.log('📌 handleCambiarPlan EJECUTÁNDOSE con:', nuevoPlan);
        
        if (!confirm(`¿Cambiar plan de "${negocio.plan_actual}" a "${nuevoPlan}"?`)) return;
        
        setProcesando(true);
        try {
            console.log('📌 Actualizando en Supabase...');
            const { error } = await window.supabase
                .from('suscripciones')
                .update({ plan: nuevoPlan })
                .eq('negocio_id', negocio.id);

            if (error) throw error;

            console.log('📌 Update exitoso');
            alert(`✅ Plan cambiado a ${nuevoPlan}`);
            onActualizar();
            onCerrar();
        } catch (error) {
            console.error('❌ Error cambiando plan:', error);
            alert('Error al cambiar el plan: ' + error.message);
        } finally {
            setProcesando(false);
        }
    };

    const getColorEstado = (estado) => {
        switch(estado) {
            case 'activa': return 'text-green-600 bg-green-50';
            case 'trial': return 'text-yellow-600 bg-yellow-50';
            case 'suspendida': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">📊 Detalle del negocio</h3>
                        <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700 text-2xl">
                            ×
                        </button>
                    </div>

                    {/* Info básica */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-2xl font-bold text-gray-800">{negocio.nombre}</h4>
                                <p className="text-gray-600">{negocio.email}</p>
                                <p className="text-gray-600">📱 {negocio.telefono}</p>
                                <p className="text-xs text-gray-400 mt-1">ID: {negocio.id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorEstado(negocio.estado_suscripcion)}`}>
                                {negocio.estado_suscripcion}
                            </span>
                        </div>
                    </div>

                    {/* Suscripción */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-pink-50 p-3 rounded-lg">
                            <p className="text-xs text-pink-600">Plan actual</p>
                            <p className="text-lg font-bold capitalize">{negocio.plan_actual}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-600">Próximo pago</p>
                            <p className="text-lg font-bold">{negocio.proximo_pago ? formatFecha(negocio.proximo_pago) : 'No definido'}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="text-xs text-purple-600">Último pago</p>
                            <p className="text-lg font-bold">
                                {negocio.fecha_ultimo_pago ? formatFecha(negocio.fecha_ultimo_pago) : 'Sin pagos'}
                            </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-green-600">Monto</p>
                            <p className="text-lg font-bold">${negocio.monto_ultimo_pago || 0}</p>
                        </div>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="border p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-pink-600">{negocio.profesionales_activas || 0}</p>
                            <p className="text-xs text-gray-500">Profesionales</p>
                        </div>
                        <div className="border p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-pink-600">{negocio.reservas_mes || 0}</p>
                            <p className="text-xs text-gray-500">Reservas mes</p>
                        </div>
                        <div className="border p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-pink-600">{negocio.clientas_activas || 0}</p>
                            <p className="text-xs text-gray-500">Clientas</p>
                        </div>
                    </div>

                    {/* Tiempo */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-600">
                            Registrado el {formatFecha(negocio.fecha_registro)} 
                            ({negocio.dias_activo} días activo)
                        </p>
                        {negocio.dias_para_renovar && (
                            <p className="text-sm text-gray-600 mt-1">
                                ⏰ Próximo pago en {negocio.dias_para_renovar} días
                            </p>
                        )}
                    </div>

                    {/* Historial de pagos */}
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">💰 Historial de pagos</h4>
                        {cargandoHistorial ? (
                            <p className="text-gray-500">Cargando...</p>
                        ) : historialPagos.length === 0 ? (
                            <p className="text-gray-500 text-sm">No hay pagos registrados</p>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {historialPagos.map(pago => (
                                    <div key={pago.id} className="bg-gray-50 p-2 rounded text-sm flex justify-between">
                                        <span>{formatFecha(pago.fecha_pago)}</span>
                                        <span className="font-bold">${pago.monto}</span>
                                        <span className="text-gray-500">{pago.plan_pagado}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">⚙️ Acciones</h4>
                        <div className="flex flex-wrap gap-3">
                            {/* Cambiar plan - CON CONSOLES.LOG */}
                            <select
                                onChange={(e) => {
                                    console.log('🟢 Valor seleccionado:', e.target.value);
                                    console.log('🟢 Llamando a handleCambiarPlan...');
                                    handleCambiarPlan(e.target.value);
                                }}
                                disabled={procesando}
                                className="px-3 py-2 border rounded-lg text-sm"
                                defaultValue=""
                            >
                                <option value="" disabled>Cambiar plan</option>
                                <option value="gratuito">Gratuito</option>
                                <option value="pro">Pro ($29/mes)</option>
                                <option value="premium">Premium ($79/mes)</option>
                            </select>

                            {/* Suspender / Activar */}
                            {negocio.estado_suscripcion !== 'suspendida' ? (
                                <button
                                    onClick={handleSuspender}
                                    disabled={procesando}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {procesando ? 'Procesando...' : 'Suspender negocio'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleActivar}
                                    disabled={procesando}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {procesando ? 'Procesando...' : 'Activar negocio'}
                                </button>
                            )}

                            {/* Botón cerrar */}
                            <button
                                onClick={onCerrar}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}