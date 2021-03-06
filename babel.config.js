module.exports = function(api) {
  api.cache(true)

  return {
    sourceType: 'unambiguous',
    presets: ['cozy-app'],
    plugins: ['babel-plugin-lodash', 'babel-plugin-date-fns'],
    env: {
      // Used to run a service directly, see yarn run service:budgetAlerts
      cli: {
        include: [/src/, /cozy-ui/],
        exclude: [],
        ignore: [/node_modules\/(?!cozy)/],
        plugins: [
          [
            'babel-plugin-module-resolver',
            {
              root: ['./src'],
              alias: {
                ducks: './src/ducks',
                'cozy-ui/react': 'cozy-ui/transpiled/react'
              }
            }
          ],
          [
            'babel-plugin-inline-import',
            {
              extensions: ['.hbs', '.css', '.styl']
            }
          ]
        ]
      }
    }
  }
}
