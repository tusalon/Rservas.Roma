// components/WorkerSelector.js - Para salón de belleza (versión femenina)

function WorkerSelector({ onSelect, selectedWorker }) {
    const [profesionales, setProfesionales] = React.useState([]);
    const [cargando, setCargando] = React.useState(true);

    React.useEffect(() => {
        cargarProfesionales();
        
        const handleActualizacion = () => cargarProfesionales();
        window.addEventListener('profesionalesActualizados', handleActualizacion);
        
        return () => {
            window.removeEventListener('profesionalesActualizados', handleActualizacion);
        };
    }, []);

    const cargarProfesionales = async () => {
        setCargando(true);
        try {
            // Usar window.salonProfesionales si existe
            if (window.salonProfesionales) {
                const activos = await window.salonProfesionales.getAll(true);
                setProfesionales(activos || []);
            } else {
                // Fallback a fetch directo
                const response = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/profesionales?select=*&order=nombre.asc`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        }
                    }
                );
                
                if (!response.ok) {
                    console.error('Error cargando profesionales');
                    setProfesionales([]);
                } else {
                    const data = await response.json();
                    setProfesionales(data.filter(p => p.activo !== false) || []);
                }
            }
        } catch (error) {
            console.error('Error cargando profesionales:', error);
            setProfesionales([]);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <i className="icon-users text-pink-500"></i>
                    2. Elegí tu profesional
                </h2>
                <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-b-2 border-pink-600 rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-4">Cargando profesionales...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="icon-users text-pink-500"></i>
                2. Elegí tu profesional
                {selectedWorker && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">
                        ✓ Profesional seleccionada
                    </span>
                )}
            </h2>
            
            {profesionales.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-500">No hay profesionales disponibles</p>
                    <p className="text-xs text-gray-400 mt-2">Pronto tendremos nuevas profesionales</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {profesionales.map(prof => (
                        <button
                            key={prof.id}
                            onClick={() => onSelect(prof)}
                            className={`
                                p-4 rounded-xl border-2 text-left transition-all duration-200 transform hover:scale-105
                                ${selectedWorker?.id === prof.id 
                                    ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-300 shadow-lg' 
                                    : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'}
                            `}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 ${prof.color || 'bg-pink-600'} rounded-full flex items-center justify-center text-3xl mb-3 shadow-md`}>
                                    {prof.avatar || '💅'}
                                </div>
                                <span className="font-bold text-gray-800 text-lg block">
                                    {prof.nombre}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">
                                    {prof.especialidad || 'Especialista'}
                                </span>
                                
                                {selectedWorker?.id === prof.id && (
                                    <div className="mt-2 text-pink-600 text-sm font-semibold flex items-center gap-1">
                                        <i className="icon-check-circle"></i>
                                        Seleccionada
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
            
            <div className="text-xs text-gray-500 bg-pink-50 p-3 rounded-lg border border-pink-100">
                <p className="flex items-center gap-2">
                    <i className="icon-info text-pink-500"></i>
                    <span>Cada profesional tiene su propia agenda. Elegí la que prefieras y luego seleccioná fecha y hora.</span>
                </p>
            </div>
        </div>
    );
}