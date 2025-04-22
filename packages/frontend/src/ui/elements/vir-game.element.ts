import {assertWrap} from '@augment-vir/assert';
import {type Uuid} from '@augment-vir/common';
import {classMap, css, defineElement, html, nothing, onDomCreated} from 'element-vir';
import {type GameLoop} from '../../data/game-state/game-loop.js';
import {gameBoardSize} from '../../data/game-state/game-state.js';

export const VirGame = defineElement<{
    gameLoop: GameLoop;
}>()({
    tagName: 'vir-game',
    styles: css`
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        canvas {
            box-sizing: border-box;
            aspect-ratio: 1;
            width: 100vmin;
            height: 100vmin;
            border: 1px solid red;
            image-rendering: pixelated;
        }

        .game-end {
            position: absolute;
            font-size: 48px;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .fade {
            opacity: 0.3;
        }
    `,
    state() {
        return {
            victor: undefined as Uuid | undefined,
            cleanup: () => {},
        };
    },
    init({updateState, inputs}) {
        updateState({
            cleanup: inputs.gameLoop.listenToState(true, {gameState: {victor: true}}, (victor) => {
                updateState({
                    victor,
                });
            }),
        });
    },
    cleanup({state}) {
        state.cleanup();
    },
    render({state, inputs}) {
        const youWon = inputs.gameLoop.currentState.currentPlayerId === state.victor;

        const winnerTemplate = state.victor
            ? html`
                  <div class="game-end"><p>You ${youWon ? 'Win' : 'Lose'}!</p></div>
              `
            : nothing;
        return html`
            ${winnerTemplate}
            <canvas
                class=${classMap({
                    fade: !!state.victor,
                })}
                width=${gameBoardSize}
                height=${gameBoardSize}
                ${onDomCreated((element) => {
                    inputs.gameLoop.currentState.renderCanvas = assertWrap.instanceOf(
                        element,
                        HTMLCanvasElement,
                    );
                })}
            ></canvas>
        `;
    },
});
