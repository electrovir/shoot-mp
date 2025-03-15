import {defaultMultiplayerPort} from '@evir/common';
import {startMultiplayerServer} from '@game-vir/multiplayer-server';

await startMultiplayerServer({
    port: defaultMultiplayerPort,
    host: '0.0.0.0',
});
