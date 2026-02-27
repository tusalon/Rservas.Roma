// components/admin/FacturasPanel.js

function FacturasPanel({ negocioId }) {
    const [pagos, setPagos] = React.useState([]);
    const [cargando, setCargando] = React.useState(true);

    React.useEffect(() => {
        cargarPagos();
    }, [negocioId]);

    const cargarPagos = async () => {
        setCargando(true);
        try {
            const { data, error } = await window.supabase
                .from('historial_pagos')
                .select('*')
                .eq('negocio_id', negocioId)
                .order('fecha_pago', { ascending: false });

            if (error) throw error;
            setPagos(data || []);
        } catch (error) {
            console.error('Error cargando pagos:', error);
        } finally {
            setCargando(false);
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString();
    };

    const getTotalPagado = () => {
        return pagos.reduce((acc, p) => acc + (p.monto || 0), 0);
    };

    if (cargando) {
        return (
            <div className="text-center py-4">
                <div className="animate-spin h-6 w-6 border-b-2 border-pink-600 mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">💰 Historial de pagos</h3>
                <span className="text-sm bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                    Total: ${getTotalPagado()}
                </span>
            </div>

            {pagos.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No hay pagos registrados</p>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {pagos.map(pago => (
                        <div key={pago.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{formatFecha(pago.fecha_pago)}</p>
                                    <p className="text-xs text-gray-500">{pago.plan_pagado}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">${pago.monto}</p>
                                    <p className="text-xs text-gray-400">{pago.metodo_pago || 'manual'}</p>
                                </div>
                            </div>
                            {pago.notas && (
                                <p className="text-xs text-gray-500 mt-1 border-t pt-1">{pago.notas}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}