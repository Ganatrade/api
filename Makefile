# Script to install prod
install:
	npm install

# Start the prod server
start:
	open http://localhost:8080 && nodemon server.js

# from develop to master
release:
	./scripts/release.sh

release-minor:
	./scripts/release-minor.sh

release-major:
	./scripts/release-major.sh