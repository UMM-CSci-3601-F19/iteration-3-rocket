# Morris Laundry Facilities
### CSCI 3601 F19 Iteration 3
##### Authors: David Escudero, Emma Oswood, Hoomz Damte, Machi Iwata, Kai Zang, and Waller Li

[![Build Status](https://travis-ci.org/UMM-CSci-3601-F19/iteration-3-rocket.svg?branch=master)](https://travis-ci.org/UMM-CSci-3601-F19/iteration-3-rocket)

## Important notes about our iteration 3 project
**To run the E2E tests**, because the E2E tests is based on a fixed data and the auto updating should be turn off, **please set the "autoRefresh" false** at line 24 of client/src/app/home/home.component.ts, and **set the "seedLocalSourse" true** at line 31 of server/src/main/java/umm3601/laundry/LaundryController.java to use the local test data. 

At client/src/app/home/home.component.ts:24
```{java}
private autoRefresh = false;                
```
At server/src/main/java/umm3601/laundry/LaundryController.java:31
```{java}
private boolean seedLocalSourse = true;     
```
Please run the e2e test with the folloing instructions:

```
./gradlew clearMongoDB
./gradlew seedMongoDB
./gradlew run
./gradlew runE2ETests
```

There are 2 skipped e2e tests, we provide some reasons as comments before the code of both tests.

**To run other tests**, please **set the "autoRefresh" true** and **set the "seedLocalSourse" false.**

There are 5 skipped client tests, we provide some reasons as comments before the code of these tests.

We did not remove the modules of users' functionalities in the client and the server because they will be helpful as a template for future iterations.

We use SendGrid as tool to send our subscription email. It requires a paired key to connect to SendGrid's server. We use "a-fake-key" at line 473 in MailingController.java for testing purpose. The steps for using actual key are as following:

Sign in/sign up into SendFrid -> Generate a key with all mail and mail setting restrictions -> Copy the key generated ->
After delpoy your project onto Digital Ocean, manuly paste and replace "a-fake-key" with the key you copied ->
Run you droplet.

At server/src/main/java/umm3601/mailing/MailingController.java:473
```
final String key = "a_fake_key";
```

<!-- TOC depthFrom:1 depthTo:5 withLinks:1 updateOnSave:1 orderedList:0 -->
## Table of Contents
- [Important notes](#important-notes-about-our-iteration-1-project)
- [Setup](#setup)
- [Running the project](#running-the-project)
- [Testing and Continuous Integration](#testing-and-continuous-integration)
- [Resources](#resources)
	- [Angular](#angular)
	- [SparkJava](#sparkjava)
	- [MongoDB](#mongodb)

<!-- /TOC -->

## Setup

- When prompted to create a new IntelliJ project, select **yes**.
- Select **import project from existing model** and select **Gradle.**
  - Make sure **Use default Gradle wrapper** is selected.
- Click **Finish.**
- Do not compile TypeScript to JavaScript.

## Running the project

- The **run** Gradle task will still run the SparkJava server.
(which is available at ``localhost:4567``)
- The **build** (or its' alias **buildExecutable**) task will still _build_ the entire project (but not run it)
- The **runClient** task will build and run the client side of your project (available at ``localhost:9000``)

- To load new seed data into your local dev database, use the gradle task:
**seedMongoDB**.
- *Seed* data is stored in the correspondingly named JSON files at the top
level (e.g., `users.seed.json`).

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
