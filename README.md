# goatvote.ca

This MERN app uses Firebase for authentication and allows users to vote on which
athletes are the best in various categories and timeframes. The repo is a
monolith which houses both the server and client.

There are numerous issues which have arisen as a result of the limitations of
Wikimedia data so I'm working on a new version of this site
([goat-vote.com](https://www.goat-vote.com/)) with a different API, but have
decided to leave this one as a sort of time capsule.

## Requirements

You'll need `Node.js`, `Yarn`, and `NVM (Node Version Manager)` installed on
your machine to run this app locally.

Node can be installed by following the instructions at
[nodejs.org](https://nodejs.org/).

Yarn can then be added:

```
npm install --global yarn
```

You can add NVM by following the instructions at
[@nvm-sh/nvm](https://github.com/nvm-sh/nvm).

---

## Installation

Clone the repo onto your machine and cd into it:

```
git clone https://github.com/maxmonis/goatvote.ca.git
cd goatvote.ca
```

Download all dependencies of both the server and client:

```
yarn setup
```

---

## Configuration

Create a gitignored file with MongoDB credentials:

```
touch config/default.json
```

Within that file you'll need to add credentials from a Mongo database, for
example:

```
{
  "mongoURI": "put_your_connection_string_here",
  "jwtSecret": "and_a_secret_of_your_choice_here"
}
```

Follow the instructions at [mongodb.com](https://www.mongodb.com/) if you need
to create a new database.

The client will also need Firebase credentials for authentication, so create a
gitignored env file:

```
touch app/.env.local
```

Now add your auth credentials to that file, these are the required keys:

```
REACT_APP_API_KEY=
REACT_APP_APP_ID=
REACT_APP_AUTH_DOMAIN=
REACT_APP_MEASUREMENT_ID=
REACT_APP_MESSAGING_SENDER_ID=
REACT_APP_PROJECT_ID=
REACT_APP_STORAGE_BUCKET=
```

Follow the instructions on [firebase.google.com](https://firebase.google.com/)
if you need to create a new project.

---

## Development

Ensure you're using the correct Node version from the `.nvmrc` file (you should
only need to do this once per session):

```
nvm use
```

Start the server and client in development mode:

```
yarn dev
```

---

## Production

Create a production build of the app:

```
yarn build
```

---
