/**
 * Sparkfined Tool - JavaScript Module
 * Handles calculator, NFT counter, scroll animations, and interactions
 */

(function() {
  'use strict';

  // Set current year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Token Lock Calculator
  function calculateTokenLock() {
    const rank = parseInt(document.getElementById('rank-input')?.value) || 1;
    const mcap = parseInt(document.getElementById('mcap-input')?.value) || 0;
    
    let phase, amount, vesting;
    
    if (rank <= 10) {
      phase = 1;
      amount = 10000000 - (rank - 1) * 450000;
      vesting = "100% over 73 days";
    } else if (rank <= 1000) {
      phase = 2;
      amount = Math.round(2060000 - (rank - 11) * 1800);
      vesting = "65% @ 30d, 35% forever";
    } else if (mcap >= 500000) {
      phase = 3;
      amount = 325000;
      vesting = "Keep or Close";
    } else {
      phase = 0;
      amount = 0;
      vesting = "Phase 3 not available (MCAP < $500k)";
    }
    
    const phaseResult = document.getElementById('phase-result');
    const amountResult = document.getElementById('amount-result');
    const vestingResult = document.getElementById('vesting-result');
    
    if (phaseResult) phaseResult.textContent = phase > 0 ? `Phase ${phase}` : 'Not Available';
    if (amountResult) amountResult.textContent = phase > 0 ? `${amount.toLocaleString()} $SPARK` : 'N/A';
    if (vestingResult) vestingResult.textContent = vesting;
  }

  // Auto-calculate on input change
  const rankInput = document.getElementById('rank-input');
  const mcapInput = document.getElementById('mcap-input');
  
  if (rankInput) {
    rankInput.addEventListener('input', calculateTokenLock);
    rankInput.addEventListener('change', calculateTokenLock);
  }
  
  if (mcapInput) {
    mcapInput.addEventListener('input', calculateTokenLock);
    mcapInput.addEventListener('change', calculateTokenLock);
  }
  
  // Initial calculation
  calculateTokenLock();

  // Scroll animation observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  // Observe all sections except hero
  document.querySelectorAll('section:not(.hero-section)').forEach(section => {
    observer.observe(section);
  });

  // Live update NFT counter (simulated)
  let nftUpdateInterval;
  
  function startNFTCounter() {
    nftUpdateInterval = setInterval(() => {
      const counterValue = document.querySelector('.counter-value');
      if (counterValue) {
        const currentText = counterValue.textContent;
        const currentCount = parseInt(currentText.split('/')[0]);
        
        // 5% chance to increment (simulated minting)
        if (Math.random() > 0.95 && currentCount < 333) {
          const newCount = currentCount + 1;
          const percentage = Math.round((newCount / 333) * 100);
          
          counterValue.textContent = `${newCount} / 333`;
          
          const counterFill = document.querySelector('.nft-counter .counter-fill');
          if (counterFill) {
            counterFill.style.width = `${percentage}%`;
          }
        }
      }
    }, 10000); // Check every 10 seconds
  }

  // Start NFT counter when NFT section is visible
  const nftSection = document.querySelector('.nft-section');
  if (nftSection) {
    const nftObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !nftUpdateInterval) {
          startNFTCounter();
        }
      });
    }, { threshold: 0.5 });
    
    nftObserver.observe(nftSection);
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (nftUpdateInterval) {
      clearInterval(nftUpdateInterval);
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // Allow default behavior for empty hash
      if (href === '#' || href === '#!') {
        return;
      }
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL without jumping
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    });
  });

  // Keyboard navigation enhancement
  document.querySelectorAll('button, a, input').forEach(element => {
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (element.tagName === 'A' || element.tagName === 'BUTTON') {
          // Let default behavior handle it
        }
      }
    });
  });

})();
