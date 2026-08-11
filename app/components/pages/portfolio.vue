<template>
  <div class="portfolio-page">
    <section class="section">
      <div class="container">
        <SectionHeader
          eyebrow="GALLERY & HIGHLIGHTS"
          title="Training & Fight Media"
          subtitle="Explore training sessions, fighter sparring, student transformations, and ancient martial arts demonstrations."
          centered
          data-animate="fade"
        />

        <div data-animate="slide-up" data-delay="100">
          <PortfolioGrid />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const animate = useAnimate()

onMounted(() => {
  animate.init()
})
</script>

<style scoped>
</style>
