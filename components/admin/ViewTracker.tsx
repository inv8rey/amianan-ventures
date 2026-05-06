'use client'

import { useEffect } from 'react'

export function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    // Fire-and-forget — don't block page render
    fetch(`/api/articles/${articleId}/view`, { method: 'POST' }).catch(() => {})
  }, [articleId])
  return null
}
