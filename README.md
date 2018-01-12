# git-iam

This is a Git extension for setting local name and email configuration quickly.

It works by accessing a remote JSON file to get user information. The JSON file
contains a list of name and email addresses of GitHub users. This extension sets
the name and email Git config settings for the user provided. For more context,
see the [Applicability](#applicability) section.


## Installation

```sh
yarn global add git-iam
# or
npm install git-iam --global
```


## Setup

After installation:

```sh
git-iam --init https://raw.githubusercontent.com/user/repo/branch/users.json
```

This command

* saves the user list URL to the global Git config `users.url`
* adds the `iam` alias to the global Git config `alias.iam`

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

Now you can run this inside of an existing Git repository:

```sh
git iam jane
```

and it will have the same effect as running:

```sh
git config user.name "Jane Dev"
git config user.email "jane@github.email.com"
```

You can verify this by running:

```sh
git config --list
# or
cat .git/config
```

Now the next `git commit` will list Jane as the dev on the commit.


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
