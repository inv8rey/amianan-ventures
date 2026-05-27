'use server'

import { createServiceClient } from '@/lib/supabase/service'

type ObjectiveInput = {
  id: string | null
  title: string
  description: string | null
  quarter: string | null
  status: string
}

export async function saveObjective(input: ObjectiveInput) {
  try {
    const supabase = createServiceClient()

    if (input.id) {
      const { error } = await supabase
        .from('objectives')
        .update({
          title: input.title,
          description: input.description,
          quarter: input.quarter,
          status: input.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
      if (error) return { ok: false as const, error: error.message }
      return { ok: true as const, id: input.id }
    } else {
      const { data, error } = await supabase
        .from('objectives')
        .insert({
          title: input.title,
          description: input.description,
          quarter: input.quarter,
          status: input.status,
        })
        .select('id')
        .single()
      if (error) return { ok: false as const, error: error.message }
      return { ok: true as const, id: data.id }
    }
  } catch (e) {
    return { ok: false as const, error: String(e) }
  }
}

export async function deleteObjective(id: string) {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('objectives').delete().eq('id', id)
    if (error) return { ok: false as const, error: error.message }
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: String(e) }
  }
}

type KeyResultInput = {
  id: string | null
  objective_id: string
  title: string
  target_type: 'number' | 'percentage'
  target_value: number
  current_value: number
  unit: string | null
  sort_order: number | null
}

type KeyResultRow = {
  id: string
  title: string
  target_type: 'number' | 'percentage'
  target_value: number
  current_value: number
  unit: string | null
  sort_order: number | null
}

export async function saveKeyResult(
  input: KeyResultInput,
): Promise<{ ok: true; kr: KeyResultRow } | { ok: false; error: string }> {
  try {
    const supabase = createServiceClient()

    if (input.id) {
      const { data, error } = await supabase
        .from('key_results')
        .update({
          title: input.title,
          target_type: input.target_type,
          target_value: input.target_value,
          current_value: input.current_value,
          unit: input.unit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select('id, title, target_type, target_value, current_value, unit, sort_order')
        .single()
      if (error) return { ok: false, error: error.message }
      return { ok: true, kr: data as KeyResultRow }
    } else {
      const { data, error } = await supabase
        .from('key_results')
        .insert({
          objective_id: input.objective_id,
          title: input.title,
          target_type: input.target_type,
          target_value: input.target_value,
          current_value: input.current_value,
          unit: input.unit,
          sort_order: input.sort_order,
        })
        .select('id, title, target_type, target_value, current_value, unit, sort_order')
        .single()
      if (error) return { ok: false, error: error.message }
      return { ok: true, kr: data as KeyResultRow }
    }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function deleteKeyResult(id: string) {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('key_results').delete().eq('id', id)
    if (error) return { ok: false as const, error: error.message }
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: String(e) }
  }
}
