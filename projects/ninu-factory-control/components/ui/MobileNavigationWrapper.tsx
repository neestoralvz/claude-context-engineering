'use client'

import React, { useState } from 'react'
import MobileNavigation, { NavigationItem } from './MobileNavigation'

const MobileNavigationWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems: NavigationItem[] = [
    { href: '/', label: 'Control', icon: '🏭' },
    { href: '/productos', label: 'Productos', icon: '🧪' },
    { href: '/admin/productos', label: 'Gestión', icon: '⚙️' }
  ]

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <MobileNavigation
      isOpen={isOpen}
      onToggle={handleToggle}
      navigationItems={navigationItems}
    />
  )
}

export default MobileNavigationWrapper