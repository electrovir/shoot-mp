import {type PartialWithUndefined, type Uuid} from '@augment-vir/common';
import {VirLineStage} from 'vir-line';
import {type EntityRenderParams, type GameEntity, type GameState} from './game-state.js';

export type RenderStageState = PartialWithUndefined<{
    gameState: GameState;
    renderCanvas?: undefined | HTMLCanvasElement;
    renderContext?: undefined | CanvasRenderingContext2D;
    currentPlayerId?: Uuid | undefined;
}>;

export const renderStage = new VirLineStage<RenderStageState>({name: 'render'}, ({state}) => {
    if (state.gameState?.victor) {
        return;
    }

    const currentPlayerId = state.currentPlayerId;
    if (!state.renderCanvas || !state.gameState || !currentPlayerId) {
        return;
    } else if (!state.renderContext) {
        const newContext = state.renderCanvas.getContext('2d');
        if (!newContext) {
            throw new Error('Failed to generate canvas rendering context.');
        }

        state.renderContext = newContext;
    }

    const renderContext = state.renderContext;
    renderContext.fillStyle = 'white';
    renderContext.fillRect(0, 0, state.renderCanvas.width, state.renderCanvas.height);

    renderEntities(state.gameState.entities, {currentPlayerId, renderContext});
});

function renderEntities(
    entities: ReadonlyArray<Readonly<GameEntity>>,
    params: Readonly<EntityRenderParams>,
): void {
    entities.forEach((entity) => {
        entity.render(params);
        renderEntities(entity.entities, params);
    });
}
