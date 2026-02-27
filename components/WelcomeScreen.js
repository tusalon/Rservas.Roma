// components/WelcomeScreen.js - Versión femenina para salón de belleza

function WelcomeScreen({ onStart, onGoBack, cliente, userRol }) {
    const [imagenCargada, setImagenCargada] = React.useState(false);

    React.useEffect(() => {
        const img = new Image();
        img.src = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2071&auto=format&fit=crop';
        img.onload = () => setImagenCargada(true);
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col relative overflow-hidden animate-fade-in">
            {/* Botón atrás flotante */}
            {onGoBack && (
                <button
                    onClick={onGoBack}
                    className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors border border-white/20"
                    title="Volver"
                >
                    <i className="icon-arrow-left text-white text-xl"></i>
                </button>
            )}

            {/* Background Image con overlay */}
            <div className="absolute inset-0 z-0">
                {!imagenCargada && (
                    <div className="w-full h-full bg-gradient-to-br from-pink-900 to-purple-900 animate-pulse"></div>
                )}
                <img 
                    src="/Rservas.Roma/images/salon-belleza-bienvenida.jpg"
                    alt="Salón de belleza" 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imagenCargada ? 'opacity-100' : 'opacity-0'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full min-h-screen p-8 pb-20 sm:justify-center sm:items-center sm:text-center sm:p-12 sm:pb-12">
                <div className="animate-fade-in space-y-6 max-w-2xl">
                    
                    {/* Título principal */}
                    <h1 className="text-5xl sm:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
                        Bienvenida a <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-300 text-6xl sm:text-8xl">
                           Rservas.Roma
                        </span>
                    </h1>
                    
                    {/* Nombre de la clienta (si está logueada) */}
                    {cliente && (
                        <div className="inline-block bg-pink-600/30 backdrop-blur-md px-6 py-3 rounded-full border border-pink-400/50">
                            <p className="text-pink-300 text-xl font-medium">
                                👤 {cliente.nombre}
                            </p>
                        </div>
                    )}
                    
                    {/* Eslogan */}
                    <p className="text-gray-200 text-xl sm:text-2xl max-w-lg mx-auto leading-relaxed drop-shadow-lg">
                        Tu espacio de belleza y bienestar
                    </p>

                    <div className="pt-8">
                        <button 
                            onClick={onStart}
                            className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xl font-bold py-5 px-12 rounded-full shadow-2xl shadow-pink-600/50 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center gap-3 border border-pink-400/30"
                        >
                            <i className="icon-sparkles text-2xl"></i>
                            Reservar Turno
                            <i className="icon-arrow-right text-2xl"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Features strip */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/30 backdrop-blur-sm border-t border-white/10 p-4 hidden sm:block">
                <div className="max-w-4xl mx-auto flex justify-around text-white/90 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <i className="icon-sparkles text-pink-400"></i>
                        Profesionales Expertas
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="icon-star text-pink-400"></i>
                        Productos Premium
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="icon-heart text-pink-400"></i>
                        Ambiente Exclusivo
                    </div>
                </div>
            </div>
        </div>
    );
}