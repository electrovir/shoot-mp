import {assert} from '@augment-vir/assert';
import {
    DeferredPromise,
    getObjectTypedKeys,
    wrapPromiseInTimeout,
    type Uuid,
} from '@augment-vir/common';
import {defaultMultiplayerPort} from '@evir/common';
import {
    MultiplayerConnectionState,
    MultiplayerController,
    type MultiplayerClientRooms,
    type ServiceAndRoomConnectionState,
} from '@game-vir/multiplayer';
import {type RequireExactlyOne} from 'type-fest';
import {buildUrl} from 'url-vir';
import {GameActionType, performActions, type GameAction} from './game-action.js';
import {serializeGameState, type GameState} from './game-state.js';

export type MultiplayerControllerAddress = RequireExactlyOne<{
    ipAddress: string;
    origin: string;
}>;

export async function createMultiplayerController(
    address: MultiplayerControllerAddress,
    connectionCallback: (state: ServiceAndRoomConnectionState) => void,
    roomListUpdate: (rooms: Readonly<MultiplayerClientRooms>) => void,
): Promise<ShootMpMultiplayerController> {
    const controller = new ShootMpMultiplayerController(
        address,
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

export const maxPlayerCount = 2;

export class ShootMpMultiplayerController extends MultiplayerController<GameAction> {
    public deferredConnectionPromise: DeferredPromise;
    public stateCallback: StateCallback | undefined;
    private initializedMemberClients: Record<Uuid, boolean> = {};

    constructor(
        address: Readonly<MultiplayerControllerAddress>,
        connectionCallback: (state: ServiceAndRoomConnectionState) => void,
        roomListUpdate: (rooms: Readonly<MultiplayerClientRooms>) => void,
    ) {
        const backendOrigin: string | undefined = address.ipAddress
            ? buildUrl(address.ipAddress, {
                  protocol: 'http',
                  port: defaultMultiplayerPort,
              }).origin
            : address.origin;

        assert.isDefined(backendOrigin);

        const deferredConnectionPromise = new DeferredPromise();

        super({
            listeners: {
                frame: (actions) => {
                    const clientId = this.getClientId();
                    if (this.stateCallback && clientId) {
                        const {activeActions, currentState} = this.stateCallback(clientId);
                        performActions(actions, currentState, clientId);
                        const initActions = this.generateInitActions(currentState);
                        this.act([
                            ...initActions,
                            ...activeActions,
                        ]);
                    }
                },
                connectionUpdate: (state) => {
                    if (!deferredConnectionPromise.isSettled) {
                        if (state.service instanceof Error) {
                            deferredConnectionPromise.reject(state.service);
                        } else if (state.service === MultiplayerConnectionState.Connected) {
                            deferredConnectionPromise.resolve();
                        }
                    }

                    connectionCallback(state);
                },
                roomListUpdate: (rooms) => {
                    roomListUpdate(rooms);
                },
                acceptConnection: () => {
                    return this.getAllClientIds().length < maxPlayerCount;
                },
            },
            multiplayer: {
                backendOrigin,
                roomUpdateInterval: {
                    seconds: 1,
                },
                stunServerUrls: [
                    'stun.cloudflare.com:3478',
                    // cspell:ignore stunserver stunprotocol
                    'stunserver2024.stunprotocol.org',
                ],
            },
        });
        this.deferredConnectionPromise = deferredConnectionPromise;
    }

    private generateInitActions(gameState: Readonly<GameState>): GameAction[] {
        if (!this.isHost()) {
            return [];
        }
        const clientIds = this.getAllClientIds();

        const uninitializedClientIds = clientIds.filter(
            (clientId) => !this.initializedMemberClients[clientId],
        );
        const missingClientIds = getObjectTypedKeys(gameState.playerEntities).filter(
            (playerId) => !clientIds.includes(playerId),
        );

        const serializedState = uninitializedClientIds.length
            ? serializeGameState(gameState)
            : undefined;

        uninitializedClientIds.forEach(
            (clientId) => (this.initializedMemberClients[clientId] = true),
        );

        const initActions = serializedState
            ? uninitializedClientIds.map((clientId): GameAction => {
                  return {
                      data: serializedState,
                      playerId: clientId,
                      type: GameActionType.Init,
                  };
              })
            : [];

        const removeActions = missingClientIds.map((clientId): GameAction => {
            return {
                playerId: clientId,
                type: GameActionType.Remove,
            };
        });

        return [
            ...initActions,
            ...removeActions,
        ];
    }
}
