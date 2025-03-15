import {DeferredPromise, wrapPromiseInTimeout, type Uuid} from '@augment-vir/common';
import {defaultMultiplayerPort} from '@evir/common';
import {
    MultiplayerConnectionState,
    MultiplayerController,
    type MultiplayerClientRooms,
    type ServiceAndRoomConnectionState,
} from '@game-vir/multiplayer';
import {buildUrl} from 'url-vir';
import type {GameAction} from './game-action.js';
import type {GameState} from './game-state.js';
import {performActions} from './game-state.js';

export async function createMultiplayerController(
    ipAddress: string,
    connectionCallback: (state: ServiceAndRoomConnectionState) => void,
    roomListUpdate: (rooms: Readonly<MultiplayerClientRooms>) => void,
): Promise<ShootMpMultiplayerController> {
    const controller = new ShootMpMultiplayerController(
        ipAddress,
        connectionCallback,
        roomListUpdate,
    );

    try {
        await wrapPromiseInTimeout({seconds: 5}, controller.deferredConnectionPromise);
    } catch {
        throw new Error('Failed to find server.');
    }

    return controller;
}

export type StateCallback = (selfId: Uuid) => {
    activeActions: GameAction[];
    currentState: GameState;
};

export class ShootMpMultiplayerController extends MultiplayerController<GameAction> {
    public deferredConnectionPromise: DeferredPromise;
    public stateCallback: StateCallback | undefined;

    constructor(
        ipAddress: string,
        connectionCallback: (state: ServiceAndRoomConnectionState) => void,
        roomListUpdate: (rooms: Readonly<MultiplayerClientRooms>) => void,
    ) {
        const serviceOrigin = buildUrl(ipAddress, {
            protocol: 'http',
            hostname: ipAddress,
            port: defaultMultiplayerPort,
        }).origin;

        const deferredConnectionPromise = new DeferredPromise();

        super({
            listeners: {
                frame: (actions) => {
                    const clientId = this.clientId;
                    if (this.stateCallback && clientId) {
                        const {activeActions, currentState} = this.stateCallback(clientId);
                        performActions(actions, currentState);

                        this.act(activeActions);
                    }
                },
                connectionUpdate: (state) => {
                    if (!deferredConnectionPromise.isSettled) {
                        if (state.service === MultiplayerConnectionState.Error) {
                            deferredConnectionPromise.reject('Failed to connect to the server.');
                        } else if (state.service === MultiplayerConnectionState.Connected) {
                            deferredConnectionPromise.resolve();
                        }
                    }

                    connectionCallback(state);
                },
                roomListUpdate(rooms) {
                    roomListUpdate(rooms);
                },
            },
            multiplayer: {
                serviceOrigin,
            },
        });
        this.deferredConnectionPromise = deferredConnectionPromise;
    }
}
