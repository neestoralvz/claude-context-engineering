'use client'

import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'

interface FloatingWhatsAppProps {
  phoneNumber: string
  message?: string
}

export default function FloatingWhatsApp({ 
  phoneNumber, 
  message = "Hola Ninu.mx, me interesa información sobre sus productos de limpieza" 
}: FloatingWhatsAppProps) {
  const [isVisible, setIsVisible] = useState(true)
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  
  if (!isVisible) return null
  
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* WhatsApp Message Bubble */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm animate-bounce">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar mensaje"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="pr-6">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            💬 ¿Necesitas ayuda?
          </p>
          <p className="text-xs text-gray-600">
            Contáctanos por WhatsApp para cotizaciones y asesoría técnica gratuita
          </p>
        </div>
      </div>
      
      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </a>
    </div>
  )
}