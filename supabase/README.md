# Supabase workspace

This folder is reserved for Supabase project assets such as:

- SQL migrations
- seed data
- generated database types
- Edge Functions

Once the Supabase CLI is installed and linked, common next steps are:

```bash
supabase init
supabase link --project-ref <your-project-ref>
supabase gen types typescript --linked > packages/supabase/src/database.types.ts
```
