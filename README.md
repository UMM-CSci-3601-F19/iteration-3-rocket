# CSCI 3601 Production Template, F19
[![Build Status](https://travis-ci.org/UMM-CSci-3601-F19/iteration-1-rambunctious-racoons.svg?branch=master)](https://travis-ci.org/UMM-CSci-3601-F19/iteration-1-rambunctious-racoons)

This is your starter code for Iteration 1.

There are a number of pieces in this production template to help you get started.
As you work on your project, you should replace some of these pieces with 
elements of your project and remove whatever you don't need (e.g., 
markdown files, JSON data files, or any remnants of the labs).

<!-- TOC depthFrom:1 depthTo:5 withLinks:1 updateOnSave:1 orderedList:0 -->
## Table of Contents
- [Setup](#setup)
- [Running your project](#running-your-project)
- [Testing and Continuous Integration](#testing-and-continuous-integration)
- [Resources](#resources)
	- [Angular](#angular)
	- [SparkJava](#sparkjava)
	- [MongoDB](#mongodb)

<!-- /TOC -->

## Setup

As in the labs, you'll be using IntelliJ. Once you've all joined your
group using GitHub classroom, you can clone your repository using IntelliJ:

- When prompted to create a new IntelliJ project, select **yes**.
- Select **import project from existing model** and select **Gradle.**
  - Make sure **Use default Gradle wrapper** is selected.
- Click **Finish.**
- If IDEA asks you if you want to compile TypeScript to JavaScript :fire: DO NOT :fire:
it will break your project.

:warning: IDEA will sometimes decide to "help" you by offering
"Compile TypeScript to JavaScript?" :bangbang: *Never* say "OK" to this
offer -- if you do it will make a complete mess of your project. We're
using other tools (`gradle`, `ng`, and a thing called `webpack` which you
never explicitly see) to do that compilation. If you let IDEA do it, you'll
have a ton of JavaScript files cluttering up your project and confusing other
tools.

## Running your project

- The familiar **run** Gradle task will still run your SparkJava server.
(which is available at ``localhost:4567``)
- The **build** (or its' alias **buildExecutable**) task will still _build_ the entire project (but not run it)
- The **runClient** task will build and run the client side of your project (available at ``localhost:9000``)

The major difference between this lab and lab #3 is that, here, your data
(users and todos) will be stored in a database rather than as "flat" JSON files
within the server source code.

For the most part, you will be using a local installation of Mongo as a
`dev` (development) database. You don't *really* need to worry about how this is set up,
but you *do* need to know a couple of tricks to help you use it:

- To load new seed data into your local dev database, use the gradle task:
**seedMongoDB**.
- *Seed* data is stored in the correspondingly named JSON files at the top
level (e.g., `users.seed.json`).

:exclamation: Pro-tip: IntelliJ comes with a nice view to see the mongo databases setup.
To access this click on File -> Settings -> Plugins, type Mongo and make sure the Mongo Plugin is installed.
Now head to View -> Tool Windows -> Mongo Explorer. Then use the tool icon to add configuration.
Once prompted type for Path to Mongo Shell: _"/usr/bin/mongo"_
and hit the <span style="color:green">green :heavy_plus_sign:</span>, to add your label and, huzzah!, Mongo Explorer is on your side bar.

## Testing and Continuous Integration

Testing options are still integrated in this lab so you can test the client, or the server or both.
Testing client:
* runAllTests runs both the server tests and the clients tests once.
* runClientTests runs the client tests once.
* runClientTestsAndWatch runs the client tests every time that the code changes after a save.
* runClientTestsWithCoverage runs the client tests (once?) and deposits code coverage statistics into a new directory within `client` called `coverage`. In there you will find an `index.html`. Right click on `index.html` and select `Open in Browser` with your browser of choice. For Chrome users, you can drag and drop index.html onto chrome and it will open it.  
* runE2ETest runs end to end test for the client side. What are e2e tests? They are tests that run the real application and simulate user behavior. They assert that the app is running as expected. NOTE: Two Gradle tasks _must_ be run before you can run the e2e tests.
The server (`run`) needs to be on for this test to work, and you have to
run the `seedMongoDB` task before running the e2e tests!
* runServerTests runs the server tests.

Turn on your repo in [Travis CI][travis], replace the build status image in this README, and push your changes. That will trigger a build with Travis.

## Resources
### Angular
- [Angular documentation][angular]
- [TypeScript documentation][typescript-doc]
- [What _is_ Angular CLI?][angular-cli]
- [What are environments in Angular CLI?][environments]
- [Testing Angular with Karma/Jasmine][angular5-karma-jasmine]
- [End to end testing (e2e) with protactor and Angular CLI][e2e-testing]
- [Angular CLI commands](https://github.com/angular/angular-cli/wiki)
- [Angular Material Design][angular-md]

### SparkJava
- [Spark documentation][spark-documentation]
- [HTTP Status Codes][status-codes]
- [Other Resources][lab2]

### MongoDB
- [Mongo's Java Drivers (Mongo JDBC)][mongo-jdbc]

[angular-md]: https://material.angular.io/
[angular-cli]: https://angular.io/cli
[typescript-doc]: https://www.typescriptlang.org/docs/home.html
[angular]: https://angular.io/docs
[angular5-karma-jasmine]: https://codecraft.tv/courses/angular/unit-testing/jasmine-and-karma/
[e2e-testing]: https://coryrylan.com/blog/introduction-to-e2e-testing-with-the-angular-cli-and-protractor
[environments]: http://tattoocoder.com/angular-cli-using-the-environment-option/
[bootstrap]: https://getbootstrap.com/components/
[spark-documentation]: http://sparkjava.com/documentation.html
[status-codes]: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
[lab2]: https://github.com/UMM-CSci-3601/3601-lab2_client-server/blob/master/README.md#resources
[mongo-jdbc]: https://docs.mongodb.com/ecosystem/drivers/java/
[travis]: https://travis-ci.org/
