/**
 * SVGO Configuration for SVG Optimization
 * Optimizes SVG assets for mascot, roadmap, and socials
 */
export default {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIDs: {
            minify: true,
            preserve: ['logo', 'icon'],
          },
        },
      },
    },
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupAttrs',
    'mergeStyles',
    'inlineStyles',
    'minifyStyles',
    'convertStyleToAttrs',
    'cleanupNumericValues',
    'convertColors',
    'removeUselessDefs',
    'cleanupListOfValues',
    'convertTransform',
    'removeEmptyAttrs',
    'removeEmptyContainers',
    'mergePaths',
    'removeUnusedNS',
    'sortAttrs',
    'removeDesc',
    'removeTitle',
  ],
};
