#!/bin/bash

#Cleanup old server/build files
rm -r ~/server 2>/dev/null
./gradlew clean

#Rebuild the project and extract it to home
./gradlew build -x RunClientTests
cp server/build/distributions/server.tar ~/server.tar -v
tar xvf ~/server.tar -C ~

#Get rid of the tar, and move 3601_run.sh executable into home
rm ~/server.tar
cp .3601_run.sh ~/3601.sh
chmod +x ~/3601.sh
