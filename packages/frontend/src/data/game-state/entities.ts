import {arrayToObject, clamp, Coords, round, type Dimensions} from '@augment-vir/common';
import {isColliding} from '../collision.js';
import {
    EntityConstructorParams,
    EntityRenderParams,
    gameBoardSize,
    GameEntity,
    RegisteredEntities,
    type EntityUpdateParams,
    type SerializedGameEntity,
} from './game-state.js';

const bulletMovement = 5;
const playerSize = 20;

export class BulletEntity extends GameEntity {
    public static readonly entityKey = 'bullet';
    public override entityKey = 'bullet';
    public override readonly dimensions = {
        width: 4,
        height: 10,
    };

    public override position: Coords;

    constructor(params: EntityConstructorParams) {
        super(params);

        if (!(params.creator instanceof PlayerEntity)) {
            throw new TypeError(`Bullet cannot be created by '${params.creator?.entityKey}'`);
        }

        this.position = {
            y: -bulletMovement,
            x:
                params.creator.position.x +
                round(playerSize / 2 - this.dimensions.width / 2, {digits: 1}),
        };
    }
    public override act() {
        throw new Error('Bullet has no actions.');
    }

    public override update({gameState}: EntityUpdateParams) {
        if (this.position.y > gameBoardSize - playerSize + this.dimensions.height) {
            this.destroyed = true;
            return;
        }
        this.position.y += bulletMovement;

        if (
            Object.values(gameState.playerEntities).some(
                (player) =>
                    player.playerId !== this.playerId &&
                    isColliding(this, {
                        dimensions: player.dimensions,
                        position: {
                            x: player.position.x,
                            y: gameBoardSize - playerSize,
                        },
                    }),
            )
        ) {
            gameState.victor = this.playerId;
        }
    }
    public override render({currentPlayerId, renderContext}: EntityRenderParams): void {
        renderContext.fillStyle = this.playerId === currentPlayerId ? 'cyan' : 'pink';

        const yPosition =
            this.playerId === currentPlayerId
                ? gameBoardSize - playerSize - this.dimensions.height - this.position.y
                : playerSize + this.position.y;

        renderContext.fillRect(
            this.position.x,
            yPosition,
            this.dimensions.width,
            this.dimensions.height,
        );
    }
}

export class PlayerEntity extends GameEntity {
    public static readonly entityKey = 'player';
    public readonly entityKey = 'player';
    public override readonly dimensions: Dimensions = {
        width: playerSize,
        height: playerSize,
    };
    public updatesSinceLastShot = Infinity;

    public override position: Coords;

    constructor(params: EntityConstructorParams) {
        super(params);

        this.position = {
            y: 0,
            x: round(gameBoardSize / 2 - this.dimensions.width / 2, {digits: 1}),
        };
    }

    public override act(action: 'left' | 'right' | 'shoot' | 'die') {
        if (action === 'left') {
            this.position.x -= 1;
        } else if (action === 'right') {
            this.position.x += 1;
        } else if (action === 'shoot') {
            if (this.updatesSinceLastShot < 30) {
                return;
            }
            this.updatesSinceLastShot = 0;
            this.entities.push(
                new BulletEntity({
                    creator: this,
                    playerId: this.playerId,
                }),
            );
        } else {
            throw new Error(`Unsupported player action: '${String(action)}'`);
        }

        this.position = {
            x: clamp(this.position.x, {min: 0, max: gameBoardSize - playerSize}),
            y: 0,
        };
    }

    public override update() {
        this.updatesSinceLastShot++;
    }
    public override render({currentPlayerId, renderContext}: EntityRenderParams): void {
        if (this.playerId === currentPlayerId) {
            renderContext.fillStyle = 'blue';
            renderContext.fillRect(
                this.position.x,
                round(gameBoardSize - this.dimensions.width, {digits: 1}),
                this.dimensions.width,
                this.dimensions.height,
            );
        } else {
            renderContext.fillStyle = 'red';
            renderContext.fillRect(
                this.position.x,
                0,
                this.dimensions.width,
                this.dimensions.height,
            );
        }
    }
    public override serialize(): SerializedGameEntity {
        const basic = super.serialize();

        return {
            ...basic,
            updatesSinceLastShot: this.updatesSinceLastShot,
        };
    }
}

const entities = [
    PlayerEntity,
    BulletEntity,
];

export const registeredEntities: RegisteredEntities = arrayToObject(entities, (entity) => {
    return {
        key: entity.entityKey,
        value: entity,
    };
}) as Record<string, typeof BulletEntity>;
