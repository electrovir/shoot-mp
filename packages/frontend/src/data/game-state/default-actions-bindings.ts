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
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-KeyW',
            },
        ],
        [GameActionType.Down]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-ArrowDown',
            },
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-KeyS',
            },
        ],
        [GameActionType.Left]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-ArrowLeft',
            },
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-KeyA',
            },
        ],
        [GameActionType.Right]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-ArrowRight',
            },
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-KeyD',
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
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-KeyA',
            },
        ],
        [GameActionType.ShipRight]: [
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-ArrowRight',
            },
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-KeyD',
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
                inputName: 'button-Space',
            },
            {
                deviceKey: InputDeviceKey.Keyboard,
                direction: InputDirection.Positive,
                inputName: 'button-NumpadEnter',
            },
        ],
    },
};
