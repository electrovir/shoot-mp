import {log} from '@augment-vir/common';
import {readFile} from 'node:fs/promises';
import {join, relative, resolve} from 'node:path';
import {defineShape, optional, or, parseJsonWithShape} from 'object-shape-tester';

const monoRepoDirPath = resolve(import.meta.dirname, '..', '..', '..');
const notCommittedDirPath = join(monoRepoDirPath, '.not-committed');
const configJsonFilePath = join(notCommittedDirPath, 'config.json');

const configFileShape = defineShape(
    {
        /** The origin that game players will connect from. */
        frontend: optional(or(undefined, '')),
        /** The backend which the frontend will connect to. */
        backend: optional(or(undefined, '')),
    },
    true,
);

export type Config = typeof configFileShape.runtimeType;

export async function readConfig(): Promise<undefined | Config> {
    try {
        const fileContents = String(await readFile(configJsonFilePath));
        const parsedOutput = parseJsonWithShape(fileContents, configFileShape);

        return parsedOutput;
    } catch {
        log.warning(
            `Failed to parse config file at '${relative(process.cwd(), configJsonFilePath)}'`,
        );
        return undefined;
    }
}
