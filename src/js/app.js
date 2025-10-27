/**
 * Cryptober - Mobile-First Progressive Web App
 * Combines all functionality: CoinGecko API, News Feed, Interactive Features
 * @version 2.0.0
 */

import { prefersReducedMotion } from '/utils/a11y.js';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  coingecko: {
    url: 'https://api.coingecko.com/api/v3/simple/price',
    params: 'ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
    refreshInterval: 30000, // 30 seconds
    cacheKey: 'cryptober_prices',
    cacheDuration: 60000, // 1 minute
  },
  news: {
    mockEnabled: true, // Use mock data (set false when API available)
    refreshInterval: 300000, // 5 minutes
  },
  ui: {
    toastDuration: 1800,
    animationDuration: 220,
  },
};

// ============================================
// STATE MANAGEMENT
// ============================================
let state = {
  prices: null,
  news: [],
  timers: new Map(),
  observers: new Map(),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Display toast notification
 */
export function toast(message, duration = CONFIG.ui.toastDuration) {
  let toastEl = document.getElementById('toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  
  const timer = setTimeout(() => {
    toastEl.classList.remove('visible');
  }, duration);
  
  if (state.timers.has('toast')) {
    clearTimeout(state.timers.get('toast'));
  }
  state.timers.set('toast', timer);
}

/**
 * Fetch with timeout and cache support
 */
async function fetchWithCache(url, options = {}) {
  const { cacheKey, cacheDuration, timeout = 10000 } = options;
  
  // Check cache
  if (cacheKey && cacheDuration) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < cacheDuration) {
          return data;
        }
      } catch (e) {
        console.warn('Cache parse error:', e);
      }
    }
  }
  
  // Fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Store in cache
    if (cacheKey && cacheDuration) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now(),
        }));
      } catch (e) {
        console.warn('Cache storage error:', e);
      }
    }
    
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Format price with currency symbol
 */
function formatPrice(price, currency = 'USD') {
  if (typeof price !== 'number' || isNaN(price)) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);
}

/**
 * Format percentage change
 */
function formatChange(change) {
  if (typeof change !== 'number' || isNaN(change)) return 'N/A';
  
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ============================================
// COINGECKO API
// ============================================

/**
 * Fetch live crypto prices from CoinGecko
 */
export async function fetchCryptoPrices() {
  const url = `${CONFIG.coingecko.url}?${CONFIG.coingecko.params}`;
  
  try {
    const data = await fetchWithCache(url, {
      cacheKey: CONFIG.coingecko.cacheKey,
      cacheDuration: CONFIG.coingecko.cacheDuration,
      timeout: 8000,
    });
    
    state.prices = data;
    updatePricesUI(data);
    return data;
  } catch (error) {
    console.error('CoinGecko fetch error:', error);
    displayPricesError(error.message);
    return null;
  }
}

/**
 * Update prices in UI
 */
function updatePricesUI(prices) {
  const container = document.getElementById('crypto-prices');
  if (!container) return;
  
  const coins = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' },
  ];
  
  const html = coins.map(coin => {
    const data = prices[coin.id];
    if (!data) return '';
    
    const price = formatPrice(data.usd);
    const change = data.usd_24h_change || 0;
    const changeFormatted = formatChange(change);
    const changeClass = change >= 0 ? 'text-neon-green' : 'text-danger';
    
    return `
      <article class="price-card card-glass">
        <div class="price-card__header">
          <h3 class="price-card__coin">${coin.symbol}</h3>
          <span class="price-card__name muted">${coin.name}</span>
        </div>
        <div class="price-card__body">
          <div class="price-card__price">${price}</div>
          <div class="price-card__change ${changeClass}" aria-label="${change >= 0 ? 'Increase' : 'Decrease'} of ${Math.abs(change).toFixed(2)} percent">
            ${changeFormatted}
          </div>
        </div>
      </article>
    `;
  }).join('');
  
  container.innerHTML = html;
  container.setAttribute('aria-live', 'polite');
  
  // Update last update timestamp
  const timestampEl = document.getElementById('prices-timestamp');
  if (timestampEl) {
    const now = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    timestampEl.textContent = `Updated: ${now}`;
  }
}

/**
 * Display error message for prices
 */
function displayPricesError(message) {
  const container = document.getElementById('crypto-prices');
  if (!container) return;
  
  container.innerHTML = `
    <div class="error-card card-glass">
      <p class="muted">⚠️ Unable to load live prices</p>
      <p class="tiny">${message}</p>
    </div>
  `;
}

/**
 * Start auto-refresh for prices
 */
function startPriceRefresh() {
  const timer = setInterval(() => {
    fetchCryptoPrices();
  }, CONFIG.coingecko.refreshInterval);
  
  state.timers.set('priceRefresh', timer);
}

// ============================================
// NEWS FEED
// ============================================

/**
 * Mock news data (replace with real API later)
 */
const MOCK_NEWS = [
  {
    id: 1,
    title: 'Bitcoin Hits New All-Time High in October Rally',
    summary: 'BTC surges past previous records as institutional adoption accelerates during Uptober momentum.',
    timestamp: Date.now() - 3600000, // 1 hour ago
    category: 'Bitcoin',
    url: '#',
  },
  {
    id: 2,
    title: 'Ethereum 2.0 Staking Reaches Historic Milestone',
    summary: 'ETH staking pools exceed expectations as network transitions fully to proof-of-stake.',
    timestamp: Date.now() - 7200000, // 2 hours ago
    category: 'Ethereum',
    url: '#',
  },
  {
    id: 3,
    title: 'Solana DeFi Ecosystem Expands with New Protocols',
    summary: 'SOL-based DeFi protocols see massive growth as developers flock to the fast, low-cost network.',
    timestamp: Date.now() - 14400000, // 4 hours ago
    category: 'Solana',
    url: '#',
  },
  {
    id: 4,
    title: 'Crypto October: Historical Analysis Shows 83% Green Rate',
    summary: 'Data from 2013-2024 confirms October as the most bullish month for crypto markets.',
    timestamp: Date.now() - 21600000, // 6 hours ago
    category: 'Market',
    url: '#',
  },
  {
    id: 5,
    title: 'Meme Coin Season Returns with Pumpkin-Themed Tokens',
    summary: 'Halloween-themed crypto tokens surge as community rallies around seasonal narratives.',
    timestamp: Date.now() - 43200000, // 12 hours ago
    category: 'Memes',
    url: '#',
  },
];

/**
 * Fetch news articles
 */
export async function fetchNews() {
  if (CONFIG.news.mockEnabled) {
    // Use mock data
    state.news = MOCK_NEWS;
    updateNewsUI(MOCK_NEWS);
    return MOCK_NEWS;
  }
  
  // TODO: Replace with real news API
  try {
    // const data = await fetchWithCache('https://api.example.com/crypto-news', {
    //   cacheKey: 'cryptober_news',
    //   cacheDuration: 300000,
    // });
    // state.news = data;
    // updateNewsUI(data);
    return [];
  } catch (error) {
    console.error('News fetch error:', error);
    return [];
  }
}

/**
 * Update news feed in UI
 */
function updateNewsUI(articles) {
  const container = document.getElementById('news-feed');
  if (!container) return;
  
  if (!articles || articles.length === 0) {
    container.innerHTML = '<p class="muted">No news available</p>';
    return;
  }
  
  const html = articles.map(article => `
    <article class="news-card card-glass">
      <div class="news-card__header">
        <span class="news-card__category chip">${article.category}</span>
        <time class="news-card__time muted" datetime="${new Date(article.timestamp).toISOString()}">
          ${formatRelativeTime(article.timestamp)}
        </time>
      </div>
      <h3 class="news-card__title">
        <a href="${article.url}" class="news-card__link" target="_blank" rel="noopener noreferrer">
          ${article.title}
        </a>
      </h3>
      <p class="news-card__summary muted">${article.summary}</p>
    </article>
  `).join('');
  
  container.innerHTML = html;
  container.setAttribute('aria-live', 'polite');
}

// ============================================
// CLIPBOARD / COPY FUNCTIONALITY
// ============================================

/**
 * Initialize copy-to-clipboard functionality
 */
export function initClipboard() {
  const elements = document.querySelectorAll('[data-copy]');
  
  elements.forEach(el => {
    const text = el.getAttribute('data-copy');
    if (!text) return;
    
    el.style.cursor = 'pointer';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Copy ${text.substring(0, 20)}...`);
    
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        toast('Copied! ✅');
        if (navigator.vibrate) navigator.vibrate(50);
      } catch (error) {
        console.error('Copy failed:', error);
        toast('Copy failed - please copy manually');
      }
    };
    
    el.addEventListener('click', handleCopy);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCopy();
      }
    });
  });
}

// ============================================
// SCROLL SPY & NAVIGATION
// ============================================

/**
 * Initialize scroll spy for navigation
 */
export function initScrollSpy() {
  const links = document.querySelectorAll('[data-target]');
  if (links.length === 0) return { destroy: () => {} };
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => {
            const href = link.getAttribute('href');
            const id = href ? href.substring(1) : '';
            if (id === entry.target.id) {
              link.setAttribute('aria-current', 'true');
              link.classList.add('is-active');
            } else {
              link.removeAttribute('aria-current');
              link.classList.remove('is-active');
            }
          });
        }
      });
    },
    { rootMargin: '-20% 0% -70% 0%', threshold: [0, 0.5, 1] }
  );
  
  links.forEach((link) => {
    const href = link.getAttribute('href');
    const id = href ? href.substring(1) : '';
    const target = document.getElementById(id);
    if (target) observer.observe(target);
  });
  
  state.observers.set('scrollSpy', observer);
  
  return {
    destroy: () => {
      observer.disconnect();
      state.observers.delete('scrollSpy');
    },
  };
}

// ============================================
// MOBILE NAVIGATION
// ============================================

/**
 * Initialize mobile navigation toggle
 */
export function initMobileNav() {
  const toggleBtn = document.querySelector('.site-header__toggle');
  const rail = document.querySelector('.left-rail');
  const overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  
  if (!toggleBtn || !rail) return { destroy: () => {} };
  
  document.body.appendChild(overlay);
  
  const open = () => {
    rail.classList.add('is-open');
    overlay.classList.add('is-visible');
    document.body.classList.add('offcanvas-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
  };
  
  const close = () => {
    rail.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    document.body.classList.remove('offcanvas-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
  };
  
  toggleBtn.addEventListener('click', () => {
    const isOpen = rail.classList.contains('is-open');
    isOpen ? close() : open();
  });
  
  overlay.addEventListener('click', close);
  
  // Close on navigation link click
  const navLinks = rail.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', close);
  });
  
  return {
    destroy: () => {
      overlay.remove();
    },
  };
}

// ============================================
// FOOTER YEAR
// ============================================

/**
 * Set current year in footer
 */
export function setFooterYear() {
  const el = document.getElementById('year');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}

// ============================================
// LAZY LOADING
// ============================================

/**
 * Initialize lazy loading for images
 */
export function initLazyLoading() {
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  } else {
    // Fallback: IntersectionObserver
    const images = document.querySelectorAll('img[data-src]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px',
    });
    
    images.forEach(img => observer.observe(img));
    state.observers.set('lazyLoad', observer);
  }
}

// ============================================
// INITIALIZATION & CLEANUP
// ============================================

/**
 * Initialize all app features
 */
export function init() {
  console.log('🚀 Cryptober App Initialized');
  
  // Core features
  setFooterYear();
  initClipboard();
  initScrollSpy();
  initMobileNav();
  initLazyLoading();
  
  // Data fetching
  fetchCryptoPrices();
  fetchNews();
  
  // Start auto-refresh
  startPriceRefresh();
  
  // Reduced motion handling
  if (prefersReducedMotion()) {
    document.body.classList.add('reduced-motion');
  }
}

/**
 * Cleanup function for proper resource disposal
 */
export function destroy() {
  // Clear all timers
  state.timers.forEach(timer => clearTimeout(timer));
  state.timers.clear();
  
  // Disconnect all observers
  state.observers.forEach(observer => observer.disconnect());
  state.observers.clear();
  
  // Clear state
  state = {
    prices: null,
    news: [],
    timers: new Map(),
    observers: new Map(),
  };
  
  console.log('🧹 Cryptober App Cleaned Up');
}

// ============================================
// AUTO-INIT
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', destroy);

// Export for manual control if needed
export default {
  init,
  destroy,
  fetchCryptoPrices,
  fetchNews,
  toast,
};
