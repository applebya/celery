import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

const TOUR_STORAGE_KEY = 'celery-tour-completed'

interface TourStep {
  target: string // CSS selector or data-tour attribute
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="rate-input"]',
    title: 'Enter your rate',
    description: 'Start by entering your hourly rate or target salary. Click "Switch to salary" to toggle modes.',
    position: 'bottom',
  },
  {
    target: '[data-tour="currency-select"]',
    title: 'Choose your currency',
    description: 'Select your primary currency. We support CAD, USD, EUR, GBP, and MXN.',
    position: 'bottom',
  },
  {
    target: '[data-tour="settings-panel"]',
    title: 'Customize your calculation',
    description: 'Expand these sections to adjust your location, work schedule, and tax settings for accurate estimates.',
    position: 'bottom',
  },
  {
    target: '[data-tour="result-card"]',
    title: 'Your take-home pay',
    description: 'See your annual take-home instantly. The green number is what you keep after taxes.',
    position: 'top',
  },
  {
    target: '[data-tour="compare-button"]',
    title: 'Compare offers',
    description: 'Got multiple job offers? Compare them side-by-side to find the best deal.',
    position: 'top',
  },
]

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  // Check if tour should show on mount
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY)
    if (!completed) {
      // Small delay to let the page render
      const timer = setTimeout(() => setIsActive(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  // Update target element position
  useEffect(() => {
    if (!isActive) return

    const updatePosition = () => {
      const step = TOUR_STEPS[currentStep]
      const element = document.querySelector(step.target)
      if (element) {
        setTargetRect(element.getBoundingClientRect())
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [isActive, currentStep])

  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    setIsActive(false)
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }, [currentStep, completeTour])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const skip = useCallback(() => {
    completeTour()
  }, [completeTour])

  if (!isActive || !targetRect) return null

  const step = TOUR_STEPS[currentStep]
  const padding = 8
  const tooltipOffset = 12

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 10001,
    }

    switch (step.position) {
      case 'bottom':
        style.top = targetRect.bottom + tooltipOffset
        style.left = Math.max(16, Math.min(targetRect.left, window.innerWidth - 320))
        break
      case 'top':
        style.bottom = window.innerHeight - targetRect.top + tooltipOffset
        style.left = Math.max(16, Math.min(targetRect.left, window.innerWidth - 320))
        break
      case 'left':
        style.top = targetRect.top
        style.right = window.innerWidth - targetRect.left + tooltipOffset
        break
      case 'right':
        style.top = targetRect.top
        style.left = targetRect.right + tooltipOffset
        break
    }

    return style
  }

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop with cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000]"
            style={{
              background: `radial-gradient(ellipse 100% 100% at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + padding}px, rgba(0,0,0,0.75) ${Math.max(targetRect.width, targetRect.height) / 2 + padding + 50}px)`,
            }}
            onClick={skip}
          />

          {/* Spotlight border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[10000] pointer-events-none rounded-lg"
            style={{
              top: targetRect.top - padding,
              left: targetRect.left - padding,
              width: targetRect.width + padding * 2,
              height: targetRect.height + padding * 2,
              boxShadow: '0 0 0 2px rgb(16 185 129), 0 0 20px rgb(16 185 129 / 0.3)',
            }}
          />

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: step.position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl shadow-2xl max-w-[300px] overflow-hidden"
            style={getTooltipStyle()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">{step.title}</span>
              </div>
              <button
                onClick={skip}
                className="p-1 rounded-md hover:bg-muted transition-colors"
                aria-label="Close tour"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
              <div className="flex items-center gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === currentStep ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? 'Done' : 'Next'}
                  {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook to reset tour (for testing)
export function useResetTour() {
  return useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY)
    window.location.reload()
  }, [])
}
