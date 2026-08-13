<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" aria-label="Back to reports" @click="goBack" />

        <q-btn
          v-if="$q.screen.lt.md"
          flat
          round
          dense
          icon="storage"
          aria-label="Toggle data panel"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <div class="row items-center q-mx-sm" style="min-width: 0; flex: 1">
          <q-input
            v-model="name"
            borderless
            dense
            class="text-h6 name-input"
            placeholder="Untitled Report"
            aria-label="Report name"
          />
          <q-icon
            v-if="store.isDirty"
            name="fiber_manual_record"
            size="10px"
            color="orange"
            class="q-ml-xs"
          >
            <q-tooltip>Unsaved changes</q-tooltip>
          </q-icon>
        </div>

        <q-btn flat dense no-caps icon="download" label="Export CSV" :disable="!store.isValid" @click="onExport" />
        <q-btn
          unelevated
          color="primary"
          no-caps
          icon="save"
          label="Save"
          class="q-ml-sm"
          :loading="saving"
          :disable="!store.isValid"
          @click="onSave"
        />

        <q-btn
          v-if="$q.screen.lt.md"
          flat
          round
          dense
          icon="tune"
          aria-label="Toggle configure panel"
          class="q-ml-sm"
          @click="rightDrawerOpen = !rightDrawerOpen"
        />

        <q-btn
          flat
          round
          dense
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          aria-label="Toggle dark mode"
          class="q-ml-sm"
          @click="$q.dark.toggle()"
        >
          <q-tooltip>Toggle dark mode</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" bordered :width="300" :breakpoint="1023">
      <q-scroll-area class="fit">
        <DataPanel />
      </q-scroll-area>
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" side="right" bordered :width="340" :breakpoint="1023">
      <q-scroll-area class="fit">
        <ConfigurePanel />
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useQuasar } from 'quasar';
import { useDefinitionStore } from '@/stores/definition';
import { getReport, saveReport, exportCsv } from '@/api';
import { useDatasetQuery } from '@/composables/useCatalog';
import DataPanel from '@/components/builder/DataPanel.vue';
import ConfigurePanel from '@/components/builder/ConfigurePanel.vue';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const store = useDefinitionStore();

const leftDrawerOpen = ref(!$q.screen.lt.md);
const rightDrawerOpen = ref(!$q.screen.lt.md);
const saving = ref(false);

const name = computed({
  get: () => store.meta.name,
  set: (v: string) => store.setName(v),
});

const datasetName = computed(() => store.report.dataset);
const { data: datasetCatalog } = useDatasetQuery(datasetName);
watch(datasetCatalog, (ds) => store.setDatasetCatalog(ds ?? null), { immediate: true });

onMounted(async () => {
  const id = route.params.id as string | undefined;
  if (id) {
    try {
      const saved = await getReport(id);
      store.loadReport(saved);
    } catch {
      $q.notify({ type: 'negative', message: 'Could not load report.' });
      await router.replace('/reports');
    }
  } else {
    store.reset();
  }
});

function goBack() {
  void router.push('/reports');
}

async function onSave() {
  saving.value = true;
  try {
    const payload: Parameters<typeof saveReport>[0] = {
      name: store.meta.name || 'Untitled Report',
      definition: store.report,
    };
    if (store.meta.id) payload.id = store.meta.id;
    if (store.meta.description !== undefined) payload.description = store.meta.description;
    const saved = await saveReport(payload);
    store.markSaved(saved);
    $q.notify({ type: 'positive', message: 'Report saved.' });
    if (route.name === 'report-new') {
      await router.replace(`/reports/${saved.id}/edit`);
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save report.' });
  } finally {
    saving.value = false;
  }
}

async function onExport() {
  try {
    const blob = await exportCsv(store.report);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${store.meta.name || 'report'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to export CSV.' });
  }
}

onBeforeRouteLeave((to, from, next) => {
  if (!store.isDirty) {
    next();
    return;
  }
  $q.dialog({
    title: 'Discard unsaved changes?',
    message: 'You have unsaved changes to this report. Leaving now will discard them.',
    persistent: true,
    ok: { label: 'Discard', color: 'negative', flat: true },
    cancel: { label: 'Stay', flat: true },
  })
    .onOk(() => next())
    .onCancel(() => next(false));
});
</script>

<style scoped lang="scss">
.name-input {
  :deep(.q-field__control) {
    font-size: 1.1rem;
  }
}
</style>
