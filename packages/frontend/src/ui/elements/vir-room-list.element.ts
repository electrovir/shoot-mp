import {getObjectTypedValues, type Uuid} from '@augment-vir/common';
import {type MultiplayerClientRooms} from '@game-vir/multiplayer';
import {css, defineElement, defineElementEvent, html, listen, renderIf} from 'element-vir';
import {LoaderAnimated24Icon, ViraButton, ViraButtonStyle, ViraInput} from 'vira';
import {maxPlayerCount} from '../../data/game-state/multiplayer-controller.js';

export const VirRoomList = defineElement<{rooms: Readonly<MultiplayerClientRooms>}>()({
    tagName: 'vir-room-list',
    events: {
        createRoom: defineElementEvent<{roomName: string; roomPassword: string}>(),
        joinRoom: defineElementEvent<{roomId: Uuid; roomPassword: string; roomName: string}>(),
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .room-creation {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .buttons {
            display: flex;
            gap: 8px;
        }
    `,
    state() {
        return {
            creatingRoom: false,
            isLoading: false,
            newRoomName: '',
            newRoomPassword: '',
            passwordEntries: {} as Record<Uuid, string>,
        };
    },
    render({inputs, dispatch, events, state, updateState}) {
        if (state.creatingRoom) {
            return html`
                <div class="room-creation">
                    <${ViraInput.assign({
                        placeholder: 'Room Name',
                        disableBrowserHelps: true,
                        disabled: state.isLoading,
                        value: state.newRoomName,
                    })}
                        ${listen(ViraInput.events.valueChange, (event) => {
                            updateState({
                                newRoomName: event.detail,
                            });
                        })}
                    ></${ViraInput}>
                    <${ViraInput.assign({
                        placeholder: 'password (empty for none)',
                        disabled: state.isLoading,
                        value: state.newRoomPassword,
                    })}
                        ${listen(ViraInput.events.valueChange, (event) => {
                            updateState({
                                newRoomPassword: event.detail,
                            });
                        })}
                    ></${ViraInput}>
                    <div class="buttons">
                        <${ViraButton.assign({
                            text: 'Cancel',
                            disabled: state.isLoading,
                            buttonStyle: ViraButtonStyle.Outline,
                        })}
                            ${listen('click', () => {
                                updateState({creatingRoom: false});
                            })}
                        ></${ViraButton}>
                        <${ViraButton.assign({
                            text: 'Create room',
                            disabled: state.isLoading,
                            icon: state.isLoading ? LoaderAnimated24Icon : undefined,
                        })}
                            ${listen('click', () => {
                                updateState({isLoading: true});
                                dispatch(
                                    new events.createRoom({
                                        roomName: state.newRoomName,
                                        roomPassword: state.newRoomPassword,
                                    }),
                                );
                            })}
                        ></${ViraButton}>
                    </div>
                </div>
            `;
        } else {
            const existingRoomRowTemplates = getObjectTypedValues(inputs.rooms).map((room) => {
                const enteredPassword: string = state.passwordEntries[room.roomId] || '';

                return html`
                    <tr>
                        <td>${room.roomName}</td>
                        <td>(${room.clientCount})</td>
                        <td>
                            ${room.hasRoomPassword
                                ? html`
                                      <${ViraInput.assign({
                                          value: enteredPassword,
                                      })}
                                          ${listen(ViraInput.events.valueChange, (event) => {
                                              updateState({
                                                  passwordEntries: {
                                                      ...state.passwordEntries,
                                                      [room.roomId]: event.detail,
                                                  },
                                              });
                                          })}
                                      ></${ViraInput}>
                                  `
                                : ''}
                        </td>
                        <td>
                            ${renderIf(
                                room.clientCount < maxPlayerCount,
                                html`
                                    <${ViraButton.assign({
                                        text: 'Join',
                                    })}
                                        ${listen('click', () => {
                                            dispatch(
                                                new events.joinRoom({
                                                    roomId: room.roomId,
                                                    roomPassword: enteredPassword,
                                                    roomName: room.roomName,
                                                }),
                                            );
                                        })}
                                    ></${ViraButton}>
                                `,
                            )}
                        </td>
                    </tr>
                `;
            });

            const existingRoomsTemplate = existingRoomRowTemplates.length
                ? html`
                      <table><tbody>${existingRoomRowTemplates}</tbody></table>
                  `
                : html`
                      <p>No rooms. Create one!</p>
                  `;

            return html`
                <div>Choose a room: ${existingRoomsTemplate}</div>
                <div>
                    <${ViraButton.assign({
                        text: 'Create room',
                    })}
                        ${listen('click', () => {
                            updateState({creatingRoom: true});
                        })}
                    ></${ViraButton}>
                </div>
            `;
        }
    },
});
