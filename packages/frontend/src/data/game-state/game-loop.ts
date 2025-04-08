import {readBindingsStage, readRawInputStage} from '@game-vir/handle-input';
import {InputDeviceHandler} from 'input-device-handler';
import {VirLine, type VirLineStage} from 'vir-line';
import {defaultPlayerBindings} from './default-actions-bindings.js';
import {multiplayerStage} from './multiplayer.stage.js';
import {renderStage} from './render.stage.js';

const stages = [
    readRawInputStage,
    readBindingsStage,
    multiplayerStage,
    renderStage,
] as const satisfies ReadonlyArray<Readonly<VirLineStage<any>>>;

export function initGameLoop() {
    return new VirLine<typeof stages>(
        stages,
        {
            deviceHandler: new InputDeviceHandler({
                disableMouseMovement: true,
            }),
            playersBindings: defaultPlayerBindings,
        },
        {
            init: {
                startUpdateLoopImmediately: true,
            },
            updateLoopInterval: 'animation frames',
        },
    );
}

export type GameLoop = ReturnType<typeof initGameLoop>;
