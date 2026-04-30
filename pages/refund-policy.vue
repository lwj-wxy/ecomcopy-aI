<script setup lang="ts">
const lastUpdated = 'April 30, 2026';
</script>

<template>
  <main class="min-h-screen bg-white text-gray-900">
    <section class="mx-auto max-w-3xl px-6 py-16">
      <NuxtLink to="/" class="text-sm font-medium text-primary hover:underline">Back to ListingCraft AI</NuxtLink>
      <h1 class="mt-8 text-4xl font-bold tracking-tight">Refund Policy</h1>
      <p class="mt-3 text-sm text-gray-500">Last updated: {{ lastUpdated }}</p>

      <div class="mt-10 space-y-8 text-sm leading-7 text-gray-700">
        <section>
          <h2 class="text-xl font-bold text-gray-900">1. Digital Subscription Service</h2>
          <p class="mt-3">
            ListingCraft AI is a digital SaaS subscription. Access is delivered immediately after a
            successful payment, and usage credits may be consumed when you generate AI content.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">2. Refund Eligibility</h2>
          <p class="mt-3">
            You may request a refund within 7 days of your initial purchase if you are unable to access
            the service or if the service materially does not work as described. Refunds may be declined
            where a substantial portion of usage credits has already been consumed, where abuse is
            detected, or where the request relates to a renewal after the service was used.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">3. Subscription Cancellations</h2>
          <p class="mt-3">
            You may cancel your subscription to prevent future renewals. Cancellation does not
            automatically refund previous charges. Access may continue until the end of the paid billing
            period unless otherwise required by law or handled by Paddle.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">4. How to Request a Refund</h2>
          <p class="mt-3">
            To request a refund, contact us at
            <a href="mailto:support@toolorbit.site" class="text-primary hover:underline">support@toolorbit.site</a>
            with your account email, transaction details, and a short explanation of the issue. Payments
            are processed by Paddle, so approved refunds may be issued through Paddle.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">5. Processing Time</h2>
          <p class="mt-3">
            Approved refunds are usually processed within 5 to 10 business days, depending on Paddle,
            the payment method, and your bank or card issuer.
          </p>
        </section>
      </div>
    </section>
  </main>
</template>
