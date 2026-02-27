// components/admin/ConfigPanel.js - Configuración para salón de belleza

function ConfigPanel({ profesionalId, modoRestringido }) {
    const [profesionales, setProfesionales] = React.useState([]);
    const [profesionalSeleccionado, setProfesionalSeleccionado] = React.useState(null);
    const [mostrarEditorPorDia, setMostrarEditorPorDia] = React.useState(false);
    const [configGlobal, setConfigGlobal] = React.useState({
        duracion_turnos: 60,
        intervalo_entre_turnos: 0,
        modo_24h: false,
        max_antelacion_dias: 30,
        nombre_negocio: 'Mi Salón'
    });
    const [cargando, setCargando] = React.useState(true);

    const opcionesDuracion = [
        { value: 15, label: '15 min', icon: '⏱️' },
        { value: 30, label: '30 min', icon: '⏰' },
        { value: 45, label: '45 min', icon: '⌛' },
        { value: 60, label: '60 min', icon: '⏳' },
        { value: 75, label: '75 min', icon: '🕐' },
        { value: 90, label: '90 min', icon: '🕑' },
        { value: 120, label: '120 min', icon: '🕒' }
    ];

    const opcionesAntelacion = [
        { value: 3, label: '3 días', icon: '🔜' },
        { value: 7, label: '7 días', icon: '📅' },
        { value: 15, label: '15 días', icon: '📆' },
        { value: 30, label: '30 días', icon: '📅' },
        { value: 45, label: '45 días', icon: '🗓️' },
        { value: 60, label: '60 días', icon: '📆' }
    ];

    React.useEffect(() => {
        cargarDatos();
    }, []);

    React.useEffect(() => {
        if (modoRestringido && profesionalId) {
            setProfesionalSeleccionado(profesionalId);
        }
    }, [modoRestringido, profesionalId]);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            // Cargar profesionales
            if (window.salonProfesionales) {
                const lista = await window.salonProfesionales.getAll(true);
                setProfesionales(lista || []);
                
                if (!modoRestringido && lista && lista.length > 0) {
                    setProfesionalSeleccionado(lista[0].id);
                }
            }
            
            // Cargar configuración global
            if (!modoRestringido && window.salonConfig) {
                const config = await window.salonConfig.get();
                console.log('📋 Configuración cargada:', config);
                setConfigGlobal(config || {
                    duracion_turnos: 60,
                    intervalo_entre_turnos: 0,
                    modo_24h: false,
                    max_antelacion_dias: 30,
                    nombre_negocio: 'Mi Salón'
                });
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setCargando(false);
        }
    };

    const abrirEditorPorDia = () => {
        if (!profesionalSeleccionado) {
            alert('Seleccioná una profesional primero');
            return;
        }
        setMostrarEditorPorDia(true);
    };

    const handleGuardarConfigGlobal = async () => {
        if (modoRestringido) return;
        
        try {
            await window.salonConfig.guardar(configGlobal);
            alert('✅ Configuración guardada');
        } catch (error) {
            alert('Error al guardar configuración');
        }
    };

    if (cargando) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-6">
                {modoRestringido ? '⚙️ Mi Configuración' : '⚙️ Configuración del Salón'}
            </h2>
            
            {!modoRestringido && (
                <div className="mb-8 p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <h3 className="font-semibold text-lg mb-4 text-pink-800">⚙️ Configuración General</h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Negocio
                        </label>
                        <input
                            type="text"
                            value={configGlobal.nombre_negocio || 'Mi Salón'}
                            onChange={(e) => setConfigGlobal({
                                ...configGlobal, 
                                nombre_negocio: e.target.value
                            })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="Ej: Rservas.Roma - Belleza"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {/* Duración por defecto */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duración por defecto
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                                {opcionesDuracion.map(opcion => (
                                    <button
                                        key={opcion.value}
                                        type="button"
                                        onClick={() => setConfigGlobal({
                                            ...configGlobal, 
                                            duracion_turnos: opcion.value
                                        })}
                                        className={`
                                            py-2 px-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center
                                            ${configGlobal.duracion_turnos === opcion.value
                                                ? 'bg-pink-600 text-white shadow-md ring-2 ring-pink-300'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:border-pink-400 hover:bg-pink-50'}
                                        `}
                                    >
                                        <span className="text-lg mb-1">{opcion.icon}</span>
                                        <span>{opcion.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Intervalo entre turnos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Intervalo entre turnos (min)
                            </label>
                            <input
                                type="number"
                                value={configGlobal.intervalo_entre_turnos || 0}
                                onChange={(e) => setConfigGlobal({
                                    ...configGlobal, 
                                    intervalo_entre_turnos: parseInt(e.target.value) || 0
                                })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                min="0"
                                step="5"
                            />
                        </div>
                    </div>
                    
                    {/* Antelación máxima */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Antelación máxima para reservar
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {opcionesAntelacion.map(opcion => (
                                <button
                                    key={opcion.value}
                                    type="button"
                                    onClick={() => setConfigGlobal({
                                        ...configGlobal, 
                                        max_antelacion_dias: opcion.value
                                    })}
                                    className={`
                                        py-2 px-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center
                                        ${configGlobal.max_antelacion_dias === opcion.value
                                            ? 'bg-pink-600 text-white shadow-md ring-2 ring-pink-300'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:border-pink-400 hover:bg-pink-50'}
                                    `}
                                >
                                    <span className="text-lg mb-1">{opcion.icon}</span>
                                    <span>{opcion.label}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Las clientas podrán reservar con hasta esta cantidad de días de antelación
                        </p>
                    </div>
                    
                    {/* Modo 24h */}
                    <div className="mb-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={configGlobal.modo_24h || false}
                                onChange={(e) => setConfigGlobal({
                                    ...configGlobal, 
                                    modo_24h: e.target.checked
                                })}
                                className="w-5 h-5 text-pink-600"
                            />
                            <span className="text-sm text-gray-700">Modo 24 horas</span>
                        </label>
                    </div>
                    
                    <button
                        onClick={handleGuardarConfigGlobal}
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition text-sm"
                    >
                        Guardar Configuración
                    </button>
                </div>
            )}
            
            {!modoRestringido && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar Profesional
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={profesionalSeleccionado || ''}
                            onChange={(e) => setProfesionalSeleccionado(parseInt(e.target.value))}
                            className="flex-1 border rounded-lg px-3 py-2"
                        >
                            <option value="">Seleccione una profesional</option>
                            {profesionales.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                        
                        <button
                            onClick={abrirEditorPorDia}
                            disabled={!profesionalSeleccionado}
                            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Configurar horarios
                        </button>
                    </div>
                </div>
            )}
            
            {modoRestringido && profesionalId && (
                <div className="mb-4">
                    <button
                        onClick={abrirEditorPorDia}
                        className="w-full bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700 font-medium"
                    >
                        Configurar mis horarios
                    </button>
                    
                    <div className="mt-4 p-3 bg-pink-50 text-pink-700 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                            <i className="icon-info"></i>
                            <span>Podés configurar diferentes horarios para cada día de la semana</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal para editor por día */}
            {mostrarEditorPorDia && profesionalSeleccionado && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <HorariosPorDiaPanel
                            profesionalId={profesionalSeleccionado}
                            profesionalNombre={profesionales.find(p => p.id === profesionalSeleccionado)?.nombre || 'Profesional'}
                            onGuardar={(horarios) => {
                                setMostrarEditorPorDia(false);
                            }}
                            onCancelar={() => setMostrarEditorPorDia(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}