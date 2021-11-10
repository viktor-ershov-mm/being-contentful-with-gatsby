require('dotenv').config({
  path: '.env.development',
})

const chalk = require('chalk')
const fs = require('fs')
const moment = require('moment')
const path = require('path')
const prettier = require('prettier')
const readline = require('readline')

const template = `
    module.exports = function runMigration(migration) {
      console.log(migration);
    };
  `

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.on('close', () => {
  console.log('\nBYE BYE !!!')
  process.exit(0)
})

console.log(
  chalk.yellow(
    '\nThis script generates a blank migration file, e.g. 2020-08-20-description.js'
  )
)

rl.question(
  'What is a good description of this migration? (No date please!) \n',
  (description) => {
    const desc = description.replace(/\s+/g, '-')

    fs.writeFileSync(
      path.resolve(`migration/${moment().format('YYYY-MM-DD')}-${desc}.js`),
      prettier.format(template, { parser: 'babel' }),
      (err) => {
        if (err) {
          console.log(chalk.red(`\nError: ${err}`))
          process.exit(1)
        }
      }
    )

    console.log(chalk.green('\nMigration file created successfully!\n'))
    process.exit(0)
  }
)
