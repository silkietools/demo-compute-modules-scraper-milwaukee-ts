# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.10.0

# Use Ubuntu-based Node.js image instead of Alpine
FROM --platform=amd64 node:${NODE_VERSION}

# Use production node environment by default.
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Install dependencies and Playwright browsers separately
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts && \
    # Install browsers with system dependencies and ensure proper permissions
    npx playwright install --with-deps && \
    # Make sure the browser directory is accessible to non-root user
    mkdir -p /home/pwuser/.cache && \
    cp -r /root/.cache/ms-playwright /home/pwuser/.cache/ && \
    chown -R 5000:5000 /home/pwuser

# Set the browser cache directory for the non-root user
ENV PLAYWRIGHT_BROWSERS_PATH=/home/pwuser/.cache/ms-playwright

# Copy the rest of the source files into the image.
COPY . .

# Build the application
RUN npm run build

# Run the application as a non-root user.
USER 5000

# Specify the command to run the application.
CMD ["node", "dist/index.js"]
