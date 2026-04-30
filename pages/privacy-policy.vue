<script setup lang="ts">
const lastUpdated = 'April 30, 2026';
</script>

<template>
  <main class="min-h-screen bg-white text-gray-900">
    <section class="mx-auto max-w-3xl px-6 py-16">
      <NuxtLink to="/" class="text-sm font-medium text-primary hover:underline">Back to ListingCraft AI</NuxtLink>
      <h1 class="mt-8 text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p class="mt-3 text-sm text-gray-500">Last updated: {{ lastUpdated }}</p>

      <div class="mt-10 space-y-8 text-sm leading-7 text-gray-700">
        <section>
          <h2 class="text-xl font-bold text-gray-900">1. Information We Collect</h2>
          <p class="mt-3">
            We collect information needed to provide ListingCraft AI, including account details such as
            your email address, authentication information, product inputs you submit, generated content,
            usage history, plan status, and billing-related identifiers returned by Paddle.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">2. How We Use Information</h2>
          <p class="mt-3">
            We use your information to operate the service, generate AI content, manage usage credits,
            provide customer support, improve product quality, secure our systems, and maintain billing
            and subscription records.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">3. Payments</h2>
          <p class="mt-3">
            Payments are processed by Paddle. We do not store full card numbers or payment credentials.
            Paddle may collect and process payment, tax, invoice, and fraud-prevention information under
            its own privacy and compliance policies.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">4. AI Providers and Service Providers</h2>
          <p class="mt-3">
            We may use third-party infrastructure, authentication, database, analytics, and AI providers
            to deliver the service. Product prompts and related inputs may be processed by AI providers
            to generate requested outputs.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">5. Data Retention</h2>
          <p class="mt-3">
            We retain information for as long as needed to provide the service, comply with legal
            obligations, resolve disputes, and maintain business records. You may contact us to request
            deletion of eligible account data.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">6. Your Choices</h2>
          <p class="mt-3">
            You may update your account information, stop using the service, cancel your subscription,
            or contact us about privacy requests at any time.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">7. Contact</h2>
          <p class="mt-3">
            For privacy questions, contact us at
            <a href="mailto:support@toolorbit.site" class="text-primary hover:underline">support@toolorbit.site</a>.
          </p>
        </section>
      </div>
    </section>
  </main>
</template>
