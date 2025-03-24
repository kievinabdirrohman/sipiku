import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { getUser } from '@/lib/helper';

export const useLinkedinData = () => {
    const supabase = createClient();

    return useQuery({
        queryKey: ['linkedinProfile'],
        queryFn: async () => {
            const user = await getUser();
            const { data } = await supabase
                .from('linkedin_analysis')
                .select('profile, result')
                .eq('email', user);

            return data
        }
    });

    // return data;
};