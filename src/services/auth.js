import { supabase } from '../lib/supabase.js'

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUp(email, password, displayName) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getProfile() {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle()
  if (error) throw error
  return data
}

export async function updateProfile(userId, fields) {
  const { data, error } = await supabase.from('profiles').update(fields).eq('id', userId).select().single()
  if (error) throw error
  return data
}
