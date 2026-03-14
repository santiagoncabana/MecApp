// js/supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://qynhjjaktdkxqpgeysjh.supabase.co/'
const supabaseKey = "sb_publishable_iHiDILklz3nQmAQQq5KZjA_rp_M2HM-"

export const supabase = createClient(supabaseUrl, supabaseKey)