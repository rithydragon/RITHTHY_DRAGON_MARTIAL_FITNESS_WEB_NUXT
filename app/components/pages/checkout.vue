<template>
  <div class="checkout-page section">
    <div class="container container--narrow">
      <div v-if="loading" class="checkout-page__loading">
        <div class="spinner"></div>
        <p>Loading checkout session...</p>
      </div>

      <div v-else-if="paymentComplete" class="checkout-card checkout-card--success">
        <div class="success-icon">
          <i class="ri-checkbox-circle-fill"></i>
        </div>
        <h2 class="checkout-title">Payment Successful!</h2>
        <p class="checkout-subtitle">
          Your membership subscription is now <strong>ACTIVE</strong>. Welcome to Rithy Martial & Fitness.
        </p>

        <div class="success-details">
          <div class="detail-row">
            <span>Payment Status</span>
            <span class="badge badge--success">COMPLETED</span>
          </div>
          <div class="detail-row">
            <span>Subscription Status</span>
            <span class="badge badge--success">ACTIVE</span>
          </div>
          <div class="detail-row" v-if="paymentId">
            <span>Payment Ref ID</span>
            <span>#{{ paymentId }}</span>
          </div>
        </div>

        <div class="success-actions">
          <RLink to="/" class="btn btn--primary btn--full">
            Return to Dashboard
          </RLink>
        </div>
      </div>

      <div v-else class="checkout-layout">
        <header class="checkout-header">
          <span class="eyebrow">CHECKOUT & PAYMENT</span>
          <h1 class="checkout-title">Complete Your Membership</h1>
          <p class="checkout-subtitle">Scan KHQR or choose your payment method to activate your subscription.</p>
        </header>

        <div class="checkout-grid">
          <!-- Order Summary Card -->
          <div class="checkout-card summary-card">
            <h3 class="card-title">
              <i class="ri-shopping-bag-line"></i> Order Summary
            </h3>

            <div class="plan-summary">
              <div class="plan-info">
                <span class="plan-badge">PENDING PAYMENT</span>
                <h4 class="plan-name">{{ planName }}</h4>
                <p class="plan-desc">Unlimited martial arts & fitness gym access</p>
              </div>
              <div class="plan-price">
                <span class="currency">$</span>
                <span class="amount">{{ planPrice }}</span>
                <span class="period">/mo</span>
              </div>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-rows">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>${{ planPrice }}.00</span>
              </div>
              <div class="summary-row">
                <span>Tax / Service Fee</span>
                <span>$0.00</span>
              </div>
              <div class="summary-row summary-row--total">
                <span>Total Due</span>
                <span class="total-amount">${{ planPrice }}.00 USD</span>
              </div>
            </div>
          </div>

          <!-- Payment Methods Card -->
          <div class="checkout-card payment-card">
            <h3 class="card-title">
              <i class="ri-bank-card-line"></i> Select Payment Method
            </h3>

            <div class="payment-tabs">
              <button
                :class="['payment-tab', { 'is-active': activeTab === 'khqr' }]"
                @click="activeTab = 'khqr'"
              >
                <i class="ri-qr-code-line"></i> KHQR / ABA
              </button>
              <button
                :class="['payment-tab', { 'is-active': activeTab === 'card' }]"
                @click="activeTab = 'card'"
              >
                <i class="ri-visa-line"></i> Credit Card
              </button>
              <button
                :class="['payment-tab', { 'is-active': activeTab === 'telegram' }]"
                @click="activeTab = 'telegram'"
              >
                <i class="ri-telegram-fill"></i> Manual / Bot
              </button>
            </div>

            <!-- KHQR View -->
            <div v-if="activeTab === 'khqr'" class="khqr-view">
              <div class="khqr-container">
                <div class="khqr-header">
                  <span class="khqr-logo">KHQR</span>
                  <span class="khqr-bank">ABA BANK / BAKONG</span>
                </div>
                <div class="khqr-body">
                  <div class="qr-box">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RMF_MEMBERSHIP_PAYMENT"
                      alt="KHQR Code"
                      class="qr-code"
                    />
                    <div class="qr-brand-overlay">RMF</div>
                  </div>
                  <p class="qr-instruction">
                    Scan with ABA Mobile, Sathapana, ACELEDA or any Bakong app
                  </p>
                </div>
              </div>
            </div>

            <!-- Card View -->
            <div v-else-if="activeTab === 'card'" class="card-view">
              <div class="form-group">
                <label>Card Number</label>
                <input type="text" placeholder="4532 •••• •••• 8892" value="4532 •••• •••• 8892" readonly />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Expiry</label>
                  <input type="text" placeholder="12/28" value="12/28" readonly />
                </div>
                <div class="form-group">
                  <label>CVV</label>
                  <input type="password" placeholder="•••" value="123" readonly />
                </div>
              </div>
            </div>

            <!-- Telegram View -->
            <div v-else class="telegram-view">
              <p class="tab-desc">
                Click below to simulate instant payment notification via Telegram userbot webhook.
              </p>
            </div>

            <div v-if="error" class="payment-error">
              <i class="ri-error-warning-line"></i> {{ error }}
            </div>

            <button
              class="btn btn--primary btn--full checkout-submit"
              :disabled="submitting"
              @click="handlePayNow"
            >
              <span v-if="submitting">Processing Payment...</span>
              <span v-else>Pay ${{ planPrice }}.00 & Activate Subscription</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const auth = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const paymentComplete = ref(false)
const error = ref<string | null>(null)
const activeTab = ref<'khqr' | 'card' | 'telegram'>('khqr')

const subscriptionId = computed(() => {
  const raw = route.query.subscriptionId
  return raw ? Number(raw) : null
})

const paymentId = computed(() => {
  const raw = route.query.paymentId
  return raw ? Number(raw) : null
})

const planName = computed(() => {
  const p = route.query.plan as string
  if (p === 'basic') return 'Basic Fighter Pass'
  if (p === 'elite') return 'Elite Master Warrior'
  return 'Pro Unlimited Fighter'
})

const planPrice = computed(() => {
  const p = route.query.plan as string
  if (p === 'basic') return '49'
  if (p === 'elite') return '199'
  return '99'
})

async function handlePayNow() {
  submitting.value = true
  error.value = null

  try {
    const idToUse = paymentId.value || 1
    const res: any = await auth.completePayment(idToUse, activeTab.value)
    if (res?.success || res?.SubscriptionStatus === 'active') {
      paymentComplete.value = true
    } else {
      error.value = res?.message || 'Failed to complete payment'
    }
  } catch (err: any) {
    error.value = err?.message || 'Payment simulation failed. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.container--narrow {
  max-width: 800px;
}

.checkout-header {
  text-align: center;
  margin-bottom: 2rem;
}

.checkout-title {
  font-size: 2rem;
  font-weight: 800;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

.checkout-subtitle {
  color: var(--c-muted, #9ca3af);
  font-size: 0.95rem;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.checkout-card {
  background: var(--c-surface, #18181c);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg, 16px);
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.checkout-card--success {
  text-align: center;
  padding: 3rem 2rem;
  max-width: 540px;
  margin: 0 auto;
}

.success-icon {
  font-size: 4rem;
  color: #22c55e;
  margin-bottom: 1rem;
}

.success-details {
  background: var(--c-bg, #101014);
  border-radius: var(--radius-md, 12px);
  padding: 1.25rem;
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.badge--success {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    color: var(--c-primary, #eab308);
  }
}

.plan-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.plan-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 800;
  color: #eab308;
  background: rgba(234, 179, 8, 0.15);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.4rem;
}

.plan-name {
  font-size: 1.1rem;
  font-weight: 700;
}

.plan-desc {
  font-size: 0.8rem;
  color: var(--c-muted);
  margin-top: 0.2rem;
}

.plan-price {
  display: flex;
  align-items: baseline;

  .currency {
    color: var(--c-primary, #eab308);
    font-weight: 700;
    font-size: 1rem;
  }
  .amount {
    font-size: 2rem;
    font-weight: 800;
  }
  .period {
    font-size: 0.8rem;
    color: var(--c-muted);
  }
}

.summary-divider {
  height: 1px;
  background: var(--c-border);
  margin: 1.25rem 0;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--c-muted);
}

.summary-row--total {
  font-weight: 800;
  color: var(--c-text);
  font-size: 1.05rem;
  margin-top: 0.5rem;

  .total-amount {
    color: var(--c-primary, #eab308);
  }
}

.payment-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

.payment-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem 0.4rem;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md, 8px);
  color: var(--c-muted);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.is-active {
    background: var(--c-primary-soft, rgba(234, 179, 8, 0.15));
    border-color: var(--c-primary, #eab308);
    color: var(--c-primary, #eab308);
  }
}

.khqr-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  color: #000;
  margin-bottom: 1.25rem;
}

.khqr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 800;
  font-size: 0.8rem;
}

.khqr-logo {
  color: #d97706;
}

.khqr-bank {
  color: #4b5563;
}

.qr-box {
  position: relative;
  display: inline-block;
  padding: 0.5rem;
  background: #fff;
}

.qr-code {
  width: 140px;
  height: 140px;
  display: block;
}

.qr-brand-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #eab308;
  color: #000;
  font-size: 0.65rem;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 4px;
}

.qr-instruction {
  font-size: 0.75rem;
  color: #4b5563;
  margin-top: 0.5rem;
}

.card-view {
  margin-bottom: 1.25rem;
}

.form-group {
  margin-bottom: 0.85rem;

  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--c-muted);
    margin-bottom: 0.3rem;
  }

  input {
    width: 100%;
    padding: 0.65rem 0.85rem;
    background: var(--c-bg);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-md, 8px);
    color: var(--c-text);
    font-size: 0.875rem;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.tab-desc {
  font-size: 0.85rem;
  color: var(--c-muted);
  margin-bottom: 1.25rem;
}

.payment-error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.checkout-submit {
  justify-content: center;
  width: 100%;
  padding: 0.85rem;
}
</style>
