#! /usr/bin/env node

const shell = require('shelljs')
const request = require('superagent')

const alias = process.argv[2].toLowerCase()
const listingUrl = process.argv[3]

if (!alias) {
  showUsage()
} else if (alias === '--init') {
  setupExtension(listingUrl)
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

