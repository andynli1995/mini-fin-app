'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const DEFAULT_MAX_LENGTH = 120

interface ExpandableTextProps {
  text: string
  maxLength?: number
  className?: string
}

export default function ExpandableText({
  text,
  maxLength = DEFAULT_MAX_LENGTH,
  className = '',
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false)
  const needsTruncation = text.length > maxLength
  const displayText = needsTruncation && !expanded
    ? `${text.slice(0, maxLength).trim()}…`
    : text

  if (!text) return null

  return (
    <div className={className}>
      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words">
        {displayText}
      </p>
      {needsTruncation && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" /> Show more
            </>
          )}
        </button>
      )}
    </div>
  )
}
