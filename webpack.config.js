import path from 'path'
import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import fs from 'fs'
import util from 'util'
import childProcess from 'child_process'
import packageJson from './package.json'
import {red} from 'chalk'

const fsp = fs.promises
const exec = util.promisify(childProcess.exec)
const nodeVersion = packageJson.engines.node
const babelNodeVersion = packageJson.babel.presets[0][1].targets.node
const nvmrcNodeVersion = fs.readFileSync('./.nvmrc', 'utf-8').trim()
const activeNodeVersion = process.version.slice(1)
const nodeBinPath = path.join(process.cwd(), 'tmp', `node-v${nodeVersion}-linux-x64`, 'bin', 'dnode')

if ([nodeVersion, babelNodeVersion, nvmrcNodeVersion, activeNodeVersion].some(f => f !== nodeVersion)) {
  console.log('ERROR: Node version mismatch.  All node version must allign' |> red)
  console.log("check files .nvmrc and package.json's engines.node and babel...node" |> red)
  console.log(`\npackage.json: ${nodeVersion}`)
  console.log(`package.json (babel): ${babelNodeVersion}`)
  console.log(`.nvmrc: ${nvmrcNodeVersion}`)
  console.log(`active: ${activeNodeVersion}`)
  process.exit(1)
}

const entry = Object.fromEntries(fs.readdirSync('./scripts/')
  .filter(f => f.endsWith('.js'))
  .map(f => [path.basename(f, '.js'), `./scripts/${f}`]))

const makeExecutablePlugin = {
  apply: compiler => {
    compiler.hooks.afterEmit.tap('AfterEmitPlugin', async compilation => {
      for (const fileName of Object.keys(entry)) {
        const target = `./bin/${fileName}`
        const targetJs = `${target}.js`
        await fsp.rename(targetJs, target)
        await fsp.chmod(target, 0o775)
      }
    })
  }
}

module.exports = {
  entry,
  target: 'node',
  output: {
    path: path.join(path.join(process.cwd(), 'bin')),
    filename: '[name].js'
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 8,
          toplevel: true,
          compress: {
            dead_code: true
          },
          verbose: true,
          output: {
            ecma: 8,
            comments: false,
          }
        }
      })
    ]
  },
  externals: {
    'aws-sdk': 'commonjs aws-sdk',
    'bufferutil': 'commonjs bufferutil',
    'utf-8-validate': 'commonjs utf-8-validate'
  },
  mode: 'production',
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: /(node_modules)/,
      use: {loader: 'babel-loader'}
    },
    {
      test: /\.js$/,
      use: ['remove-hashbag-loader']
    }]
  },
  resolveLoader: {
    alias: {
      'remove-hashbag-loader': path.join(__dirname, './remove-hashbag-loader')
    }
  },
  plugins: [
    new webpack.BannerPlugin({banner: `#!/usr/bin/env ${nodeBinPath}`, raw: true}),
    makeExecutablePlugin
  ],
  devtool: 'node'
}
