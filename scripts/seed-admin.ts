import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedAdmin() {
  const email = 'admin@edukids.mn'
  const password = process.env.ADMIN_SEED_PASSWORD

  if (!password) {
    console.error('ADMIN_SEED_PASSWORD is not set in .env.local')
    process.exit(1)
  }

  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    console.log('Admin user already exists, skipping.')
    return
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'Admin', role: 'ADMIN' },
  })

  if (error || !data.user) {
    console.error('Failed to create admin auth user:', error?.message)
    process.exit(1)
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert(
      { id: data.user.id, email, name: 'Admin', role: 'ADMIN' },
      { onConflict: 'id' }
    )

  if (profileError) {
    console.error('Failed to create admin profile:', profileError.message)
    process.exit(1)
  }

  console.log('Admin user created successfully:', email)
}

seedAdmin()