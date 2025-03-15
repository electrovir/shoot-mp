import {getOrSet, round, type Dimensions, type Uuid} from '@augment-vir/common';
import {GameAction, GameActionType} from './game-action.js';

abstract class Entity {
    public abstract playerId: Uuid;
    public abstract destroyed: boolean;
    public abstract position: number;
    public abstract update(gameState: GameState): void;
}

class BulletEntity extends Entity {
    constructor(
        public override position: number,
        public override playerId: Uuid,
    ) {
        super();
    }

    public override update() {
        if (this.position > gameBoardSize + bulletDimensions.height) {
            this.destroyed = true;
            return;
        }
        this.position += 10;
    }

    public override destroyed = false;
}

export type GameState = {
    playerPositions: Record<Uuid, /** X coordinate */ number>;
    entities: Entity[];
    victory: undefined | 'self' | 'opponent';
};

const gameBoardSize = 200;
const playerSize = 20;
const playerStartPosition = round(gameBoardSize / 2 - playerSize / 2, {digits: 1});
const bulletDimensions: Dimensions = {
    width: 4,
    height: 10,
};
/** Offset from player position to a new bullet's position; */
const bulletOffset = round(playerSize / 2 - bulletDimensions.width / 2, {digits: 1});

export const startingGameState: GameState = {
    playerPositions: {},
    entities: [],
    victory: undefined,
};

export function performActions(rawActions: ReadonlyArray<GameAction>, gameState: GameState): void {
    const performedActions: Record<Uuid, Partial<Record<GameActionType, true>>> = {};

    rawActions.forEach(
        ([
            actionType,
            playerId,
        ]) => {
            if (performedActions[playerId]?.[actionType]) {
                /** Prevent the same action from being performed multiple times. */
                return;
            }
            getOrSet(performedActions, playerId, () => {
                return {};
            })[actionType] = true;

            const currentPlayerPosition =
                gameState.playerPositions[playerId] || playerStartPosition;

            if (actionType === GameActionType.ShipLeft) {
                gameState.playerPositions[playerId] = currentPlayerPosition - 1;
            } else if (actionType === GameActionType.ShipRight) {
                gameState.playerPositions[playerId] = currentPlayerPosition + 1;
            } else if (actionType === GameActionType.ShipShoot) {
                gameState.entities.push(
                    new BulletEntity(currentPlayerPosition + bulletOffset, playerId),
                );
            }
        },
    );

    gameState.entities.forEach((entity, index) => {
        entity.update(gameState);
        if (entity.destroyed) {
            gameState.entities.splice(index, 1);
        }
    });
}
