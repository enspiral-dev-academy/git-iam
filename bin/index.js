#! /usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const shell = require('shelljs')
const request = require('superagent')
const { Octokit } = require('@octokit/rest')

const alias = process.argv[2].toLowerCase()
const inputPath = process.argv[3]

if (!alias) {
  showUsage()
} else if (alias === '--init') {
  setupExtension(inputPath)
} else if (alias === '--build') {
  createUsersJson(inputPath)
} else {
  configureUser(alias)
}

function showUsage () {
  console.info(`Usage:
  git-iam --init url
    Sets up the extension. The url should be the address of a JSON file.
  git iam user
    Sets the name and email config of the user based on the JSON file.`)
}

function setupExtension (url) {
  if (!url) return showUsage()
  shell.exec('git config --global users.url ' + url)
  shell.exec('git config --global alias.iam !git-iam')
  console.info('URL saved - initialization complete')
}

async function configureUser (alias) {
  const url = getUrl()
  const name = alias.replace(/\b\w/g, l => l.toUpperCase()) // capitalise
  const users = await getUserListing(url)
  const user = users && users[alias]
  if (!user) {
    const errMsg = `Error: user "${alias}" is not defined in ${url}`
    return console.error(errMsg)
  }
  shell.exec('git config --global --unset-all user.name')
  shell.exec('git config --global --unset-all user.email')
  shell.exec(`git config --replace-all user.name "${user.name}"`)
  shell.exec(`git config --replace-all user.email "${user.email}"`)
  console.info(`Hiya ${name}, the future commits in this repo will be yours.`)
}

function getUrl () {
  return shell.exec('git config --list', {silent: true})
    .stdout.split('\n')
    .find(i => i.includes('users.url'))
    .split('=')[1]
}

async function getUserListing (url) {
  try {
    const listing = await request.get(url)
    return JSON.parse(listing.text)
  } catch (ex) {
    return console.error(ex)
  }
}

async function createUsersJson (inputPath) {
  const developers = await getDevData(inputPath)
  const userData = await getUserData(developers)

  try {
    const formattedUserData = userData.map((result, idx) => {
      const { id, login, name } = result.data
      return {
        name: name || login,
        email: id + '+' + login + '@users.noreply.github.com',
        alias: Object.keys(developers)[idx]
      }
    })
      .sort((user1, user2) => {
        if (user1.alias < user2.alias) {
          return -1
        }
        if (user1.alias > user2.alias) {
          return 1
        }
        return 0
      })
      .reduce((userObj, user) => {
        const { alias, name, email } = user
        userObj[alias] = { name, email }
        return userObj
      }, {})

    const userJSON = JSON.stringify(formattedUserData, null, 2)
    console.info(`\nSuccess! Here's your git iam JSON object. Save it to a Gist!`)
    console.info(userJSON)
  } catch (err) {
    console.error('An error occurred while trying to create your users JSON object:')
    console.error(err)
    showUsage()
  }
}

async function getDevData (devsPath) {
  try {
    const devData = await fs.readFile(path.resolve(devsPath))
    return JSON.parse(devData)
  } catch (err) {
    console.error('An error occurred while trying to read your input JSON file:')
    console.error(err)
    showUsage()
    process.exit(1)
  }
}

async function getUserData (developers) {
  const authToken = process.env.GH_AUTH

  if (!authToken) {
    console.error('Could not find your GitHub Personal Access Token in GH_AUTH')
    console.info('You can proceed after you complete that step.')
    process.exit(1)
  }

  const github = new Octokit({ auth: authToken })

  try {
    const results = await Promise.all(Object.values(developers).map(username => github.users.getByUsername({ username })))
    return results
  } catch (err) {
    console.error('An error occurred while trying to access the user data from GitHub:')
    console.error(err)
    showUsage()
    process.exit(1)
  }
}
