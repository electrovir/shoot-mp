import {InputDirection, PlayersBindingsMap} from '@game-vir/handle-input';
import {InputDeviceKey} from 'input-device-handler';
import {GameActionType} from './game-action.js';

export const defaultPlayerBindings: Readonly<PlayersBindingsMap> = {
    '1': {
        [GameActionType.Up]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-ArrowUp',
            },
        ],
        [GameActionType.Down]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-ArrowDown',
            },
        ],
        [GameActionType.Left]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-ArrowLeft',
            },
        ],
        [GameActionType.Right]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-ArrowRight',
            },
        ],
        [GameActionType.Enter]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-Enter',
            },
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-NumpadEnter',
            },
        ],
        [GameActionType.Exit]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-Escape',
            },
        ],

        [GameActionType.ShipLeft]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-ArrowLeft',
            },
        ],
        [GameActionType.ShipRight]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-ArrowRight',
            },
        ],
        [GameActionType.ShipShoot]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-Enter',
            },
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-NumpadEnter',
            },
        ],
    },
};
