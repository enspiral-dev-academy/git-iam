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


## Setup

After installation:
 
If you don't already have a `users.json` file:

```sh
GH_AUTH=<GitHub personal access token> git iam --build <input path>
```

This command builds a JSON object in the format required for `git-iam`, and outputs it to the console.

A GitHub access token is required to retrieve user data from the GitHub API.

The `<input path>` should point to a JSON file that has this format:

```json
{
  "jane": "jane-on-github",
  "joe": "joe-on-github"
}
```

Or feel free to skip this step and build your own. It should have this format:

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

Save the JSON object to a Gist, i.e. [https://raw.githubusercontent.com/org/repo/branch/users.json](#)

Once you have a URL to your `users.json` file:

```sh
git-iam --init https://raw.githubusercontent.com/org/repo/branch/users.json
```

This command

* saves the user list URL to the global Git config `users.url`
* adds the `iam` alias to the global Git config `alias.iam`

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
