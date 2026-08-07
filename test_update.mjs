import { createClient } from '@supabase/supabase-js';

const url = 'https://tcpbxxwcljnuxwprfwvm.supabase.co';
const anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcGJ4eHdjbGpudXh3cHJmd3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjgwNzMsImV4cCI6MjEwMTUwNDA3M30.S2wG-F6Td7r0NocwwjmGGmNOKfRKECevrlD70qN2uuk';
const supabase = createClient(url, anon_key);

async function test() {
  const userId = '00c9abc5-bce8-498a-a629-2c7623c0d938';
  const { data, error } = await supabase.from('profiles').update({ avatar_url: 'test' }).eq('id', userId);
  console.log('Error:', error);
}
test();
