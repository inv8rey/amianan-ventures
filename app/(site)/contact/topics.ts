// Shared by the contact page (server) and its form (client).
export const TOPICS = [
  { value: 'question', label: 'A question' },
  { value: 'story', label: 'A story idea' },
  { value: 'opportunity', label: 'An opportunity to list' },
  { value: 'partnership', label: 'A partnership' },
  { value: 'ambassador', label: 'Becoming an ambassador' },
] as const
export type Topic = (typeof TOPICS)[number]['value']
