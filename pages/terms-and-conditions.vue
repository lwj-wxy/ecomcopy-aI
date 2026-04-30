<script setup lang="ts">
const lastUpdated = 'April 30, 2026';
</script>

<template>
  <main class="min-h-screen bg-white text-gray-900">
    <section class="mx-auto max-w-3xl px-6 py-16">
      <NuxtLink to="/" class="text-sm font-medium text-primary hover:underline">Back to ListingCraft AI</NuxtLink>
      <h1 class="mt-8 text-4xl font-bold tracking-tight">Terms and Conditions</h1>
      <p class="mt-3 text-sm text-gray-500">Last updated: {{ lastUpdated }}</p>

      <div class="mt-10 space-y-8 text-sm leading-7 text-gray-700">
        <section>
          <h2 class="text-xl font-bold text-gray-900">1. Service</h2>
          <p class="mt-3">
            ListingCraft AI is a software-as-a-service product that helps e-commerce sellers generate
            and optimize product listing copy, keywords, competitor analysis, and market insights using
            artificial intelligence. The service is delivered digitally through our web application.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">2. Accounts and Access</h2>
          <p class="mt-3">
            You are responsible for keeping your account credentials secure and for all activity under
            your account. You must provide accurate account and billing information when subscribing.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">3. Subscriptions and Billing</h2>
          <p class="mt-3">
            Paid plans are billed as subscriptions through Paddle, our merchant of record. Paddle may
            process payments, taxes, invoices, and payment-related customer support. Subscription prices,
            billing intervals, and usage limits are shown on our pricing page before checkout.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">4. Acceptable Use</h2>
          <p class="mt-3">
            You may not use ListingCraft AI to create unlawful, misleading, infringing, harmful, or
            abusive content. You are responsible for reviewing AI-generated output before publishing it
            to any marketplace or sales channel.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">5. AI Output</h2>
          <p class="mt-3">
            AI-generated content may be inaccurate or unsuitable for some products, markets, or legal
            requirements. We do not guarantee increased sales, search ranking, marketplace approval, or
            business results from using the service.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">6. Changes and Availability</h2>
          <p class="mt-3">
            We may update, improve, suspend, or discontinue parts of the service when needed. We aim to
            provide reliable access, but we do not guarantee uninterrupted availability.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900">7. Contact</h2>
          <p class="mt-3">
            For questions about these terms, contact us at
            <a href="mailto:support@toolorbit.site" class="text-primary hover:underline">support@toolorbit.site</a>.
          </p>
        </section>
      </div>
    </section>
  </main>
</template>
