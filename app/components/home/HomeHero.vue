<template>
  <section id="hero" class="relative h-[90vh] flex items-center justify-center overflow-hidden bg-neutral-950 text-white">
    <!-- Slideshow Background -->
    <div class="absolute inset-0">
      <transition-group name="fade">
        <div
          v-for="(img, idx) in slides"
          :key="img"
          v-show="currentSlide === idx"
          class="absolute inset-0 bg-cover bg-center transition-all duration-[6000ms] ease-out"
          :style="{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.9)), url(${img})`,
            transform: currentSlide === idx ? 'scale(1)' : 'scale(1.08)'
          }"
        />
      </transition-group>
    </div>

    <!-- Hero Content -->
    <div class="container relative z-10 text-center space-y-6 max-w-4xl px-4">
      <div data-animate class="inline-flex items-center gap-2 border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 rounded-full text-rose-500 text-xs font-bold uppercase tracking-widest">
        <span class="glow-dot"></span>
        {{ tBy({
          en: 'No Limits • Just Grit',
          km: 'គ្មានដែនកំណត់ • មានតែការតស៊ូ',
          cn: '超越自我 • 唯有坚持'
        }) }}
      </div>

      <h1 data-animate data-delay="1" class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight uppercase leading-none font-syne">
        RITHTHY <br class="sm:hidden" />
        <span class="text-gradient-crimson">MARTIAL & FITNESS</span>
      </h1>

      <p data-animate data-delay="2" class="text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl mx-auto font-medium leading-relaxed">
        {{ tBy({
          en: 'Welcome to Riththy Martial & Fitness. We combine ancient discipline with modern conditioning to unlock your ultimate physical capability. Start your journey today.',
          km: 'សូមស្វាគមន៍មកកាន់ រិទ្ធី ក្បាច់គុន និងហ្វីតណេស។ យើងរួមបញ្ចូលគ្នានូវវិន័យពីបុរាណជាមួយនឹងកាយសម្បទាទំនើប ដើម្បីបង្ហាញពីសមត្ថភាពពិតរបស់អ្នក។ ចាប់ផ្តើមថ្ងៃនេះ។',
          cn: '欢迎来到 Riththy 武术与健身。我们将古老的武术纪律与现代体能训练相结合，释放您的终极潜能。今天就开始您的蜕变之旅。'
        }) }}
      </p>

      <div data-animate data-delay="3" class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          @click="scrollTo('#services')"
          class="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-rose-600/35 cursor-pointer"
        >
          {{ $t('actions.explore') }}
        </button>
        <button
          @click="scrollTo('footer')"
          class="w-full sm:w-auto px-8 py-3.5 border border-neutral-700 hover:border-rose-500 text-neutral-300 hover:text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all bg-black/40 backdrop-blur-sm cursor-pointer"
        >
          {{ $t('actions.contact_us') }}
        </button>
      </div>
    </div>

    <!-- Slide Indicators -->
    <div class="absolute bottom-8 left-0 right-0 flex justify-center gap-2.5 z-10">
      <button
        v-for="(img, idx) in slides"
        :key="idx"
        @click="currentSlide = idx"
        class="w-8 h-1 rounded-full transition-all duration-300 cursor-pointer"
        :class="currentSlide === idx ? 'bg-rose-500 w-12' : 'bg-neutral-600 hover:bg-neutral-400'"
        :aria-label="`Go to slide ${idx + 1}`"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const slides = [
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1600&auto=format&fit=crop',
  '/images/riththy_1.jpg',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=1600&auto=format&fit=crop'
]

const currentSlide = ref(0)
let timer = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

onMounted(() => {
  timer = setInterval(nextSlide, 6000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const scrollTo = (selector) => {
  const element = document.querySelector(selector)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
