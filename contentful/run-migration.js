/* eslint no-console: 0 */
require('dotenv').config({
  path: '.env.development',
})

const chalk = require('chalk')
const { execSync } = require('child_process')
const Contentful = require('contentful-management')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const readline = require('readline')

const modelDir = path.resolve('model')

const client = Contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  host: 'api.contentful.com',
})

function createEnvironment(environment) {
  console.log(`Creating environment "${environment}"...\n`)

  execSync(`
      contentful space environment create \
      --await-processing true \
      --environment-id ${environment} \
      --name ${environment} \
      --source master \
      --space-id ${process.env.CONTENTFUL_SPACE_ID}
    `)
}

function deleteEnvironment(environment) {
  console.log(`Deleting environment "${environment}"...\n`)

  if (environment === 'master' || environment.startsWith('main-')) {
    console.error(
      chalk.red('No. Precious environments must be deleted manually.')
    )
    process.exit(0)
  }

  execSync(`
      contentful space environment delete \
      --environment-id ${environment} \
      --space-id ${process.env.CONTENTFUL_SPACE_ID}
    `)
}

function exportModel(environment) {
  console.log(`Exporting model for "${environment}"...`)

  execSync(`
      contentful space export \
      --content-file ${modelDir}/model-smm-${environment}.json \
      --environment-id ${environment} \
      --skip-content \
      --space-id ${process.env.CONTENTFUL_SPACE_ID}
    `)
}

function performMigration(environment, migrationPath) {
  console.log(`Running migration file: "${migrationPath}"...`)
  console.log(environment)
  console.log(process.env.CONTENTFUL_MANAGEMENT_TOKEN)
  console.log(process.env.CONTENTFUL_SPACE_ID)

  execSync(
    `
      contentful space migration \
      --environment-id ${environment} \
      --management-token ${process.env.CONTENTFUL_MANAGEMENT_TOKEN} \
      --space-id ${process.env.CONTENTFUL_SPACE_ID} \
      --yes \
      ${migrationPath}
    `,
    { stdio: 'inherit' }
  )

  console.log(`Migration file: "${migrationPath}" completed.`)
}

function loopThroughTargets(environment, targets) {
  if (targets.length > 0) {
    targets.forEach((targetPath) => {
      const targetFilePath = path.resolve(`${targetPath}`)

      // Make sure the specified migration file exists
      const targetExists = fs.existsSync(targetFilePath)

      if (targetExists) {
        // Check if this is a directory
        const targetIsDirectory = fs.lstatSync(targetFilePath).isDirectory()
        if (targetIsDirectory) {
          fs.readdirSync(targetFilePath).forEach((file) => {
            performMigration(environment, `${targetFilePath}/${file}`)
          })
        } else {
          // This must be an actual file and not a directory
          performMigration(environment, targetFilePath)
        }

        console.log('Migration complete!\n')

        // Let's export an updated model
        // exportModel(environment)

        // Let's check if we're supposed to switch the master alias?
        // if (argv['switch-alias']) updateAlias(environment);
      } else {
        console.error(
          chalk.yellow(
            `Warning: Migration file "${targetFilePath}" does not exist!`
          )
        )
        console.log(chalk.yellow('Skipping...'))
      }
    })
  }

  process.exit(0)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.on('close', () => {
  console.log('\nBYE BYE !!!')
  process.exit(0)
})

const selectEnvironment = async () => {
  const environments = []
  const environmentList = await client
    .getSpace(process.env.CONTENTFUL_SPACE_ID)
    .then((space) => space.getEnvironments())

  environmentList.items.forEach((item) => {
    if (item.sys.id !== 'master') environments.push(item.name)
  })

  console.log(
    'Which Contentful Environment should the migration(s) be run against?\n'
  )
  console.log(' Contentful Environment')
  environments.forEach((env, index) => {
    console.log(` ${index + 1}) ${env}`)
  })

  // Let's tell our friends if they can create a new environment
  if (environments.length < 6) {
    console.log(
      chalk.red.bold(
        ` ${environments.length + 1}) [Enter new environment name]`
      )
    )
  }

  rl.question('\nEnvironment name: ', (envInput) => {
    const environment = envInput.trim()
    if (
      environment === null ||
      environment === undefined ||
      environment === ''
    ) {
      console.error(chalk.red('Error: Environment cannot be null!'))
      process.exit(1)
    }

    // We don't want to allow running against master
    // But if you need to, specify the environment by it's name
    if (environment === 'master') {
      console.error(
        chalk.red(
          'Error: Cannot run migrations against the master alias. If that is what you intended to do, please specify the environment by name.\n'
        )
      )
      process.exit(1)
    }

    if (!environments.includes(environment) && environments.length < 6) {
      rl.question(
        `Environment "${environment}" does not exist. Would you like to create it? y/n? `,
        (createEnv) => {
          // Let's check our answer
          switch (createEnv.toLowerCase()) {
            case 'n':
            case 'no':
              // Exit here
              process.exit(0)
              break
            case 'y':
            case 'yes':
              createEnvironment(environment)
              loopThroughTargets(environment, argv._)
              break
            default:
              console.error(
                chalk.red(
                  "Error: Could not decipher either 'y' or 'n'. Please try again."
                )
              )
              process.exit(1)
          }
        }
      )
    } else if (
      !environments.includes(environment) &&
      environments.length === 6
    ) {
      console.log(
        chalk.red(
          'Error: Cannot create a new Contentful environment because maximum number of environments has been reached. You must delete an environment first.'
        )
      )
      process.exit(1)
    } else {
      loopThroughTargets(environment, argv._)
    }
  })
}

const overwriteEnvironment = async (environment) => {
  const environmentList = await client
    .getSpace(process.env.CONTENTFUL_SPACE_ID)
    .then((space) => space.getEnvironments())

  // Check whether specific environment exists
  const targetEnvironment = environmentList.items.find(
    (item) => item.sys.id === environment
  )
  if (targetEnvironment) {
    rl.question(
      `Environment "${environment}" already exists. Is it okay to overwrite? y/n? `,
      (input) => {
        // Let's check our answer
        switch (input.toLowerCase()) {
          case 'n':
          case 'no':
            // Exit here
            process.exit(0)
            break
          case 'y':
          case 'yes':
            deleteEnvironment(environment)
            createEnvironment(environment)
            loopThroughTargets(environment, argv._)
            break
          default:
            console.error(
              chalk.red(
                "Error: Could not decipher either 'y' or 'n'. Please try again."
              )
            )
            process.exit(1)
        }
      }
    )
  } else {
    createEnvironment(environment)
    loopThroughTargets(environment, argv._)
  }
}

try {
  if (argv.help) {
    console.log(`
      run-migration.js
      This script is used to run Contentful migrations. At least one argument,
      (the location of a migration file or a directory of migration files), is
      required. The script will ask which environment you'd like to run the
      migration(s) against. If less than six Contentful environments exist, you
      will have the ability to clone a new environment from the master alias
      and run your migration(s) against that new environment.
      Additionally, the following options are available:
      --environment       The Contentful environment you'd like to run the migration against.
      `)

    process.exit(0)
  }

  // Check how many migration files are specified
  if (argv._.length < 1) {
    console.error(chalk.red('Error: No migration files specified.'))
    process.exit(0)
  }

  if (argv.environment) {
    overwriteEnvironment(argv.environment)
  } else {
    selectEnvironment()
  }
} catch (err) {
  rl.close()
  console.error(err)
  process.exit(1)
}
