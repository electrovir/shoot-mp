import {defineConfig} from '@virmator/frontend/configs/vite.config.base.ts';
import {resolve} from 'node:path';

const isProd = !!process.env.CI;

export default defineConfig(
    {
        forGitHubPages: true,
        packageDirPath: resolve(import.meta.dirname, '..'),
    },
    (baseConfig) => {
        return {
            ...baseConfig,
            define: {
                VITE_INJECTED_DATA: JSON.stringify({
                    prodOrigin: isProd ? 'https://backend.mp.electrovir.com' : '',
                }),
            },
        };
    },
);
