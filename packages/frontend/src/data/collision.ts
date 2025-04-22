import {type GameEntity} from './game-state/game-state.js';

export function isColliding(
    a: Readonly<Pick<GameEntity, 'dimensions' | 'position'>>,
    b: Readonly<Pick<GameEntity, 'dimensions' | 'position'>>,
): boolean {
    return (
        a.position.x < b.position.x + b.dimensions.width &&
        a.position.x + a.dimensions.width > b.position.x &&
        a.position.y < b.position.y + b.dimensions.height &&
        a.position.y + a.dimensions.height > b.position.y
    );
}
