const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'production',
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            drop_debugger: true,
            pure_funcs: ['console.info', 'console.debug', 'console.warn']
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
    
    // Code splitting for better caching
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor code
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        // Common code used by multiple components
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
        // Tailwind CSS and styles
        styles: {
          test: /\\.css$/,
          name: 'styles',
          priority: 20,
        },
      },
    },
    
    // Runtime chunk for better long-term caching
    runtimeChunk: 'single',
  },
  
  // Performance hints
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000, // 500KB
    maxAssetSize: 512000,
  },
  
  plugins: [
    // Gzip compression
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\\.(js|css|html|svg)$/,
      threshold: 10240, // Only compress files > 10KB
      minRatio: 0.8,
    }),
    
    // Bundle analyzer (set ANALYZE=true to generate report)
    ...(process.env.ANALYZE === 'true'
      ? [new BundleAnalyzerPlugin({ analyzerMode: 'static' })]
      : []),
  ],
  
  module: {
    rules: [
      {
        test: /\\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { modules: false }], // Enable tree shaking
              '@babel/preset-react',
            ],
            plugins: [
              'babel-plugin-transform-react-remove-prop-types', // Remove PropTypes in production
            ],
          },
        },
      },
    ],
  },
};

/* 
 * Build Optimization Checklist:
 * 
 * 1. Code Splitting: Vendors, common code, and styles are split into separate chunks
 * 2. Tree Shaking: Enabled via ES modules in Babel config
 * 3. Minification: TerserPlugin removes dead code, console.logs, and minifies JS
 * 4. Compression: Gzip compression for all assets
 * 5. Lazy Loading: Use React.lazy() and Suspense in components
 * 6. Image Optimization: Use responsive images and lazy loading
 * 7. Bundle Analysis: Run with ANALYZE=true to identify large dependencies
 */
