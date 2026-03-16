import { useEffect, useRef, useState, useCallback } from 'react'
import Quagga, { QuaggaJSResultObject } from '@ericblade/quagga2'

interface BarcodeScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScan: (barcode: string) => void
}

/**
 * Validate ISBN-13 checksum
 * The check digit makes: sum of (digit * alternating 1,3) divisible by 10
 */
function isValidIsbn13Checksum(isbn: string): boolean {
  if (isbn.length !== 13) return false

  let sum = 0
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(isbn[i], 10)
    sum += digit * (i % 2 === 0 ? 1 : 3)
  }

  return sum % 10 === 0
}

/**
 * Validate ISBN-10 checksum
 * Sum of (digit * position) should be divisible by 11
 * X represents 10 for the check digit
 */
function isValidIsbn10Checksum(isbn: string): boolean {
  if (isbn.length !== 10) return false

  let sum = 0
  for (let i = 0; i < 10; i++) {
    const char = isbn[i].toUpperCase()
    const value = char === 'X' ? 10 : parseInt(char, 10)
    sum += value * (10 - i)
  }

  return sum % 11 === 0
}

/**
 * Validate if a code is a valid ISBN with correct checksum
 * This catches misread barcodes where digits got scrambled
 */
function isValidIsbn(code: string): { valid: boolean; reason?: string } {
  const cleaned = code.replace(/[-\s]/g, '')

  // ISBN-13: 13 digits, starts with 978 or 979
  if (cleaned.length === 13 && /^\d{13}$/.test(cleaned)) {
    if (!cleaned.startsWith('978') && !cleaned.startsWith('979')) {
      return { valid: false, reason: 'ISBN-13 doit commencer par 978 ou 979' }
    }
    if (!isValidIsbn13Checksum(cleaned)) {
      return { valid: false, reason: 'Checksum invalide - code-barres mal lu, réessayez' }
    }
    return { valid: true }
  }

  // ISBN-10: 10 characters (9 digits + check digit which can be X)
  if (cleaned.length === 10 && /^\d{9}[\dX]$/i.test(cleaned)) {
    if (!isValidIsbn10Checksum(cleaned)) {
      return { valid: false, reason: 'Checksum invalide - code-barres mal lu, réessayez' }
    }
    return { valid: true }
  }

  return { valid: false, reason: `Longueur invalide (${cleaned.length} chiffres)` }
}

function ScannerContent({
  onClose,
  onScan,
}: {
  onClose: () => void
  onScan: (barcode: string) => void
}) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const isStartedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)

  const handleDetected = useCallback(
    (result: QuaggaJSResultObject) => {
      const code = result?.codeResult?.code
      const format = result?.codeResult?.format

      console.log('=== BARCODE DETECTED ===')
      console.log('Code:', code)
      console.log('Format:', format)
      console.log('Length:', code?.length)

      if (code) {
        const validation = isValidIsbn(code)
        if (validation.valid) {
          console.log('Valid ISBN detected:', code)
          Quagga.stop()
          onScan(code)
          onClose()
        } else {
          // Invalid ISBN - show warning but keep scanning
          console.log('Invalid ISBN:', code, '-', validation.reason)
          setWarning(validation.reason || `Code "${code}" n'est pas un ISBN valide.`)
          // Clear warning after 3 seconds
          setTimeout(() => setWarning(null), 3000)
        }
      }
    },
    [onScan, onClose]
  )

  useEffect(() => {
    if (!scannerRef.current) return

    // Track if this effect instance has been cleaned up (for React StrictMode)
    let isCancelled = false

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment',
            width: { min: 640 },
            height: { min: 480 },
          },
        },
        decoder: {
          // Focus on ISBN formats: EAN-13 (ISBN-13) and Code 39 (some ISBN-10)
          // Removed EAN-8 as it's not used for ISBNs
          readers: ['ean_reader'],
        },
        locate: true,
        frequency: 10,
      },
      (err) => {
        // Don't proceed if the effect was cleaned up while init was running
        if (isCancelled) return

        if (err) {
          setError("Impossible d'accéder à la caméra. Veuillez autoriser l'accès.")
          return
        }
        setIsInitialized(true)
        isStartedRef.current = true
        Quagga.start()
      }
    )

    Quagga.onDetected(handleDetected)

    return () => {
      isCancelled = true
      Quagga.offDetected(handleDetected)
      if (isStartedRef.current) {
        Quagga.stop()
        isStartedRef.current = false
      }
    }
  }, [handleDetected])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      data-testid="scanner-overlay"
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-cream-100 rounded-xl shadow-lg max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-cream-300">
          <h2 className="text-lg font-serif font-medium text-wood-600 text-center">
            Scanner un code-barres ISBN
          </h2>
          <p className="text-sm text-muted text-center mt-1">
            Cherchez le code-barres à 13 chiffres commençant par 978 (généralement au dos du livre)
          </p>
        </div>

        {/* Scanner viewport */}
        <div className="relative bg-black aspect-[4/3] overflow-hidden">
          <div ref={scannerRef} data-testid="scanner-viewport" className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full [&>canvas]:hidden" />

          {/* Scanning overlay */}
          {isInitialized && !error && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 opacity-50 animate-pulse" />
              <div className="absolute inset-8 border-2 border-white/30 rounded-lg" />
            </div>
          )}

          {/* Loading state */}
          {!isInitialized && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <p className="text-white">Initialisation de la caméra...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
              <p className="text-white text-center">{error}</p>
            </div>
          )}

          {/* Warning for invalid barcodes */}
          {warning && !error && (
            <div className="absolute bottom-2 left-2 right-2 bg-amber-500 text-white text-xs p-2 rounded">
              {warning}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg text-wood-500 bg-cream-200 hover:bg-cream-300 font-medium transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

export function BarcodeScannerModal({ isOpen, onClose, onScan }: BarcodeScannerModalProps) {
  // Render ScannerContent only when open - this ensures fresh state each time
  if (!isOpen) return null
  return <ScannerContent onClose={onClose} onScan={onScan} />
}
