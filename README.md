# Gruppen-Tool

Hosted at https://gruppen-tool.de

This is a tool to assign people to groups based on given preferences and capacity constraints.
See the READMEs in the folders for more information.

- `workshops-frontend` contains the React code for the frontend as well as a `Caddyfile` for a global reverse proxy in Docker
- `workshops-backend` contains the Go code for a stateless backend solving the assignment problem using "min-cost-max-flow"
- `workshops-backend-v2` contains Python code for a statelesse backend solving the assignment problem using a MILP using SCIP

# Using the Dockerfile

To build and push this application using Docker, execute
```
./docker-build-push.sh <TAG_PREFIX> <VERSION>
```
in the repository root, e.g.:
```
./docker-build-push.sh user/gruppen-tool v0.1.1
```

