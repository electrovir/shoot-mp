import {pickObjectKeys, Values, type Uuid} from '@augment-vir/common';
import {MenuNavBinding} from '@game-vir/handle-input';

export const GameActionType = {
    ...pickObjectKeys(MenuNavBinding, [
        'Down',
        'Left',
        'Up',
        'Right',
        'Enter',
        'Exit',
    ]),

    ShipLeft: 'ship-left',
    ShipRight: 'ship-right',
    ShipShoot: 'ship-shoot',
} as const;

export type GameActionType = Values<typeof GameActionType>;

export type GameAction = [GameActionType, Uuid];
