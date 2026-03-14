// js/supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://qynhjjaktdkxqpgeysjh.supabase.co/'
const supabaseKey = 'sb_publishable_tu_llave_de_la_foto' 

export const supabase = createClient(supabaseUrl, supabaseKey)