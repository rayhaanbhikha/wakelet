FROM node:12.19.0-alpine AS dev

WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./

RUN yarn install --frozen-lockfile
COPY src src/

FROM dev AS transpileStage
RUN yarn build

FROM node:12.19.0-alpine AS prod

WORKDIR /app

COPY --from=transpileStage /app/package.json /app/yarn.lock ./
COPY --from=transpileStage /app/dist/. ./dist

RUN yarn install --production --frozen-lockfile

EXPOSE 8080
USER node
CMD [ "yarn", "start" ]

