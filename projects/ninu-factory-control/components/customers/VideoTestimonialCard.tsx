'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, MessageSquare, Heart, Share2, ThumbsUp, CheckCircle2, FileText } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { VideoTestimonial, DisplayMode, MobileLayout } from '../../types';

interface VideoTestimonialCardProps {
  testimonial: VideoTestimonial;
  displayMode?: DisplayMode;
  mobileLayout?: MobileLayout;
  lazy?: boolean;
  loading?: boolean;
  onLike?: (testimonialId: string) => void;
  onShare?: (testimonialId: string) => void;
  onMarkHelpful?: (testimonialId: string) => void;
  onVideoPlay?: (testimonialId: string) => void;
  onVideoEnd?: (testimonialId: string) => void;
}

export function VideoTestimonialCard({
  testimonial,
  displayMode = 'video_primary',
  mobileLayout = 'stack',
  lazy = true,
  loading = false,
  onLike,
  onShare,
  onMarkHelpful,
  onVideoPlay,
  onVideoEnd
}: VideoTestimonialCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showText, setShowText] = useState(displayMode === 'text_primary');
  const [showTranscript, setShowTranscript] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [isTabletSize, setIsTabletSize] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  // Manejar play/pause del video
  const handleVideoToggle = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      onVideoPlay?.(testimonial.id);
    }
  };

  // Manejar mute/unmute
  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Manejar error de video
  const handleVideoError = () => {
    setVideoError(true);
    setShowText(true);
  };

  // Manejar fin de video
  const handleVideoEnd = () => {
    setIsPlaying(false);
    onVideoEnd?.(testimonial.id);
  };

  // Formatear duración del video
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Traducir tipo de cliente
  const getCustomerTypeLabel = (type: string) => {
    const translations = {
      'family_home': 'Familia en casa',
      'small_business': 'Pequeño negocio',
      'distributor': 'Distribuidor',
      'institutional': 'Institucional',
      'professional': 'Uso profesional',
      'government': 'Sector público'
    };
    return translations[type as keyof typeof translations] || type;
  };

  // Traducir categorías de productos
  const getProductCategoryLabel = (category: string) => {
    const translations = {
      'limpieza': 'Limpieza',
      'desinfeccion': 'Desinfección',
      'salud-bienestar': 'Salud y Bienestar',
      'autos': 'Autos',
      'albercas': 'Albercas',
      'alimentos': 'Alimentos',
      'quimicos': 'Químicos',
      'mascotas': 'Mascotas'
    };
    return translations[category as keyof typeof translations] || category;
  };

  // Traducir casos de uso
  const getUseCaseLabel = (useCase: string) => {
    const translations = {
      'limpieza_hogar': 'Limpieza del hogar',
      'cuidado_familiar': 'Cuidado familiar',
      'productos_ninos': 'Productos para niños',
      'desinfeccion_covid': 'Desinfección por COVID',
      'negocio_local': 'Negocio local',
      'limpieza_profesional': 'Limpieza profesional',
      'cuidado_mascotas': 'Cuidado de mascotas',
      'mantenimiento_auto': 'Mantenimiento de auto',
      'limpieza_alberca': 'Limpieza de alberca',
      'preparacion_alimentos': 'Preparación de alimentos',
      'oficina_trabajo': 'Oficina/trabajo',
      'eventos_especiales': 'Eventos especiales'
    };
    return translations[useCase as keyof typeof translations] || useCase;
  };

  // Traducir preocupaciones principales
  const getPrimaryConcernLabel = (concern: string) => {
    const translations = {
      'child_safety': 'Seguridad de los niños',
      'elder_health': 'Salud de adultos mayores',
      'pet_safety': 'Seguridad de mascotas',
      'cost_effectiveness': 'Costo-efectividad',
      'environmental': 'Preocupaciones ambientales',
      'allergies': 'Alergias',
      'strong_cleaning': 'Limpieza potente',
      'gentle_formulation': 'Fórmula suave',
      'time_saving': 'Ahorro de tiempo',
      'professional_results': 'Resultados profesionales'
    };
    return translations[concern as keyof typeof translations] || concern;
  };

  // Obtener mensaje de optimización de conexión
  const getConnectionOptimizationMessage = () => {
    const speed = testimonial.location.internet_speed_profile.average_download_mbps;
    if (speed < 2) return 'Optimizado para conexión lenta';
    if (speed < 8) return 'Optimizado para conexión media';
    return 'Optimizado para conexión rápida';
  };

  // Formatear números
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-MX').format(num);
  };

  // Skeleton de carga
  if (loading) {
    return (
      <Card className="p-6 animate-pulse" data-testid="testimonial-skeleton">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  const hasVideo = testimonial.video_url && !videoError;
  const shouldShowVideo = hasVideo && !showText && isInView;

  return (
    <Card
      ref={cardRef}
      className={`p-6 hover:shadow-lg transition-shadow ${
        mobileLayout === 'stack' ? 'mobile-stack' : ''
      }`}
      tabIndex={0}
      role="article"
      aria-label={`Testimonio en video de ${testimonial.customer_name}`}
      data-testid="video-testimonial-card"
    >
      {/* Header con información del cliente */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {testimonial.customer_name.split(' ').map(name => name[0]).join('').slice(0, 2)}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{testimonial.customer_name}</h3>
            <p className="text-sm text-gray-600">
              {testimonial.location.city}, {testimonial.location.state}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">
                {getCustomerTypeLabel(testimonial.customer_type)}
              </span>
              {testimonial.verified && (
                <div className="flex items-center space-x-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" aria-label="Cliente verificado" />
                  <span className="text-xs text-green-600">Verificado</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Métricas de engagement */}
        <div className="text-right text-xs text-gray-500">
          <div>{formatNumber(testimonial.views)} visualizaciones</div>
          <div>{formatNumber(testimonial.likes)} me gusta</div>
        </div>
      </div>

      {/* Contenido principal - Video o Texto */}
      <div className="mb-4">
        {shouldShowVideo || (hasVideo && !showText) ? (
          <div 
            className={`relative ${window.innerWidth >= 768 ? 'tablet-size' : ''}`} 
            data-testid="video-container"
          >
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              poster={testimonial.video_thumbnail}
              preload={lazy ? 'metadata' : testimonial.preload_strategy}
              controls
              muted={isMuted}
              onLoadedData={() => setIsVideoLoaded(true)}
              onError={handleVideoError}
              onEnded={handleVideoEnd}
              data-testid="video-testimonial"
              src={testimonial.video_url}
              aria-label={`Video testimonio de ${testimonial.customer_name}`}
            >
              <source src={testimonial.video_url} type="video/mp4" />
              {testimonial.fallback_formats.includes('webm') && (
                <source src={testimonial.video_url?.replace('.mp4', '.webm')} type="video/webm" />
              )}
              <p>Tu navegador no soporta la reproducción de video.</p>
            </video>

            {/* Overlay con controles personalizados */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleVideoToggle}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 transition-all"
                  aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-gray-800" />
                  ) : (
                    <Play className="h-6 w-6 text-gray-800" />
                  )}
                </button>
                
                <button
                  onClick={handleMuteToggle}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-gray-800" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-gray-800" />
                  )}
                </button>
              </div>
            </div>

            {/* Información del video */}
            <div className="absolute top-2 right-2 flex items-center space-x-2">
              {testimonial.video_duration_seconds && (
                <Badge variant="secondary" className="bg-black bg-opacity-70 text-white">
                  {formatDuration(testimonial.video_duration_seconds)}
                </Badge>
              )}
              {testimonial.has_captions && (
                <Badge variant="secondary" className="bg-black bg-opacity-70 text-white">
                  <FileText className="h-3 w-3" aria-label="Subtítulos disponibles" />
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {videoError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                Error al cargar el video. Mostrando contenido de texto.
              </div>
            )}
            <p className="text-gray-700 leading-relaxed">
              {testimonial.text_testimonial}
            </p>
          </div>
        )}
      </div>

      {/* Resumen y controles de alternancia */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 italic mb-2">
          &ldquo;{testimonial.summary}&rdquo;
        </p>
        
        {hasVideo && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowText(!showText)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {showText ? 'Mostrar video' : 'Mostrar texto'}
            </button>
            
            {testimonial.transcript && (
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {showTranscript ? 'Ocultar transcripción' : 'Mostrar transcripción'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transcripción */}
      {showTranscript && testimonial.transcript && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Transcripción:</h4>
          <p className="text-sm text-gray-700">{testimonial.transcript}</p>
        </div>
      )}

      {/* Contexto mexicano */}
      <div className="space-y-3 mb-4">
        {/* Productos utilizados */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-medium text-gray-700">Productos:</span>
          <span className="text-gray-600">
            {testimonial.products_used.map(getProductCategoryLabel).join(', ')}
          </span>
        </div>

        {/* Casos de uso */}
        <div className="flex flex-wrap gap-1">
          {testimonial.use_cases.slice(0, 3).map((useCase, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {getUseCaseLabel(useCase)}
            </Badge>
          ))}
          {testimonial.use_cases.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{testimonial.use_cases.length - 3} más
            </Badge>
          )}
        </div>

        {/* Contexto familiar */}
        <div className="text-sm text-gray-600 space-y-1">
          <div>Familia de {testimonial.family_context.family_size} personas</div>
          {testimonial.family_context.has_children && testimonial.family_context.children_ages && (
            <div>Con niños ({testimonial.family_context.children_ages.join(', ')} años)</div>
          )}
          {testimonial.family_context.has_pets && <div>Con mascotas</div>}
        </div>

        {/* Preocupaciones principales */}
        <div className="text-sm">
          <span className="font-medium text-gray-700">Prioridades: </span>
          <span className="text-gray-600">
            {testimonial.family_context.primary_concerns
              .slice(0, 2)
              .map(getPrimaryConcernLabel)
              .join(', ')}
          </span>
        </div>
      </div>

      {/* Optimización de conexión */}
      <div className="mb-4 p-2 bg-blue-50 rounded text-xs text-blue-700">
        {getConnectionOptimizationMessage()}
      </div>

      {/* Acciones y métricas */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onLike?.(testimonial.id)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
            aria-label="Me gusta"
          >
            <Heart className="h-4 w-4" />
            <span>{formatNumber(testimonial.likes)}</span>
          </button>
          
          <button
            onClick={() => onShare?.(testimonial.id)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            aria-label="Compartir"
          >
            <Share2 className="h-4 w-4" />
            <span>Compartir</span>
          </button>
          
          <button
            onClick={() => onMarkHelpful?.(testimonial.id)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
            aria-label="Marcar como útil"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>Útil</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-500">
          {formatNumber(testimonial.helpful_votes)} personas encontraron esto útil
        </div>
      </div>
    </Card>
  );
}