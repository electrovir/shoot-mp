import {
    pickObjectKeys,
    type Coords,
    type Dimensions,
    type JsonCompatibleValue,
    type Uuid,
} from '@augment-vir/common';
import {type Constructor} from 'type-fest';

export type RegisteredEntities = Record<string, Constructor<GameEntity>>;

export type GameState = {
    playerEntities: Record<Uuid, GameEntity>;
    entities: GameEntity[];
    victor: undefined | Uuid;
    registeredEntities: RegisteredEntities;
};

export const startingGameState: Omit<GameState, 'registeredEntities'> = {
    playerEntities: {},
    entities: [],
    victor: undefined,
};

export const gameBoardSize = 200;

export type EntityRenderParams = {
    renderContext: CanvasRenderingContext2D;
    /** The id of the current machine's player. */
    currentPlayerId: Uuid;
};

export type EntityConstructorParams = {
    playerId: Uuid;
    creator: GameEntity | undefined;
};

export type EntityUpdateParams = {
    gameState: GameState;
};

export abstract class GameEntity {
    public abstract entityKey: string;
    public abstract position: Coords;
    public abstract dimensions: Dimensions;
    public abstract update(params: Readonly<EntityUpdateParams>): void;
    public abstract render(params: Readonly<EntityRenderParams>): void;
    public abstract act(action: string, entities: GameEntity[]): void;

    public entities: GameEntity[] = [];

    public playerId: Uuid;
    public constructor({playerId}: Readonly<Pick<EntityConstructorParams, 'playerId'>>) {
        this.playerId = playerId;
    }
    public destroyed = false as boolean;
    public serialize(): SerializedGameEntity {
        return {
            ...pickObjectKeys(this, [
                'entityKey',
                'playerId',
                'position',
            ]),
            entities: this.entities.map((entity) => entity.serialize()),
        };
    }
}

export type SerializedGameEntity = Pick<GameEntity, 'entityKey' | 'playerId' | 'position'> & {
    entities: SerializedGameEntity[];
} & {
    [key in string]: JsonCompatibleValue;
};

export type SerializedGameState = Pick<GameState, 'victor'> & {
    entities: SerializedGameEntity[];
};

export function serializeGameState(gameState: Readonly<GameState>): SerializedGameState {
    return {
        ...gameState,
        entities: gameState.entities.map((entity) => entity.serialize()),
    };
}
