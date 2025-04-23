# shoot-mp

A very simple multiplayer LAN PvP shooter game. You can play at https://electrovir.github.io/shoot-mp but one computer on your LAN must be running the server (by cloning this repo locally).

## Run the server

1. `git clone` this repo
2. `cd` into it
3. `npm ci` (install dependencies)
4. Start the server:
    - in dev mode:
        - run `npm run dev` (includes frontend, backend, and auto reloading)
    - in production mode:
        - run `npm run build:backend`
        - run `npm start`

## Dev

To run the full stack locally, follow the same steps above but use `npm run dev` (instead of start).
