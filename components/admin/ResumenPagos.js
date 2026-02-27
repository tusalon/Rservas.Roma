// components/admin/ResumenPagos.js

function ResumenPagos() {
    const [resumen, setResumen] = React.useState({
        total_mes: 0,
        pagos_mes: 0,
        proximos_vencer: 0,
        vencidos: 0
    });

    React.useEffect(() => {
        cargarResumen();
    }, []);

    const cargarResumen = async () => {
        try {
            // Total pagado este mes
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0,0,0,0);

            const { data: pagosMes } = await window.supabase
                .from('historial_pagos')
                .select('monto')
                .gte('fecha_pago', inicioMes.toISOString());

            const totalMes = pagosMes?.reduce((acc, p) => acc + (p.monto || 0), 0) || 0;

            // Negocios próximos a vencer (próximos 7 días)
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + 7);

            const { data: proximos } = await window.supabase
                .from('vista_negocios_admin')
                .select('id')
                .lte('dias_para_renovar', 7)
                .gte('dias_para_renovar', 0);

            // Negocios vencidos
            const { data: vencidos } = await window.supabase
                .from('vista_negocios_admin')
                .select('id')
                .lt('dias_para_renovar', 0);

            setResumen({
                total_mes: totalMes,
                pagos_mes: pagosMes?.length || 0,
                proximos_vencer: proximos?.length || 0,
                vencidos: vencidos?.length || 0
            });

        } catch (error) {
            console.error('Error cargando resumen:', error);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Ingresos del mes</p>
                <p className="text-2xl font-bold">${resumen.total_mes}</p>
                <p className="text-xs opacity-75">{resumen.pagos_mes} pagos</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Próximos a vencer</p>
                <p className="text-2xl font-bold">{resumen.proximos_vencer}</p>
                <p className="text-xs opacity-75">en 7 días</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Vencidos</p>
                <p className="text-2xl font-bold">{resumen.vencidos}</p>
                <p className="text-xs opacity-75">sin pagar</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Por cobrar</p>
                <p className="text-2xl font-bold">${resumen.proximos_vencer * 29}</p>
                <p className="text-xs opacity-75">estimado</p>
            </div>
        </div>
    );
}
