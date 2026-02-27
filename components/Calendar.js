// components/Calendar.js - Versión femenina para salón de belleza

function Calendar({ onDateSelect, selectedDate, worker }) {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [diasLaborales, setDiasLaborales] = React.useState([]);
    const [cargandoHorarios, setCargandoHorarios] = React.useState(false);

    // Función para formatear fecha local correctamente
    const formatDateLocal = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString();
    };

    React.useEffect(() => {
        if (!worker) return;
        
        const cargarDiasLaborales = async () => {
            setCargandoHorarios(true);
            try {
                // Usar la nueva tabla horarios_profesionales
                const response = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/horarios_profesionales?profesional_id=eq.${worker.id}&select=*`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        console.log(`📅 Días laborales de ${worker.nombre}:`, data[0].dias);
                        setDiasLaborales(data[0].dias || []);
                    } else {
                        // Si no tiene configuración, todos los días hábiles
                        setDiasLaborales(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
                    }
                } else {
                    setDiasLaborales(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
                }
            } catch (error) {
                console.error('Error cargando días laborales:', error);
                setDiasLaborales(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
            } finally {
                setCargandoHorarios(false);
            }
        };
        
        cargarDiasLaborales();
    }, [worker]);

    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const getTodayLocalString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isPastDate = (date) => {
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayStr = getTodayLocalString();
        const dateStr = formatDate(date);
        
        if (date < today) return true;
        
        if (dateStr === todayStr) {
            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            
            const LAST_SLOT_HOUR = 20;
            const LAST_SLOT_MINUTES = 0;
            
            if (currentHour > LAST_SLOT_HOUR) return true;
            if (currentHour === LAST_SLOT_HOUR && currentMinutes > LAST_SLOT_MINUTES) return true;
        }
        
        return false;
    };

    const isSunday = (date) => {
        return date.getDay() === 0;
    };

    const profesionalTrabajaEsteDia = (date) => {
        if (!worker || diasLaborales.length === 0) return true;
        
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaSemana = diasSemana[date.getDay()];
        return diasLaborales.includes(diaSemana);
    };

    const nextMonth = () => {
        const next = new Date(currentDate);
        next.setMonth(currentDate.getMonth() + 1);
        setCurrentDate(next);
    };

    const prevMonth = () => {
        const prev = new Date(currentDate);
        prev.setMonth(currentDate.getMonth() - 1);
        setCurrentDate(prev);
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const days = [];
        
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        
        return days;
    };

    const days = getDaysInMonth();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    if (cargandoHorarios) {
        return (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <i className="icon-calendar text-pink-500"></i>
                    3. Seleccioná una fecha
                    {worker && (
                        <span className="text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded-full ml-2">
                            con {worker.nombre}
                        </span>
                    )}
                </h2>
                <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-b-2 border-pink-600 rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-4">Cargando disponibilidad...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="icon-calendar text-pink-500"></i>
                3. Seleccioná una fecha
                {worker && (
                    <span className="text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded-full ml-2">
                        con {worker.nombre}
                    </span>
                )}
                {selectedDate && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">
                        ✓ Fecha seleccionada
                    </span>
                )}
            </h2>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
                    <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full transition-colors text-gray-600">◀</button>
                    <span className="font-bold text-gray-800 text-lg capitalize">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full transition-colors text-gray-600">▶</button>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                            <div key={i} className={`text-xs font-medium py-1 ${d === 'D' ? 'text-red-400' : 'text-gray-400'}`}>
                                {d}
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((date, idx) => {
                            if (!date) return <div key={idx} className="h-10" />;

                            const dateStr = formatDate(date);
                            const past = isPastDate(date);
                            const sunday = isSunday(date);
                            const selected = selectedDate === dateStr;
                            
                            const profesionalTrabaja = profesionalTrabajaEsteDia(date);
                            const available = !past && !sunday && profesionalTrabaja;
                            
                            let className = "h-10 w-full flex items-center justify-center rounded-lg text-sm font-medium transition-all relative";
                            
                            if (selected) {
                                className += " bg-pink-600 text-white shadow-md scale-105 ring-2 ring-pink-300";
                            } else if (!available) {
                                className += " text-gray-300 cursor-not-allowed bg-gray-50";
                            } else {
                                className += " text-gray-700 hover:bg-pink-50 hover:text-pink-600 hover:scale-105 cursor-pointer";
                            }
                            
                            let title = "";
                            if (past && dateStr === getTodayLocalString()) {
                                title = "Hoy ya no hay turnos disponibles";
                            } else if (past) {
                                title = "Fecha pasada";
                            } else if (sunday) {
                                title = "Domingo cerrado";
                            } else if (!profesionalTrabaja && worker) {
                                title = `${worker.nombre} no trabaja este día`;
                            } else {
                                title = "Disponible";
                            }
                            
                            return (
                                <button
                                    key={idx}
                                    onClick={() => available && onDateSelect(dateStr)}
                                    disabled={!available}
                                    className={className}
                                    title={title}
                                >
                                    {date.getDate()}
                                    {available && !selected && (
                                        <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {worker && (
                <div className="text-xs text-gray-500 bg-pink-50 p-3 rounded-lg border border-pink-100">
                    <div className="flex items-center gap-2">
                        <i className="icon-info text-pink-500 text-lg"></i>
                        <span>
                            <strong>📅 Días que trabaja {worker.nombre}:</strong>{' '}
                            {diasLaborales.length > 0 
                                ? diasLaborales.map(d => {
                                    const diasMap = {
                                        'lunes': 'Lunes', 'martes': 'Martes', 'miercoles': 'Miércoles',
                                        'jueves': 'Jueves', 'viernes': 'Viernes', 'sabado': 'Sábado', 'domingo': 'Domingo'
                                    };
                                    return diasMap[d] || d;
                                }).join(', ')
                                : 'Todos los días (excepto domingos)'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}