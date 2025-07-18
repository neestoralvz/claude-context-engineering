import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoTestimonialCard } from '../../../components/customers/VideoTestimonialCard';
import { VideoTestimonial } from '../../../types';

// Mock data para testimonios mexicanos
const mockVideoTestimonial: VideoTestimonial = {
  id: 'test-1',
  customer_name: 'María González',
  customer_type: 'family_home',
  location: {
    city: 'Xalapa',
    state: 'Veracruz',
    region: 'golfo',
    urban_rural: 'urban',
    internet_speed_profile: {
      average_download_mbps: 5.2,
      reliability_score: 7,
      mobile_data_usage: true,
      peak_hours_slowdown: true
    }
  },
  video_url: 'https://example.com/maria-testimonio.mp4',
  video_thumbnail: 'https://example.com/maria-thumb.jpg',
  video_duration_seconds: 45,
  video_quality: 'medium',
  text_testimonial: 'Los productos Ninu han transformado la limpieza de mi hogar. Como mamá de tres niños, necesito productos que sean efectivos pero seguros para mi familia. El multiusos ha sido increíble para la cocina y los baños.',
  summary: 'Productos seguros y efectivos para familia con niños',
  products_used: ['limpieza'],
  use_cases: ['limpieza_hogar', 'cuidado_familiar', 'productos_ninos'],
  family_context: {
    family_size: 5,
    has_children: true,
    children_ages: [3, 7, 12],
    has_elderly: false,
    has_pets: true,
    home_type: 'house',
    primary_concerns: ['child_safety', 'pet_safety', 'cost_effectiveness']
  },
  has_captions: true,
  transcript: 'Hola, soy María González de Xalapa, Veracruz...',
  bandwidth_requirement: 'medium',
  preload_strategy: 'metadata',
  fallback_formats: ['mp4', 'webm'],
  views: 1250,
  likes: 89,
  shares: 23,
  helpful_votes: 156,
  verified: true,
  verification_date: '2024-01-15',
  permission_granted: true,
  recorded_date: '2024-01-10',
  published_date: '2024-01-15',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
};

const mockVideoTestimonialNoVideo: VideoTestimonial = {
  ...mockVideoTestimonial,
  id: 'test-2',
  customer_name: 'Carlos Ramírez',
  video_url: undefined,
  video_thumbnail: undefined,
  text_testimonial: 'He usado los productos Ninu en mi negocio de limpieza por más de un año y la calidad es excepcional.',
  summary: 'Excelente calidad para uso profesional'
};

// Mock Intersection Observer para lazy loading
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('VideoTestimonialCard', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Renderizado básico', () => {
    test('renderiza la información básica del testimonio', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByText('María González')).toBeInTheDocument();
      expect(screen.getByText('Xalapa, Veracruz')).toBeInTheDocument();
      expect(screen.getByText(/Productos seguros y efectivos/)).toBeInTheDocument();
    });

    test('muestra el tipo de cliente en español', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByText('Familia en casa')).toBeInTheDocument();
    });

    test('muestra las métricas de engagement', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByText('1,250 visualizaciones')).toBeInTheDocument();
      expect(screen.getByText('89 me gusta')).toBeInTheDocument();
      expect(screen.getByText('156 personas encontraron esto útil')).toBeInTheDocument();
    });

    test('muestra el badge de verificado', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByText('Verificado')).toBeInTheDocument();
      expect(screen.getByLabelText('Cliente verificado')).toBeInTheDocument();
    });
  });

  describe('Funcionalidad de video', () => {
    test('muestra el video player cuando hay video_url', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      const videoElement = screen.getByTestId('video-testimonial');
      expect(videoElement).toBeInTheDocument();
      expect(videoElement).toHaveAttribute('src', mockVideoTestimonial.video_url);
    });

    test('muestra thumbnail del video cuando está disponible', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      const videoElement = screen.getByTestId('video-testimonial');
      expect(videoElement).toHaveAttribute('poster', mockVideoTestimonial.video_thumbnail);
    });

    test('configura controles optimizados para México', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      const videoElement = screen.getByTestId('video-testimonial');
      expect(videoElement).toHaveAttribute('controls');
      expect(videoElement).toHaveAttribute('preload', 'metadata');
      expect(videoElement).not.toHaveAttribute('autoplay');
    });

    test('muestra duración del video', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByText('45s')).toBeInTheDocument();
    });

    test('implementa lazy loading del video', () => {
      const { container } = render(
        <VideoTestimonialCard 
          testimonial={mockVideoTestimonial} 
          lazy={true}
        />
      );
      
      const videoElement = screen.getByTestId('video-testimonial');
      expect(videoElement).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Fallback a texto', () => {
    test('muestra solo texto cuando no hay video', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonialNoVideo} />);
      
      expect(screen.queryByTestId('video-testimonial')).not.toBeInTheDocument();
      expect(screen.getByText(/He usado los productos Ninu/)).toBeInTheDocument();
    });

    test('botón para alternar entre video y texto', async () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      const toggleButton = screen.getByRole('button', { name: /mostrar texto/i });
      expect(toggleButton).toBeInTheDocument();
      
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Los productos Ninu han transformado/)).toBeInTheDocument();
      });
    });

    test('muestra texto completo en modo fallback', () => {
      render(
        <VideoTestimonialCard 
          testimonial={mockVideoTestimonial} 
          displayMode="text_primary"
        />
      );
      
      expect(screen.getByText(/Los productos Ninu han transformado/)).toBeInTheDocument();
      expect(screen.queryByTestId('video-testimonial')).not.toBeInTheDocument();
    });
  });

  describe('Contexto mexicano', () => {
    test('muestra productos utilizados en español', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByText('Productos: Limpieza')).toBeInTheDocument();
    });

    test('muestra casos de uso mexicanos', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByText(/Limpieza del hogar/)).toBeInTheDocument();
      expect(screen.getByText(/Cuidado familiar/)).toBeInTheDocument();
      expect(screen.getByText(/Productos para niños/)).toBeInTheDocument();
    });

    test('muestra contexto familiar', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByText('Familia de 5 personas')).toBeInTheDocument();
      expect(screen.getByText('Con niños (3, 7, 12 años)')).toBeInTheDocument();
      expect(screen.getByText('Con mascotas')).toBeInTheDocument();
    });

    test('muestra preocupaciones principales en español', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByText(/Seguridad de los niños/)).toBeInTheDocument();
      expect(screen.getByText(/Seguridad de mascotas/)).toBeInTheDocument();
      expect(screen.getByText(/Costo-efectividad/)).toBeInTheDocument();
    });
  });

  describe('Optimización para internet mexicano', () => {
    test('muestra indicador de calidad de conexión', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByText('Optimizado para conexión media')).toBeInTheDocument();
    });

    test('muestra warning para conexiones lentas', () => {
      const slowConnectionTestimonial = {
        ...mockVideoTestimonial,
        location: {
          ...mockVideoTestimonial.location,
          internet_speed_profile: {
            average_download_mbps: 1.5,
            reliability_score: 4,
            mobile_data_usage: true,
            peak_hours_slowdown: true
          }
        },
        bandwidth_requirement: 'low' as const
      };

      render(<VideoTestimonialCard testimonial={slowConnectionTestimonial} />);
      
      expect(screen.getByText(/Optimizado para conexión lenta/)).toBeInTheDocument();
    });

    test('configura preload según perfil de conexión', () => {
      const slowConnectionTestimonial = {
        ...mockVideoTestimonial,
        preload_strategy: 'none' as const
      };

      render(<VideoTestimonialCard testimonial={slowConnectionTestimonial} />);
      
      const videoElement = screen.getByTestId('video-testimonial');
      expect(videoElement).toHaveAttribute('preload', 'none');
    });
  });

  describe('Accesibilidad', () => {
    test('muestra indicador de subtítulos disponibles', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByLabelText('Subtítulos disponibles')).toBeInTheDocument();
    });

    test('botón para mostrar transcripción', async () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      const transcriptButton = screen.getByRole('button', { name: /mostrar transcripción/i });
      fireEvent.click(transcriptButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Hola, soy María González/)).toBeInTheDocument();
      });
    });

    test('navegación por teclado funcional', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      const card = screen.getByTestId('video-testimonial-card');
      expect(card).toHaveAttribute('tabIndex', '0');
      
      const playButton = screen.getByRole('button', { name: /reproducir video/i });
      expect(playButton).toBeInTheDocument();
    });

    test('tiene etiquetas ARIA apropiadas', () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      expect(screen.getByLabelText('Testimonio en video de María González')).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('Interacciones del usuario', () => {
    test('permite dar like al testimonio', async () => {
      const onLike = jest.fn();
      render(
        <VideoTestimonialCard 
          testimonial={mockVideoTestimonial} 
          onLike={onLike}
        />
      );
      
      const likeButton = screen.getByRole('button', { name: /me gusta/i });
      fireEvent.click(likeButton);
      
      expect(onLike).toHaveBeenCalledWith(mockVideoTestimonial.id);
    });

    test('permite compartir el testimonio', async () => {
      const onShare = jest.fn();
      render(
        <VideoTestimonialCard 
          testimonial={mockVideoTestimonial} 
          onShare={onShare}
        />
      );
      
      const shareButton = screen.getByRole('button', { name: /compartir/i });
      fireEvent.click(shareButton);
      
      expect(onShare).toHaveBeenCalledWith(mockVideoTestimonial.id);
    });

    test('permite marcar como útil', async () => {
      const onMarkHelpful = jest.fn();
      render(
        <VideoTestimonialCard 
          testimonial={mockVideoTestimonial} 
          onMarkHelpful={onMarkHelpful}
        />
      );
      
      const helpfulButton = screen.getByRole('button', { name: /marcar como útil/i });
      fireEvent.click(helpfulButton);
      
      expect(onMarkHelpful).toHaveBeenCalledWith(mockVideoTestimonial.id);
    });
  });

  describe('Estados de carga', () => {
    test('muestra skeleton mientras carga', () => {
      render(
        <VideoTestimonialCard 
          testimonial={mockVideoTestimonial} 
          loading={true}
        />
      );
      
      expect(screen.getByTestId('testimonial-skeleton')).toBeInTheDocument();
    });

    test('muestra placeholder cuando falla la carga del video', async () => {
      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      const videoElement = screen.getByTestId('video-testimonial');
      fireEvent.error(videoElement);
      
      await waitFor(() => {
        expect(screen.getByText(/Error al cargar el video/)).toBeInTheDocument();
        expect(screen.getByText(/Los productos Ninu han transformado/)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive design', () => {
    test('adapta layout para móviles', () => {
      // Simular viewport móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <VideoTestimonialCard 
          testimonial={mockVideoTestimonial} 
          mobileLayout="stack"
        />
      );
      
      const card = screen.getByTestId('video-testimonial-card');
      expect(card).toHaveClass('mobile-stack');
    });

    test('ajusta tamaño de video para tablets', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<VideoTestimonialCard testimonial={mockVideoTestimonial} />);
      
      const videoContainer = screen.getByTestId('video-container');
      expect(videoContainer).toHaveClass('tablet-size');
    });
  });
});