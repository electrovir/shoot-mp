import {check, checkWrap} from '@augment-vir/assert';
import {
    arrayToObject,
    filterMap,
    getOrSet,
    log,
    omitObjectKeys,
    pickObjectKeys,
    Uuid,
    Values,
} from '@augment-vir/common';
import {MenuNavBinding} from '@game-vir/handle-input';
import {PlayerEntity} from './entities.js';
import {
    EntityUpdateParams,
    SerializedGameState,
    type EntityConstructorParams,
    type GameEntity,
    type GameState,
    type RegisteredEntities,
    type SerializedGameEntity,
} from './game-state.js';

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

    Init: 'init',
    Remove: 'remove',
} as const;

export type GameActionType = Values<typeof GameActionType>;

type GameActionData = {
    [GameActionType.Init]: SerializedGameState;
};

export type GameAction = Values<{
    [ActionType in GameActionType]: ActionType extends keyof GameActionData
        ? {
              type: ActionType;
              playerId: Uuid;
              data: GameActionData[ActionType];
          }
        : {
              type: ActionType;
              playerId: Uuid;
          };
}>;

export function performActions(
    rawActions: ReadonlyArray<GameAction>,
    gameState: GameState,
    currentPlayerId: Uuid,
): void {
    if (gameState.victor) {
        return;
    }

    const performedActions: Record<Uuid, Partial<Record<GameActionType, true>>> = {};

    rawActions.forEach((gameAction) => {
        if (performedActions[gameAction.playerId]?.[gameAction.type]) {
            /** Prevent the same action from being performed multiple times. */
            return;
        }
        getOrSet(performedActions, gameAction.playerId, () => {
            return {};
        })[gameAction.type] = true;

        const actionPlayer: PlayerEntity | undefined = checkWrap.instanceOf(
            gameState.playerEntities[gameAction.playerId],
            PlayerEntity,
        );

        if (gameAction.type === GameActionType.ShipLeft) {
            actionPlayer?.act('left');
        } else if (gameAction.type === GameActionType.ShipRight) {
            actionPlayer?.act('right');
        } else if (gameAction.type === GameActionType.ShipShoot) {
            actionPlayer?.act('shoot');
        } else if (gameAction.type === GameActionType.Init) {
            const newPlayerEntity = new PlayerEntity({
                creator: undefined,
                playerId: gameAction.playerId,
            });
            gameState.entities.push(newPlayerEntity);
            gameState.playerEntities[newPlayerEntity.playerId] = newPlayerEntity;
            if (gameAction.playerId !== currentPlayerId) {
                return;
            }

            gameState.victor = gameAction.data.victor;
            gameState.entities.push(
                ...deserializeEntities(
                    gameState.registeredEntities,
                    gameAction.data.entities,
                    undefined,
                ),
            );
            gameState.playerEntities = arrayToObject(gameState.entities, (entity) => {
                if (entity instanceof PlayerEntity) {
                    return {
                        key: entity.playerId,
                        value: entity,
                    };
                } else {
                    return undefined;
                }
            }) as Record<Uuid, PlayerEntity>;
        } else if (gameAction.type === GameActionType.Remove) {
            delete gameState.playerEntities[gameAction.playerId];
            gameState.entities = gameState.entities.filter(
                (entity) => entity.playerId !== gameAction.playerId,
            );
        }
    });

    updateEntities(gameState.entities, {gameState});
}

function updateEntities(entities: Readonly<GameEntity>[], params: EntityUpdateParams) {
    entities.forEach((entity, index) => {
        entity.update(params);
        if (entity.destroyed) {
            entities.splice(index, 1);
        }
        updateEntities(entity.entities, params);
    });
}

export function deserializeEntities(
    registeredEntities: Readonly<RegisteredEntities>,
    serializedEntities: ReadonlyArray<Readonly<SerializedGameEntity>>,
    creator: GameEntity | undefined,
): GameEntity[] {
    return filterMap(
        serializedEntities,
        (serializedEntity) => {
            const registeredEntity = registeredEntities[serializedEntity.entityKey];

            if (!registeredEntity) {
                log.warning(`Entity '${serializedEntity.entityKey}' does not exist.`);
                return undefined;
            }

            const newEntity = new registeredEntity({
                creator,
                playerId: serializedEntity.playerId,
            } satisfies EntityConstructorParams);

            Object.assign(newEntity, omitObjectKeys(serializedEntity, ['entities']));

            newEntity.entities = deserializeEntities(
                registeredEntities,
                serializedEntity.entities,
                newEntity,
            );

            return newEntity;
        },
        check.isDefined,
    );
}
