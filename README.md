# Offliner

A progressive web app for storing Youtube video for later offline use.

Features include:
* You can install it like a native app
* once installed you can share videos from youtube to the app and download them
* Supports backgrounds fetch (enabled in the gloabl settings)
* Uses FileSystem interface to store videos so you can manage them directly in the web app
* the web app itself is offline first
* you can download high quality videos
* you can view the videos and their info in youtube-like layout
* you can create, update and delete playlists of downloaded videos


The app is built with Typescript, react, and radix-ui  for the front-end and Node.js with Express for the backend

## Contribute

To contribute. you can simply install the dependencies and launch the dev server

```sh
yarn install
```

```sh
yarn dev
```

### Production build

1. with Docker

```sh
docker build -t offliner:[release] .
docker push offliner:[release]
```

2. with npm scripts

```sh
yarn build
yarn start
```
