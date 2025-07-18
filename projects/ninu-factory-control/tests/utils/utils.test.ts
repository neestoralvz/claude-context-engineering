import {
  cn,
  formatDate,
  formatDuration,
  getStatusColor,
  calculateEfficiency,
  generateId,
  isWithinRange,
  formatNumber,
  formatCurrency,
  getAlertSeverityColor,
  getCustomerStatusColor,
  getCustomerTypeColor,
  getPaymentStatusColor,
  calculateCustomerScore,
  getActivityLevel,
  formatCustomerType,
  daysSinceLastOrder
} from '../../lib/utils'

describe('formatDate', () => {
  it('should format date in Spanish Mexican locale', () => {
    const testDate = new Date('2024-01-15T10:30:00')
    const result = formatDate(testDate)
    expect(result).toMatch(/ene/)
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/10:30/)
  })

  it('should handle different dates correctly', () => {
    const testDate = new Date('2024-12-25T23:59:00')
    const result = formatDate(testDate)
    expect(result).toMatch(/dic/)
    expect(result).toMatch(/59/)
  })
})

describe('formatDuration', () => {
  it('should format minutes only when less than 60', () => {
    expect(formatDuration(30)).toBe('30m')
    expect(formatDuration(59)).toBe('59m')
  })

  it('should format hours and minutes when 60 or more minutes', () => {
    expect(formatDuration(60)).toBe('1h 0m')
    expect(formatDuration(90)).toBe('1h 30m')
    expect(formatDuration(150)).toBe('2h 30m')
  })

  it('should handle zero minutes', () => {
    expect(formatDuration(0)).toBe('0m')
  })
})

describe('getStatusColor', () => {
  it('should return correct colors for valid statuses', () => {
    expect(getStatusColor('idle')).toBe('text-gray-500 bg-gray-100')
    expect(getStatusColor('running')).toBe('text-green-600 bg-green-100')
    expect(getStatusColor('error')).toBe('text-red-600 bg-red-100')
    expect(getStatusColor('maintenance')).toBe('text-yellow-600 bg-yellow-100')
  })

  it('should return default color for unknown status', () => {
    expect(getStatusColor('unknown')).toBe('text-gray-500 bg-gray-100')
    expect(getStatusColor('')).toBe('text-gray-500 bg-gray-100')
  })
})

describe('calculateEfficiency', () => {
  it('should calculate efficiency percentage correctly', () => {
    expect(calculateEfficiency(80, 100)).toBe(80)
    expect(calculateEfficiency(90, 100)).toBe(90)
    expect(calculateEfficiency(50, 100)).toBe(50)
  })

  it('should handle different target values', () => {
    expect(calculateEfficiency(40, 50)).toBe(80)
    expect(calculateEfficiency(150, 200)).toBe(75)
  })

  it('should round to nearest integer', () => {
    expect(calculateEfficiency(33, 100)).toBe(33)
    expect(calculateEfficiency(67, 100)).toBe(67)
  })

  it('should handle efficiency over 100%', () => {
    expect(calculateEfficiency(120, 100)).toBe(120)
  })
})

describe('generateId', () => {
  it('should generate a string', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
  })

  it('should generate unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })

  it('should generate IDs of reasonable length', () => {
    const id = generateId()
    expect(id.length).toBeGreaterThan(5)
    expect(id.length).toBeLessThan(15)
  })
})

describe('isWithinRange', () => {
  it('should return true when value is within range', () => {
    expect(isWithinRange(50, [0, 100])).toBe(true)
    expect(isWithinRange(0, [0, 100])).toBe(true)
    expect(isWithinRange(100, [0, 100])).toBe(true)
  })

  it('should return false when value is outside range', () => {
    expect(isWithinRange(-1, [0, 100])).toBe(false)
    expect(isWithinRange(101, [0, 100])).toBe(false)
  })

  it('should handle negative ranges', () => {
    expect(isWithinRange(-50, [-100, 0])).toBe(true)
    expect(isWithinRange(-150, [-100, 0])).toBe(false)
  })
})

describe('formatNumber', () => {
  it('should format numbers with default zero decimals', () => {
    expect(formatNumber(1234)).toBe('1,234')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('should format numbers with specified decimals', () => {
    expect(formatNumber(1234.567, 2)).toBe('1,234.57')
    expect(formatNumber(1000, 3)).toBe('1,000.000')
  })

  it('should handle zero and negative numbers', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(-1234)).toBe('-1,234')
  })
})

describe('formatCurrency', () => {
  it('should format currency in Mexican pesos', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('$')
    expect(result).toMatch(/1,234.56/)
  })

  it('should handle zero amount', () => {
    const result = formatCurrency(0)
    expect(result).toMatch(/0/)
  })

  it('should handle large amounts', () => {
    const result = formatCurrency(1000000)
    expect(result).toMatch(/1,000,000/)
  })
})

describe('getAlertSeverityColor', () => {
  it('should return correct colors for alert severities', () => {
    expect(getAlertSeverityColor('low')).toBe('text-blue-600 bg-blue-100')
    expect(getAlertSeverityColor('medium')).toBe('text-yellow-600 bg-yellow-100')
    expect(getAlertSeverityColor('high')).toBe('text-orange-600 bg-orange-100')
    expect(getAlertSeverityColor('critical')).toBe('text-red-600 bg-red-100')
  })

  it('should return default color for unknown severity', () => {
    expect(getAlertSeverityColor('unknown')).toBe('text-gray-500 bg-gray-100')
    expect(getAlertSeverityColor('')).toBe('text-gray-500 bg-gray-100')
  })
})

// ===== MISSING COVERAGE TESTS =====

describe('cn', () => {
  it('should combine class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2')
  })

  it('should merge tailwind classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle arrays and objects', () => {
    expect(cn(['class1', 'class2'], { class3: true, class4: false })).toBe('class1 class2 class3')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn(null, undefined, false)).toBe('')
  })
})

describe('formatDate - edge cases', () => {
  it('should handle invalid date strings', () => {
    expect(formatDate('invalid-date')).toBe('Fecha inválida')
  })

  it('should handle invalid Date objects', () => {
    expect(formatDate(new Date('invalid'))).toBe('Fecha inválida')
  })

  it('should handle string dates correctly', () => {
    const result = formatDate('2024-01-15T10:30:00')
    expect(result).toMatch(/ene/)
    expect(result).toMatch(/2024/)
  })
})

describe('getStatusColor - complete coverage', () => {
  it('should return correct colors for all statuses', () => {
    expect(getStatusColor('mixing')).toBe('text-blue-600 bg-blue-100')
    expect(getStatusColor('heating')).toBe('text-orange-600 bg-orange-100')
    expect(getStatusColor('cooling')).toBe('text-cyan-600 bg-cyan-100')
    expect(getStatusColor('completed')).toBe('text-green-600 bg-green-100')
    expect(getStatusColor('warning')).toBe('text-yellow-600 bg-yellow-100')
    expect(getStatusColor('critical')).toBe('text-red-600 bg-red-100')
  })
})

describe('calculateEfficiency - edge cases', () => {
  it('should handle zero target', () => {
    expect(calculateEfficiency(50, 0)).toBe(Infinity)
  })

  it('should handle zero actual', () => {
    expect(calculateEfficiency(0, 100)).toBe(0)
  })

  it('should handle negative values', () => {
    expect(calculateEfficiency(-50, 100)).toBe(-50)
    expect(calculateEfficiency(50, -100)).toBe(-50)
  })

  it('should handle decimal values correctly', () => {
    expect(calculateEfficiency(33.7, 100)).toBe(34) // Should round
    expect(calculateEfficiency(33.4, 100)).toBe(33) // Should round
  })
})

describe('generateId - edge cases', () => {
  it('should generate IDs with valid characters', () => {
    const id = generateId()
    expect(id).toMatch(/^[a-z0-9]+$/)
  })

  it('should generate multiple unique IDs', () => {
    const ids = Array.from({ length: 100 }, () => generateId())
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(100)
  })
})

describe('isWithinRange - edge cases', () => {
  it('should handle decimal ranges', () => {
    expect(isWithinRange(1.5, [1.0, 2.0])).toBe(true)
    expect(isWithinRange(0.5, [1.0, 2.0])).toBe(false)
  })

  it('should handle equal min and max', () => {
    expect(isWithinRange(5, [5, 5])).toBe(true)
    expect(isWithinRange(4, [5, 5])).toBe(false)
  })

  it('should handle inverted ranges', () => {
    expect(isWithinRange(50, [100, 0])).toBe(false) // Normal behavior
  })
})

describe('formatNumber - edge cases', () => {
  it('should handle decimal numbers correctly', () => {
    expect(formatNumber(1234.567, 1)).toBe('1,234.6')
    expect(formatNumber(1234.123, 0)).toBe('1,234')
  })

  it('should handle very large numbers', () => {
    expect(formatNumber(999999999)).toBe('999,999,999')
  })

  it('should handle very small numbers', () => {
    expect(formatNumber(0.001, 3)).toBe('0.001')
  })
})

describe('formatCurrency - edge cases', () => {
  it('should handle negative amounts', () => {
    const result = formatCurrency(-1234.56)
    expect(result).toContain('-')
    expect(result).toContain('$')
  })

  it('should handle very large amounts', () => {
    const result = formatCurrency(999999999.99)
    expect(result).toMatch(/999,999,999.99/)
  })

  it('should handle decimal precision', () => {
    const result = formatCurrency(1234.1)
    expect(result).toMatch(/1,234.10/)
  })
})

// ===== CUSTOMER MANAGEMENT UTILITIES TESTS =====

describe('getCustomerStatusColor', () => {
  it('should return correct colors for all customer statuses', () => {
    expect(getCustomerStatusColor('active')).toBe('text-green-600 bg-green-100')
    expect(getCustomerStatusColor('inactive')).toBe('text-gray-600 bg-gray-100')
    expect(getCustomerStatusColor('vip')).toBe('text-purple-600 bg-purple-100')
    expect(getCustomerStatusColor('suspended')).toBe('text-red-600 bg-red-100')
  })

  it('should return default color for unknown status', () => {
    expect(getCustomerStatusColor('unknown')).toBe('text-gray-500 bg-gray-100')
    expect(getCustomerStatusColor('')).toBe('text-gray-500 bg-gray-100')
    expect(getCustomerStatusColor('random')).toBe('text-gray-500 bg-gray-100')
  })
})

describe('getCustomerTypeColor', () => {
  it('should return correct colors for all customer types', () => {
    expect(getCustomerTypeColor('individual')).toBe('text-blue-600 bg-blue-100')
    expect(getCustomerTypeColor('business')).toBe('text-green-600 bg-green-100')
    expect(getCustomerTypeColor('distributor')).toBe('text-purple-600 bg-purple-100')
    expect(getCustomerTypeColor('government')).toBe('text-orange-600 bg-orange-100')
  })

  it('should return default color for unknown type', () => {
    expect(getCustomerTypeColor('unknown')).toBe('text-gray-500 bg-gray-100')
    expect(getCustomerTypeColor('')).toBe('text-gray-500 bg-gray-100')
    expect(getCustomerTypeColor('corporation')).toBe('text-gray-500 bg-gray-100')
  })
})

describe('getPaymentStatusColor', () => {
  it('should return correct colors for all payment statuses', () => {
    expect(getPaymentStatusColor('pending')).toBe('text-yellow-600 bg-yellow-100')
    expect(getPaymentStatusColor('partial')).toBe('text-orange-600 bg-orange-100')
    expect(getPaymentStatusColor('paid')).toBe('text-green-600 bg-green-100')
    expect(getPaymentStatusColor('overdue')).toBe('text-red-600 bg-red-100')
  })

  it('should return default color for unknown status', () => {
    expect(getPaymentStatusColor('unknown')).toBe('text-gray-500 bg-gray-100')
    expect(getPaymentStatusColor('')).toBe('text-gray-500 bg-gray-100')
    expect(getPaymentStatusColor('processing')).toBe('text-gray-500 bg-gray-100')
  })
})

describe('calculateCustomerScore', () => {
  const validMetrics = {
    lifetime_value: 50000,
    payment_punctuality: 95,
    order_frequency_days: 15,
    last_activity_score: 80,
    satisfaction_rating: 4
  }

  it('should calculate score with valid metrics', () => {
    const score = calculateCustomerScore(validMetrics)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(100)
    expect(typeof score).toBe('number')
  })

  it('should handle high lifetime value correctly', () => {
    const highValueMetrics = { ...validMetrics, lifetime_value: 200000 }
    const score = calculateCustomerScore(highValueMetrics)
    expect(score).toBeGreaterThan(0)
  })

  it('should handle low frequency orders', () => {
    const lowFrequencyMetrics = { ...validMetrics, order_frequency_days: 60 }
    const score = calculateCustomerScore(lowFrequencyMetrics)
    expect(score).toBeGreaterThan(0)
  })

  it('should handle missing satisfaction rating', () => {
    const { satisfaction_rating, ...metricsWithoutSatisfaction } = validMetrics
    const score = calculateCustomerScore(metricsWithoutSatisfaction)
    expect(score).toBeGreaterThan(0)
  })

  it('should handle edge case values', () => {
    const edgeMetrics = {
      lifetime_value: 0,
      payment_punctuality: 0,
      order_frequency_days: 100,
      last_activity_score: 0,
      satisfaction_rating: 1
    }
    const score = calculateCustomerScore(edgeMetrics)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('should handle maximum values', () => {
    const maxMetrics = {
      lifetime_value: 500000,
      payment_punctuality: 100,
      order_frequency_days: 1,
      last_activity_score: 100,
      satisfaction_rating: 5
    }
    const score = calculateCustomerScore(maxMetrics)
    expect(score).toBeGreaterThan(80)
  })

  it('should normalize lifetime value correctly', () => {
    const metrics1 = { ...validMetrics, lifetime_value: 100000 }
    const metrics2 = { ...validMetrics, lifetime_value: 200000 }
    const score1 = calculateCustomerScore(metrics1)
    const score2 = calculateCustomerScore(metrics2)
    expect(score2).toBeGreaterThanOrEqual(score1)
  })
})

describe('getActivityLevel', () => {
  it('should return correct activity levels for all score ranges', () => {
    expect(getActivityLevel(85)).toEqual({ label: 'Muy Activo', color: 'text-green-600 bg-green-100' })
    expect(getActivityLevel(80)).toEqual({ label: 'Muy Activo', color: 'text-green-600 bg-green-100' })
    
    expect(getActivityLevel(70)).toEqual({ label: 'Activo', color: 'text-blue-600 bg-blue-100' })
    expect(getActivityLevel(60)).toEqual({ label: 'Activo', color: 'text-blue-600 bg-blue-100' })
    
    expect(getActivityLevel(50)).toEqual({ label: 'Moderado', color: 'text-yellow-600 bg-yellow-100' })
    expect(getActivityLevel(40)).toEqual({ label: 'Moderado', color: 'text-yellow-600 bg-yellow-100' })
    
    expect(getActivityLevel(30)).toEqual({ label: 'Bajo', color: 'text-orange-600 bg-orange-100' })
    expect(getActivityLevel(20)).toEqual({ label: 'Bajo', color: 'text-orange-600 bg-orange-100' })
    
    expect(getActivityLevel(10)).toEqual({ label: 'Inactivo', color: 'text-red-600 bg-red-100' })
    expect(getActivityLevel(0)).toEqual({ label: 'Inactivo', color: 'text-red-600 bg-red-100' })
  })

  it('should handle boundary values correctly', () => {
    expect(getActivityLevel(79)).toEqual({ label: 'Activo', color: 'text-blue-600 bg-blue-100' })
    expect(getActivityLevel(59)).toEqual({ label: 'Moderado', color: 'text-yellow-600 bg-yellow-100' })
    expect(getActivityLevel(39)).toEqual({ label: 'Bajo', color: 'text-orange-600 bg-orange-100' })
    expect(getActivityLevel(19)).toEqual({ label: 'Inactivo', color: 'text-red-600 bg-red-100' })
  })

  it('should handle edge cases', () => {
    expect(getActivityLevel(-1)).toEqual({ label: 'Inactivo', color: 'text-red-600 bg-red-100' })
    expect(getActivityLevel(100)).toEqual({ label: 'Muy Activo', color: 'text-green-600 bg-green-100' })
    expect(getActivityLevel(999)).toEqual({ label: 'Muy Activo', color: 'text-green-600 bg-green-100' })
  })
})

describe('formatCustomerType', () => {
  it('should format all customer types correctly', () => {
    expect(formatCustomerType('individual')).toBe('Persona Física')
    expect(formatCustomerType('business')).toBe('Empresa')
    expect(formatCustomerType('distributor')).toBe('Distribuidor')
    expect(formatCustomerType('government')).toBe('Gobierno')
  })

  it('should return original type for unknown types', () => {
    expect(formatCustomerType('unknown')).toBe('unknown')
    expect(formatCustomerType('')).toBe('')
    expect(formatCustomerType('corporation')).toBe('corporation')
    expect(formatCustomerType('nonprofit')).toBe('nonprofit')
  })

  it('should handle case sensitivity', () => {
    expect(formatCustomerType('Individual')).toBe('Individual') // Case sensitive
    expect(formatCustomerType('BUSINESS')).toBe('BUSINESS') // Case sensitive
  })
})

describe('daysSinceLastOrder', () => {
  // Mock current date for consistent testing
  const mockDate = new Date('2024-01-15T00:00:00')
  
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should return Infinity for undefined date', () => {
    expect(daysSinceLastOrder()).toBe(Infinity)
    expect(daysSinceLastOrder(undefined)).toBe(Infinity)
  })

  it('should calculate days correctly for valid dates', () => {
    expect(daysSinceLastOrder('2024-01-14T00:00:00')).toBe(1) // Yesterday
    expect(daysSinceLastOrder('2024-01-10T00:00:00')).toBe(5) // 5 days ago
    expect(daysSinceLastOrder('2024-01-01T00:00:00')).toBe(14) // 14 days ago
  })

  it('should handle same day orders', () => {
    expect(daysSinceLastOrder('2024-01-15T00:00:00')).toBe(0) // Exact same time = 0
    expect(daysSinceLastOrder('2024-01-15T12:00:00')).toBe(1) // 12 hours difference, rounds to 1
  })

  it('should handle future dates', () => {
    expect(daysSinceLastOrder('2024-01-16T00:00:00')).toBe(1) // Tomorrow (absolute diff)
    expect(daysSinceLastOrder('2024-01-20T00:00:00')).toBe(5) // Future date
  })

  it('should handle different date formats', () => {
    expect(daysSinceLastOrder('2024-01-14')).toBe(2) // ISO date format with timezone
    expect(daysSinceLastOrder('2024/01/14')).toBe(1) // Slash format, different timezone behavior
  })

  it('should handle invalid date strings', () => {
    expect(daysSinceLastOrder('invalid-date')).toBeNaN()
    expect(daysSinceLastOrder('not-a-date')).toBeNaN()
  })

  it('should handle very old dates', () => {
    expect(daysSinceLastOrder('2020-01-01T00:00:00')).toBe(1475) // About 4 years
  })

  it('should round up to next integer', () => {
    // Test partial days are rounded up (Math.ceil behavior)
    expect(daysSinceLastOrder('2024-01-14T12:00:00')).toBe(1) // ~1.5 days ago rounds to 1
  })
})