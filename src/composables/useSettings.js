import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const cache = ref({})
let fetched = false

export function useSettings() {
  async function fetchSettings() {
    if (fetched) return
    const { data } = await supabase.from('site_settings').select('key, value')
    if (data) data.forEach(r => { cache.value[r.key] = r.value })
    fetched = true
  }

  function get(key, fallback = '') {
    return cache.value[key] ?? fallback
  }

  async function set(key, value) {
    cache.value[key] = value
    await supabase.from('site_settings').upsert({ key, value })
  }

  return { fetchSettings, get, set, cache }
}
