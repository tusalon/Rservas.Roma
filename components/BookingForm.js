// components/BookingForm.js - Versión femenina para salón de belleza

function BookingForm({ service, worker, date, time, onSubmit, onCancel, cliente }) {
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Verificar disponibilidad actualizada
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/reservas?fecha=eq.${date}&profesional_id=eq.${worker.id}&estado=neq.Cancelado&select=hora_inicio,hora_fin`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    }
                }
            );
            
            const bookings = response.ok ? await response.json() : [];
            
            const baseSlots = [time];
            const available = filterAvailableSlots(baseSlots, service.duracion, bookings);

            if (available.length === 0) {
                setError("Ese horario ya no está disponible. Por favor elegí otro.");
                setSubmitting(false);
                return;
            }

            const endTime = calculateEndTime(time, service.duracion);

            const bookingData = {
                cliente_nombre: cliente.nombre,
                cliente_whatsapp: cliente.whatsapp,
                servicio: service.nombre,
                duracion: service.duracion,
                profesional_id: worker.id,
                profesional_nombre: worker.nombre,
                fecha: date,
                hora_inicio: time,
                hora_fin: endTime,
                estado: "Reservado"
            };

            console.log('📤 Enviando reserva:', bookingData);
            
            const result = await createBooking(bookingData);
            onSubmit(result.data);

        } catch (err) {
            console.error('Error:', err);
            setError("Ocurrió un error al guardar la reserva. Intentá nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-900">Confirmar Turno</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <i className="icon-x text-2xl"></i>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Resumen del turno */}
                    <div className="bg-pink-50 p-4 rounded-xl border border-pink-200 space-y-2">
                        <div className="flex items-center gap-3 text-gray-700">
                            <i className="icon-sparkles text-pink-500"></i>
                            <span className="font-medium">{service.nombre}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-700">
                            <i className="icon-users text-pink-500"></i>
                            <span>Profesional: <strong>{worker.nombre}</strong></span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-700">
                            <i className="icon-calendar text-pink-500"></i>
                            <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <i className="icon-clock text-pink-500"></i>
                            <span>{formatTo12Hour(time)} ({service.duracion} min)</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Tus datos:</span> {cliente.nombre} - +{cliente.whatsapp}
                            </p>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-start gap-2">
                                <i className="icon-triangle-alert mt-0.5"></i>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3.5 rounded-xl font-bold hover:from-pink-700 hover:to-pink-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                    Procesando...
                                </>
                            ) : (
                                "Confirmar Turno"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}