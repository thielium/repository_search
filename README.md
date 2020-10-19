# Overview

A tiny showcase app to perform searches on Github repositories.

## Why

To showcase an example of my coding style in a public place. It'll be interesting to come back and look at this in a few years, too, to see what I've learned.

# Design Decisions

## Typescript + React

Static typing greatly reduces the error count, especially when sole-developing a project. React is a very popular choice, so it's selected for readability.

## Unit test hooks

Most of the templating logic is very simple in the application. The highest value, most error-prone parts of the code are in the hooks, which is where testing has been focused.

## create-create-app

App was created with create-react-app. There are a few known limitations:

- There's an error coming from create-react-app surrounding the manifest (`Manifest: Line: 1, column: 1, Syntax error.`);
- The linting versions conflict with the latest linting versions used in the CLI.

These limitations are small, and ultimately I decided not to eject the app from `create-react-app` to fix them so that it emphasized what code I wrote, and how I wrote it.

# Dev

```
git clone git@github.com:thielium/repository_search.git
yarn
yarn start
```
