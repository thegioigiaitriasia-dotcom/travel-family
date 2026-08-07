import { createClient } from '@supabase/supabase-js';
const url = 'https://tcpbxxwcljnuxwprfwvm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcGJ4eHdjbGpudXh3cHJmd3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTkyODA3MywiZXhwIjoyMTAxNTA0MDczfQ.1efdtgmY0GDXz0zuJwLOLXlc8l4DpBNZRyjwcjAtNVI';
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.auth.admin.listUsers();
  const user = data.users.find(u => u.email === 'tanloifmc@yahoo.com');
  console.log('Auth user ID:', user?.id);
}
test();
