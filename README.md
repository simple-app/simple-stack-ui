simple-stack-ui
===============

`simple-stack-ui` is a high-productivity collection of tools and practices for rapidly writing production-ready applications .

Features
--------

Getting Started
---------------

```sh
$ mkdir my-new-project
$ cd my-new-project
$ npm install simple-stack-ui
$ touch Makefile
```

The new `Makefile` should look something like this:

```make
PROJECT=my-new-project
DESCRIPTION=This is a really great app!
ORGANIZATION=my-github-org

include ./node_modules/simple-stack-ui/tasks.mk
```

Once the `Makefile` is initialized, run:

```sh
$ make init
$ cp .env.example .env
$ foreman start
$ open http://localhost:5000
```
