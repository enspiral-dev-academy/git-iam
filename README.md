# git-iam

This is a Git extension for setting local name and email configuration quickly.

It works by accessing a remote JSON file to get user information. The JSON file
contains a list of name and email addresses of GitHub users. This extension
configures the name and email config settings for the user provided in the
current local repository. For more context, see the
[Applicability](#applicability) section.


## Note about v0.2.0

Starting with version 0.2.0, the script also blanks out the global git config for `user.name` and `user.email`. We found some students would forget to run this script before committing and they would follow the git instructions to set the global user settings. Any future devs on that machine who also forgot to run this script before committing would unknowingly get the global settings. This change attempts to mitigate that scenario.


## Installation

```sh
yarn global add git-iam
# or
npm install git-iam --global
```

## Create users.json

You need to create a JSON object that contains the students' GitHub information.

The `users.json` file (or whatever you decide to call it) should have this format:

```json
{
  "jane": {
    "name": "Jane Dev",
    "email": "jane.dev@github.email.com"
  },
  "joe": {
    "name": "Joe Dev",
    "email": "joe.dev@github.email.com"
  }
}
```

You can use the second part of this [script](https://github.com/dev-academy-programme/teaching-guide/blob/main/bootcamp-prep-resources/scripts/add-people-to-github-org/create-git-iam-student-file.js) to create the users.json. This script will automatically make a JSON object with the students' GitHub usernames as the object properties. Feel free to edit the property names.

## Create Git Gist

* Open up Git Gist on Github
  - You can either use the toolseda account or one of the teacher's personal account
* Create a new private Git Gist
* Copy the contents of your `users.json` and put it inside your new Git Gist
* Get the shareable link of your private Git Gist
* Add `/raw/` to the end of the link

It should look like this

```sh
https://gist.github.com/{username}/{git-gist-id}/raw/
```

## Configuration

In your terminal, run

```sh
git-iam --init https://gist.github.com/{username}/{git-gist-id}/raw/
```

**Replace the link after the `--init` with your Git Gist link**

This command

* saves the user list URL to the global Git config `users.url`
* adds the `iam` alias to the global Git config `alias.iam`

## Using git-iam

Now you can run this inside of an existing Git repository:

```sh
git iam jane
```

and it will have the same effect as running:

```sh
git config --global --unset-all user.name
git config --global --unset-all user.email
git config user.name "Jane Dev"
git config user.email "jane.dev@github.email.com"
```

You can verify this by running:

```sh
git config --list
# or
cat .git/config
```

Now the next `git commit` in this repo will list Jane as the dev on the commit.


## Applicability

This might not seem like a justifiable effort - to build something that only
saves such few keystrokes. And most people, who are the only devs using their
computer, rarely run these commands.

But this is the config setting that dictates which developer (and GitHub user)
performed the commit. In a classroom setting where students use every machine
in the lab, this config is needed before each commit so the appropriate student
gets credit for the commit (most importantly for their GitHub profile).

This script hopes to save our students a lot of time, and increase the accuracy
of who is performing commits, so students get the credit they deserve.
