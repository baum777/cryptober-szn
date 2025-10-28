/**
 * PostCSS Configuration
 *
 * Minifies CSS using cssnano while preserving:
 * - CSS custom properties (design tokens)
 * - calc() expressions
 * - Animation keyframes
 */

export default {
  plugins: {
    cssnano: {
      preset: [
        'default',
        {
          // Preserve calc() for responsive values
          calc: false,

          // Preserve CSS custom properties (design tokens)
          reduceIdents: false,

          // Normalize whitespace but preserve readability
          normalizeWhitespace: true,

          // Discard comments
          discardComments: {
            removeAll: true
          },

          // Merge rules where safe
          mergeRules: true,

          // Minify selectors
          minifySelectors: true,

          // Minify font values
          minifyFontValues: true,

          // Convert colors to shortest form
          colormin: true,

          // Normalize URLs
          normalizeUrl: true,

          // Discard duplicates
          discardDuplicates: true,

          // Discard empty rules
          discardEmpty: true,

          // Optimize z-index values (disabled to prevent conflicts)
          zindex: false,

          // Sort media queries
          sortMediaQueries: true
        }
      ]
    }
  }
};
