import {getObjectTypedKeys, type PartialWithUndefined, type Uuid} from '@augment-vir/common';
import type {ReadBindingsStageState} from '@game-vir/handle-input';
import {VirLineStage} from 'vir-line';
import {registeredEntities} from './entities.js';
import {GameAction, GameActionType} from './game-action.js';
import type {GameState} from './game-state.js';
import {startingGameState} from './game-state.js';
import {ShootMpMultiplayerController} from './multiplayer-controller.js';

export type MultiplayerStageState = PartialWithUndefined<{
    gameState: GameState;
    roomName: string;
    multiplayerController: ShootMpMultiplayerController;
    currentPlayerId?: Uuid | undefined;
}> &
    ReadBindingsStageState<GameActionType>;

export const multiplayerStage = new VirLineStage<MultiplayerStageState>(
    {name: 'multiplayer'},
    ({state}) => {
        if (state.multiplayerController && !state.multiplayerController.stateCallback) {
            state.multiplayerController.stateCallback = (selfId: Uuid) => {
                if (!state.gameState) {
                    state.gameState = {
                        ...startingGameState,
                        registeredEntities: registeredEntities,
                    };
                }
                state.currentPlayerId = selfId;

                return {
                    activeActions: getObjectTypedKeys(state.playersActiveBindings?.['1'] || {}).map(
                        (binding): GameAction => {
                            return {
                                type: binding,
                                playerId: selfId,
                            } as GameAction;
                        },
                    ),
                    currentState: state.gameState,
                };
            };
        }
    },
);
