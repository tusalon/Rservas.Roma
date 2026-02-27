// components/admin/DetalleNegocio.js

function DetalleNegocio({ negocio, onCerrar, onActualizar }) {
    const [accion, setAccion] = React.useState('');
    const [procesando, setProcesando] = React.useState(false);

    const handleAccion = async (tipo) => {
        if (!confirm(`¿Estás segura de ${tipo === 'suspender' ? 'suspender' : 'activar'} este negocio?`)) return;
        
        setProcesando(true);
        try {
            const nuevoEstado = tipo === 'suspender' ? 'suspendida' : 'activa';
            
            const { error } = await supabase
                .from('suscripciones')
                .update({ estado: nuevoEstado })
                .eq('negocio_id', negocio.id);

            if (error) throw error;

            alert(`✅ Negocio ${tipo === 'suspender' ? 'suspendido' : 'activado'} correctamente`);
            onActualizar();
            onCerrar();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar el negocio');
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorEstado(negocio.estado_suscripcion)}`}>
                                {negocio.estado_suscripcion}
                            </span>
                        </div>
                    </div>

                    {/* Suscripción */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-pink-50 p-3 rounded-lg">
                            <p className="text-xs text-pink-600">Plan</p>
                            <p className="text-lg font-bold capitalize">{negocio.plan_actual}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-600">Próximo pago</p>
                            <p className="text-lg font-bold">{new Date(negocio.proximo_pago).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="text-xs text-purple-600">Último pago</p>
                            <p className="text-lg font-bold">
                                {negocio.fecha_ultimo_pago ? new Date(negocio.fecha_ultimo_pago).toLocaleDateString() : 'Sin pagos'}
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
                            <p className="text-2xl font-bold text-pink-600">{negocio.profesionales_activas}</p>
                            <p className="text-xs text-gray-500">Profesionales</p>
                        </div>
                        <div className="border p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-pink-600">{negocio.reservas_mes}</p>
                            <p className="text-xs text-gray-500">Reservas mes</p>
                        </div>
                        <div className="border p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-pink-600">{negocio.clientas_activas}</p>
                            <p className="text-xs text-gray-500">Clientas</p>
                        </div>
                    </div>

                    {/* Tiempo */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-600">
                            Registrado el {new Date(negocio.fecha_registro).toLocaleDateString()} 
                            ({negocio.dias_activo} días activo)
                        </p>
                        {negocio.dias_para_renovar && (
                            <p className="text-sm text-gray-600 mt-1">
                                ⏰ Próximo pago en {negocio.dias_para_renovar} días
                            </p>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onCerrar}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        >
                            Cerrar
                        </button>
                        
                        {negocio.estado_suscripcion !== 'suspendida' ? (
                            <button
                                onClick={() => handleAccion('suspender')}
                                disabled={procesando}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {procesando ? 'Procesando...' : 'Suspender negocio'}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleAccion('activar')}
                                disabled={procesando}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {procesando ? 'Procesando...' : 'Activar negocio'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}