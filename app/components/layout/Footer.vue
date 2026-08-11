<template>
  <footer class="footer">
    <div class="footer__inner container">
      <div class="footer__grid">
        <div class="footer__brand" data-animate="fade">
          <h3 class="footer__logo">Rithy Martial & Fitness</h3>
          <p class="footer__tagline">{{ t('footer.tagline') }}</p>
          <p class="footer__made">{{ t('footer.madeWith') }}</p>
        </div>

        <div class="footer__col" data-animate="fade" data-delay="100">
          <h4 class="footer__heading">{{ t('footer.quickLinks') }}</h4>
          <ul class="footer__links">
            <li v-for="item in menuList.footer" :key="item.id">
              <RLink :to="item.href" class="footer__link" :target="item.blank ? '_blank' : '_self'" :rel="item.blank ? 'noopener noreferrer' : ''">{{ t(item.label) }}</RLink>
            </li>
          </ul>
        </div>

        <div class="footer__col" data-animate="fade" data-delay="200">
          <h4 class="footer__heading">{{ t('footer.programs') }}</h4>
          <ul class="footer__links">
            <li v-for="item in menuList.service" :key="item.id">
              <RLink :to="item.path" class="footer__link" :target="item.blank ? '_blank' : '_self'" :rel="item.blank ? 'noopener noreferrer' : ''">{{ t(item.label) }}</RLink>
            </li>
          </ul>
        </div>

        <div class="footer__col" data-animate="fade" data-delay="300">
          <h4 class="footer__heading">{{ t('footer.followUs') }}</h4>
          <div class="footer__socials">
            <a v-for="item in menuList.contact" :key="item.id" :href="localePath(item.href)" class="footer__social" :aria-label="item.name"><i :class="item.icon" ></i></a>
          </div>
          <p class="footer__contact">{{ t('contact.addressValue') }}</p>
        </div>
      </div>

      <div class="footer__bottom">
        <p>&copy; {{ year }} Rithy Martial & Fitness. {{ t('footer.rights') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const { t } = useI18n()
const menu = await useMenuData()
const year = new Date().getFullYear()

const route = useRoute()
const menuList = ref([])

onMounted(() => {
  menuList.value = menu
})

</script>

<style scoped>
.footer {
  background: var(--c-surface);
  border-top: 1px solid var(--c-border);
  padding-block: var(--space-7) var(--space-4);
}

.footer__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);

  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
}

.footer__logo {
  font-size: 1.5rem;
  margin-bottom: var(--space-1);
}

.footer__tagline {
  color: var(--c-muted);
  font-size: 0.875rem;
  margin-bottom: var(--space-2);
  max-width: 40ch;
}

.footer__made {
  color: var(--c-muted);
  font-size: 0.75rem;
}

.footer__heading {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-primary);
  margin-bottom: var(--space-2);
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer__link {
  color: var(--c-muted);
  font-size: 0.875rem;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--c-primary);
  }
}

.footer__socials {
  display: flex;
  gap: 0.5rem;
  margin-bottom: var(--space-2);
}

.footer__social {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px !important;
  height: 40px !important;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
  color: var(--c-muted);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all var(--transition-base);

  i{
    font-size: 18px;
  }

  &:hover {
    border-color: var(--c-primary);
    color: var(--c-primary);
    transform: translateY(-2px);
  }
}

.footer__contact {
  color: var(--c-muted);
  font-size: 0.8125rem;
}

.footer__bottom {
  margin-top: var(--space-5);
  padding-top: var(--space-3);
  border-top: 1px solid var(--c-border);
  text-align: center;

  p {
    color: var(--c-muted);  
    font-size: 0.75rem;
  }
}
</style>
