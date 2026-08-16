<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-white">
      <q-toolbar>
        <q-toolbar-title class="row items-center">
          <img src="/img/logo.png" style="height: 30px;">
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <slot></slot>
    </q-page-container>
  </q-layout>
</template>
