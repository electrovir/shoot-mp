import {log} from '@augment-vir/common';
import {defaultMultiplayerPort} from '@evir/common';
import {startMultiplayerServer} from '@game-vir/multiplayer-server';
import {readConfig} from './config.js';

const config = await readConfig();

const {host, port} = await startMultiplayerServer({
    port: defaultMultiplayerPort,
    host: '0.0.0.0',
    backendOrigin: config?.backend,
    frontendOrigin: config?.frontend,
});

log.faint(`listening on ${host}:${port}`);
