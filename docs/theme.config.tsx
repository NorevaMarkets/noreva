import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: (
    <span style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px',
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      fontWeight: 700, 
      fontSize: '1.125rem'
    }}>
      <img 
        src="/logo.png" 
        alt="Noreva" 
        width={32} 
        height={32} 
        style={{ borderRadius: '6px' }}
      />
      <span style={{ 
        background: 'linear-gradient(to right, #f0f0f0, #9ca3af)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Noreva
      </span>
    </span>
  ),
  logoLink: 'https://noreva.markets',
  project: {
    link: 'https://github.com/NorevaMarkets/noreva',
  },
  chat: {
    link: 'https://noreva.markets',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
  },
  docsRepositoryBase: 'https://github.com/NorevaMarkets/noreva/tree/main/docs',
  footer: {
    text: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <a href="https://noreva.markets" target="_blank" rel="noopener noreferrer" style={{ color: '#c4a84b', textDecoration: 'none' }}>
          Start Trading on noreva.markets
        </a>
        <span>© 2025 Noreva. All rights reserved.</span>
      </div>
    ),
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Noreva Documentation" />
      <meta property="og:description" content="Learn how to trade tokenized stocks on Solana with Noreva" />
      <link rel="icon" type="image/png" href="/favicon.png" />
    </>
  ),
  primaryHue: 42,
  primarySaturation: 70,
  darkMode: false,
  sidebar: {
    toggleButton: false,
    defaultMenuCollapseLevel: 2,
  },
  toc: {
    float: true,
  },
  editLink: {
    text: '',
  },
  feedback: {
    content: null,
  },
  navigation: {
    prev: true,
    next: true,
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Noreva Docs'
    }
  },
}

export default config
