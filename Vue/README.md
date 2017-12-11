# demo-portal

The idea of this page is to demonstrate to our end clients our technical prowess.

## Vue
To get you started you can simply clone the repository, move to the Vue folder and install the dependencies.

```
cd demo-portal/Vue
npm install
```
### Prerequisites

#### 1. Install Git

You need git to clone this repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

##### Configuring Git

Ensure that the following configuration is in place, by running the command - `git config -l`

```
user.name={your git username}
user.email={your osmosys email}
credential.helper=cache --timeout=36000
core.editor={your favorite editor - geany / sublime text / nano}
merge.tool=meld
diff.tool=meld
```
If not, to set these values via command line -

```
# Setting the username and email
$ git config --global user.name "John Doe"
$ git config --global user.email johndoe@example.com

# Password caching so you don't have to enter it again and again, time in secs
$ git config --global credential.helper cache
$ git config --global credential.helper 'cache --timeout=18000'

# Setting nano as the default editor for git.
git config --global core.editor "nano"

# Setting meld as the megetool
git config --global merge.tool meld

# Setting meld as the difftool
git config --global diff.tool meld
```

#### 2. Node.JS and npm

We also use a number of Node.js tools. You must have node.js and its package manager (npm) installed.
You can get them from [http://nodejs.org/](http://nodejs.org/).


#### 4. VSCode

We'll be using VSCode for our development. Ensure that the latest version of VSCode is setup on your machine, and ensure that the following properties are
present in user settings file -
```
{
  "editor.tabSize": 2,
  "editor.rulers": [
    80,
    120
  ],
  "files.trimTrailingWhitespace": true,
  "editor.detectIndentation": false,
  "telemetry.enableTelemetry": false,
  "eslint.autoFixOnSave": true,
  "jslint.enable": false
}
```

#### 5. Setting up eslint

Ensure that `eslint` extension is installed on VSCode. Under extensions search for - **dbaeumer.vscode-eslint** and install the first extension.

#### 6. Install and set meld as your difftool

Meld will be used across Linux and Windows machines as the our difftool. Can be installed from here - http://meldmerge.org/

### Running the Application

We have preconfigured the project with a simple development web server.  The simplest way to start this server is:

```
npm run dev
```

## Please go through Documentation

Please go through the page [here](http://10.0.0.155/books/faq-php/page/requirements)
