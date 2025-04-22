import {assertWrap} from '@augment-vir/assert';
import {createUuidV4} from '@augment-vir/common';
import {
    MultiplayerConnectionState,
    type MultiplayerClientRooms,
    type ServiceAndRoomConnectionState,
} from '@game-vir/multiplayer';
import {css, defineElementNoInputs, html, listen} from 'element-vir';
import {isIPv4} from 'is-ip';
import {initGameLoop} from '../../data/game-state/game-loop.js';
import {
    createMultiplayerController,
    type ShootMpMultiplayerController,
} from '../../data/game-state/multiplayer-controller.js';
import {VirGame} from './vir-game.element.js';
import {ipCacheKey, VirIpInput} from './vir-ip-input.element.js';
import {VirRoomList} from './vir-room-list.element.js';

export const VirApp = defineElementNoInputs({
    tagName: 'vir-app',
    styles: css`
        :host {
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }

        ${VirGame} {
            flex-grow: 1;
        }
    `,
    state() {
        return {
            serviceIpAddress: window.localStorage.getItem(ipCacheKey) || '',
            gameLoop: initGameLoop(),
            ipErrorMessage: '',
            rooms: {} as Readonly<MultiplayerClientRooms>,
            connectionState: {
                service: MultiplayerConnectionState.Disconnected,
                room: MultiplayerConnectionState.Disconnected,
            } as ServiceAndRoomConnectionState,
            multiplayerController: undefined as undefined | ShootMpMultiplayerController,
        };
    },
    render({state, updateState}) {
        if (state.connectionState.service !== MultiplayerConnectionState.Connected) {
            return html`
                <${VirIpInput.assign({
                    errorMessage: state.ipErrorMessage,
                    ipAddress: state.serviceIpAddress,
                    connected: false,
                })}
                    ${listen(VirIpInput.events.ipChange, async (event) => {
                        const serviceIpAddress = event.detail;
                        updateState({serviceIpAddress});

                        if (isIPv4(serviceIpAddress)) {
                            const controller = await createMultiplayerController(
                                serviceIpAddress,
                                (connectionState) => {
                                    updateState({
                                        connectionState,
                                    });
                                },
                                (rooms) => {
                                    updateState({rooms});
                                },
                            );
                            window.localStorage.setItem(ipCacheKey, serviceIpAddress);

                            state.gameLoop.currentState.multiplayerController = controller;
                            updateState({
                                multiplayerController: controller,
                            });
                        }
                    })}
                ></${VirIpInput}>
            `;
        } else if (state.connectionState.room === MultiplayerConnectionState.Connected) {
            return html`
                <${VirGame.assign({
                    gameLoop: state.gameLoop,
                })}></${VirGame}>
            `;
        } else {
            return html`
                <${VirRoomList.assign({
                    rooms: state.rooms,
                })}
                    ${listen(VirRoomList.events.createRoom, async (event) => {
                        await assertWrap.isDefined(state.multiplayerController).joinOrCreateRoom({
                            roomId: createUuidV4(),
                            roomName: event.detail.roomName,
                            roomPassword: event.detail.roomPassword,
                        });
                    })}
                    ${listen(VirRoomList.events.joinRoom, async (event) => {
                        await assertWrap
                            .isDefined(state.multiplayerController)
                            .joinOrCreateRoom(event.detail);
                    })}
                ></${VirRoomList}>
            `;
        }
    },
});
