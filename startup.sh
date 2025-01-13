#!/bin/bash

# URI / URL
export POST_SCHEMA_URI=https://localhost:8945/interactive-module/api/internal-query/schemas
export POST_RESULT_URI=https://localhost:8945/interactive-module/api/internal-query/results
export GET_JOB_URI=https://localhost:8945/interactive-module/api/internal-query/job

# CERTS
export DEFAULT_CA_PATH=/Users/$USER/ca.pem

# TOKENS AND AUTH
export MODULE_AUTH_TOKEN=/Users/$USER/MODULE_AUTH_TOKEN

# HOST
export RUNTIME_HOST=localhost
export SERVICE_HOST=localhost

# PORT
export RUNTIME_PORT=8945
export SERVICE_PORT=8945
