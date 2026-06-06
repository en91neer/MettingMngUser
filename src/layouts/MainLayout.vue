<template>
    <div class="layout">
  
      <Header />
      <AccountBar />
  
      <div class="body">
  
        <Sidebar />
  
        <main class="content">
          <router-view />
        </main>
  
      </div>
  
      <Footer />
  
    </div>
  </template>
  
<script setup>
    import Header from '@/components/Header.vue'
    import AccountBar from '@/components/AccountBar.vue'
    import Sidebar from '@/components/Sidebar.vue'
    import Footer from '@/components/Footer.vue'

    //CSS import
    import '@/assets/css/layout.css'
</script>

