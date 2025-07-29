'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/browser';

export default function GetCurrentUser() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(userProfile);
    };

    load();
  }, []);


}
