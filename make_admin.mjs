import { createClient } from '@supabase/supabase-js';

const url = 'https://tcpbxxwcljnuxwprfwvm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcGJ4eHdjbGpudXh3cHJmd3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTkyODA3MywiZXhwIjoyMTAxNTA0MDczfQ.1efdtgmY0GDXz0zuJwLOLXlc8l4DpBNZRyjwcjAtNVI';
const supabase = createClient(url, key);

async function makeAdmin() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error('Error listing users:', userError);
    return;
  }
  
  const targetUser = users.users.find(u => u.email === 'tanloifmc@yahoo.com');
  if (!targetUser) {
    console.log('User tanloifmc@yahoo.com not found');
    return;
  }

  const { data, error } = await supabase.from('profiles').update({ is_admin: true }).eq('id', targetUser.id);
  if (error) {
    console.error('Error updating profile:', error);
  } else {
    console.log('Successfully made tanloifmc@yahoo.com admin!');
  }
}
makeAdmin();
