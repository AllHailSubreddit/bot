FROM node:12.7.0-alpine
WORKDIR /opt/app
COPY package*.json ./
RUN npm ci --only=production
COPY --chown=node:node src ./
USER node
