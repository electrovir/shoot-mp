import {defaultMultiplayerPort} from '@evir/common';
import {startMultiplayerServer} from '@game-vir/multiplayer-server';
import {readConfig} from './config.js';

const config = await readConfig();

await startMultiplayerServer({
    port: defaultMultiplayerPort,
    host: '0.0.0.0',
    backendOrigin: config?.backend,
    frontendOrigin: config?.frontend,
});
