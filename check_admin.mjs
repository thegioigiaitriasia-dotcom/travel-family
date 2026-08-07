import { createClient } from '@supabase/supabase-js';

const url = 'https://tcpbxxwcljnuxwprfwvm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcGJ4eHdjbGpudXh3cHJmd3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTkyODA3MywiZXhwIjoyMTAxNTA0MDczfQ.1efdtgmY0GDXz0zuJwLOLXlc8l4DpBNZRyjwcjAtNVI';
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', 'tanloifmc@yahoo.com');
  console.log(data);
  if (error) console.error(error);
  
  if (data && data.length > 0 && !data[0].is_admin) {
    const { error: updateError } = await supabase.from('profiles').update({ is_admin: true }).eq('email', 'tanloifmc@yahoo.com');
    if (updateError) console.error('Update Error:', updateError);
    else console.log('Successfully updated is_admin to true');
  }
}
test();
