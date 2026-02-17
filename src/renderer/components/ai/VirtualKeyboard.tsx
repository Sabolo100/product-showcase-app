import { useState } from 'react'
import { Delete, Space } from 'lucide-react'

interface VirtualKeyboardProps {
  value: string
  onChange: (value: string) => void
  onEnter?: () => void
}

const KEYBOARD_LAYOUTS = {
  lowercase: [
    ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
    ['y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-']
  ],
  uppercase: [
    ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
    ['Y', 'X', 'C', 'V', 'B', 'N', 'M', '!', '?', '_']
  ],
  numbers: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['@', '#', '$', '%', '&', '*', '(', ')', '=', '+'],
    ['/', '\\', '|', '[', ']', '{', '}', '<', '>', '~']
  ]
}

export default function VirtualKeyboard({ value, onChange, onEnter }: VirtualKeyboardProps) {
  const [isUppercase, setIsUppercase] = useState(false)
  const [showNumbers, setShowNumbers] = useState(false)

  const currentLayout = showNumbers
    ? KEYBOARD_LAYOUTS.numbers
    : isUppercase
    ? KEYBOARD_LAYOUTS.uppercase
    : KEYBOARD_LAYOUTS.lowercase

  const handleKeyPress = (key: string) => {
    onChange(value + key)
    // Auto-switch back to lowercase after one character (like mobile keyboards)
    if (isUppercase && !showNumbers) {
      setIsUppercase(false)
    }
  }

  const handleBackspace = () => {
    onChange(value.slice(0, -1))
  }

  const handleSpace = () => {
    onChange(value + ' ')
  }

  const toggleCase = () => {
    setIsUppercase(!isUppercase)
  }

  const toggleNumbers = () => {
    setShowNumbers(!showNumbers)
  }

  return (
    <div className="bg-bg-primary rounded-lg p-4 space-y-2">
      {currentLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 justify-center">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="min-w-[50px] h-[60px] bg-bg-secondary rounded-lg hover:bg-primary transition-colors touch-feedback text-lg font-medium"
            >
              {key}
            </button>
          ))}
        </div>
      ))}

      {/* Bottom row with special keys */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={toggleNumbers}
          className={`px-6 h-[60px] rounded-lg transition-colors touch-feedback ${
            showNumbers ? 'bg-primary' : 'bg-bg-secondary hover:bg-primary'
          }`}
        >
          {showNumbers ? 'ABC' : '123'}
        </button>

        {!showNumbers && (
          <button
            onClick={toggleCase}
            className={`px-6 h-[60px] rounded-lg transition-colors touch-feedback ${
              isUppercase ? 'bg-primary' : 'bg-bg-secondary hover:bg-primary'
            }`}
          >
            {isUppercase ? '↓' : '↑'}
          </button>
        )}

        <button
          onClick={handleSpace}
          className="flex-1 h-[60px] bg-bg-secondary rounded-lg hover:bg-primary transition-colors touch-feedback flex items-center justify-center"
        >
          <Space size={24} />
        </button>

        <button
          onClick={handleBackspace}
          className="px-6 h-[60px] bg-bg-secondary rounded-lg hover:bg-red-600 transition-colors touch-feedback flex items-center justify-center"
        >
          <Delete size={24} />
        </button>

        {onEnter && (
          <button
            onClick={onEnter}
            className="px-8 h-[60px] bg-primary rounded-lg hover:bg-primary-hover transition-colors touch-feedback font-semibold"
          >
            Enter
          </button>
        )}
      </div>
    </div>
  )
}
