import {log} from '@augment-vir/common';
import {defaultMultiplayerPort} from '@evir/common';
import {startMultiplayerServer} from '@game-vir/multiplayer-server';
import {readConfig} from './config.js';

const config = await readConfig();
const isDev = import.meta.filename.endsWith('.ts');

const {host, port} = await startMultiplayerServer({
    port: defaultMultiplayerPort,
    host: '0.0.0.0',
    backendOrigin: config?.backend,
    frontendOrigin: isDev ? undefined : config?.frontend,
});

log.faint(`listening on ${host}:${port}`);
log.faint(`dev: ${isDev}`);
