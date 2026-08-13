import { defineBoot } from '#q-app';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';

export default defineBoot(({ app }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 15000,
      },
    },
  });

  app.use(VueQueryPlugin, { queryClient });
});
