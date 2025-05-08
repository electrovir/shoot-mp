import {log} from '@augment-vir/common';
import {readFile} from 'node:fs/promises';
import {join, relative, resolve} from 'node:path';
import {defineShape, indexedKeys, parseJsonWithShape} from 'object-shape-tester';

const monoRepoDirPath = resolve(import.meta.dirname, '..', '..', '..');
const notCommittedDirPath = join(monoRepoDirPath, '.not-committed');
const configJsonFilePath = join(notCommittedDirPath, 'config.json');

/** A mapping of game ids to their required frontend origins. */
const configFileShape = defineShape(
    indexedKeys({
        keys: '',
        values: '',
        required: true,
    }),
    true,
);

export type Config = typeof configFileShape.runtimeType;

export async function readConfig(): Promise<Config> {
    try {
        const fileContents = String(await readFile(configJsonFilePath));
        const parsedOutput = parseJsonWithShape(fileContents, configFileShape);

        return parsedOutput;
    } catch {
        log.warning(
            `Failed to parse config file at '${relative(process.cwd(), configJsonFilePath)}'`,
        );
        return {};
    }
}
