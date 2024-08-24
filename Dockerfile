# syntax=docker/dockerfile:1.4

ARG NODE_VERSION=20.8.1

FROM node:${NODE_VERSION}-alpine AS base

# Set working directory for all build stages.
WORKDIR /usr/src/app


################################################################################
# Create a stage for installing production dependecies.
FROM base AS prod_deps

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

################################################################################
# Create a stage for building the application.
FROM prod_deps AS build

# Download additional development dependencies before building, as some projects require
# "devDependencies" to be installed to build. If you don't need this, remove this step.
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN yarn run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base AS final

# Use production node environment by default.
ENV NODE_ENV=production

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json .

# Copy the production dependencies from the prod_deps stage and also
# the built application from the build stage into the image.
COPY --from=prod_deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/instrument.js /usr/src/app/server.js ./
COPY --from=build /usr/src/app/backend ./backend


# Expose the port that the application listens on.
EXPOSE $PORT

# Run the application.
CMD ["node", "server.js"]
