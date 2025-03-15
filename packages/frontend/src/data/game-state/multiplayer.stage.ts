import {getObjectTypedKeys, type PartialWithUndefined, type Uuid} from '@augment-vir/common';
import type {ReadBindingsStageState} from '@game-vir/handle-input';
import {VirLineStage} from 'vir-line';
import type {GameActionType} from './game-action.js';
import type {GameState} from './game-state.js';
import {startingGameState} from './game-state.js';
import {ShootMpMultiplayerController} from './multiplayer-controller.js';

export type MultiplayerStageState = PartialWithUndefined<{
    gameState: GameState;
    roomName: string;
    multiplayerController: ShootMpMultiplayerController;
}> &
    ReadBindingsStageState<GameActionType>;

export const multiplayerStage = new VirLineStage<MultiplayerStageState>(
    {name: 'multiplayer'},
    ({state}) => {
        if (state.multiplayerController && !state.multiplayerController.stateCallback) {
            state.multiplayerController.stateCallback = (selfId: Uuid) => {
                if (!state.gameState) {
                    state.gameState = startingGameState;
                }

                return {
                    activeActions: getObjectTypedKeys(state.playersActiveBindings?.['1'] || {}).map(
                        (binding) => [
                            binding,
                            selfId,
                        ],
                    ),
                    currentState: state.gameState,
                };
            };
        }
    },
);
