# Script to install prod
install:
	npm install

# Start the prod server
start: 
	install && nodemon server.js

# from develop to master
release:
	./scripts/release.sh