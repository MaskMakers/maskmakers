const path = require('path')
const StyleLintPlugin = require('stylelint-webpack-plugin')

// @TODO doesnt work in Zeit?
// const ZeitRoutes = require(path.resolve(__dirname, 'now.json'))

// // pull routes from zeit-routes.js
// // creates a single source of truth for prerendering and Zeit
// let renderRoutes = []
// ZeitRoutes.routes.forEach((route) => {
//   renderRoutes.push(route.src)
// })

module.exports = {
  runtimeCompiler: true,

  chainWebpack: config => {
    config.resolve.symlinks(false)

    config.module
      .rule('eslint')
      .use('eslint-loader')
      .options({
        fix: true
      })
  },

  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/scss/shared/_variables.scss";
          @import "@/scss/shared/_mixins.scss";
        `,
        sassOptions: {
          scoped: false
        }
      }
    }
  },

  configureWebpack: {
    plugins: [
      new StyleLintPlugin({
        configFile: './.stylelintrc',
        files: ['**/*.{vue,html,css,scss}'],
        fix: true
      })
    ]
  },

  pluginOptions: {
    prerenderSpa: {
      registry: undefined,
      // @TODO Fix somehow?
      // renderRoutes,
      renderRoutes: [
        '/',
        '/send-a-mask',
        '/make-a-mask',
        '/mask/accordion-mask-1',
        '/mask/accordion-mask-2',
        '/mask/fitted-mask-1',
        '/mask/fitted-mask-2'
      ],
      useRenderEvent: true,
      headless: true,
      onlyProduction: true,
      postProcess: route => {
        // Remove /index.html from the output path if the dir name ends with a .html file extension.
        // For example: /dist/dir/special.html/index.html -> /dist/dir/special.html
        if (route.route.endsWith('.html')) {
          route.outputPath = path.join(__dirname, 'dist', route.route)
        }

        // Defer scripts and tell Vue it's been server rendered to trigger hydration
        route.html = route.html
          .replace(/<script (.*?)>/g, '<script $1 defer>')
          .replace('id="app"', 'id="app" data-server-rendered="true"')
        return route
      }
    }
  }
}
