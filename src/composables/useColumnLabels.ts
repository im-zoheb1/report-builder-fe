import { computed, type Ref } from 'vue';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { getColumnLabels, setColumnLabel } from '@/api';
import { useLocaleStore } from '@/stores/locale';
import type { ColumnLabel } from '@/types/labels';

export function useColumnLabels(dataset: Ref<string>) {
  const locale = useLocaleStore();
  const queryClient = useQueryClient();

  const queryKey = computed(() => ['columnLabels', dataset.value]);

  const { data: overrides } = useQuery({
    queryKey,
    queryFn: () => getColumnLabels(dataset.value),
    enabled: computed(() => dataset.value !== ''),
  });

  function labelFor(name: string, fallback: string): string {
    const override = overrides.value?.[name];
    if (!override) return fallback;
    const other: keyof ColumnLabel = locale.language === 'en' ? 'ar' : 'en';
    return override[locale.language] || override[other] || fallback;
  }

  const { mutateAsync: saveLabel } = useMutation({
    mutationFn: (input: { column: string } & ColumnLabel) => {
      const label: ColumnLabel = {};
      if (input.en !== undefined) label.en = input.en;
      if (input.ar !== undefined) label.ar = input.ar;
      return setColumnLabel(dataset.value, input.column, label);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey.value }),
  });

  return { overrides, labelFor, saveLabel };
}
