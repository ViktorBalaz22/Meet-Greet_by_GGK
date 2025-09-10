'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QRModalProps {
  url: string
  onClose: () => void
}

export default function QRModal({ url, onClose }: QRModalProps) {
  const [qrCode, setQrCode] = useState<string>('')

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(setQrCode)
  }, [url])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">QR kód</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
            {qrCode && (
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            )}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Naskenujte QR kód pre zobrazenie profilu
          </p>
          <p className="mt-2 text-xs text-gray-500 break-all">
            {url}
          </p>
        </div>
      </div>
    </div>
  )
}
