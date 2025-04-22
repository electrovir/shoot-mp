import {assertValidShape, defineShape} from 'object-shape-tester';

const globalConfigShape = defineShape({
    prodOrigin: '',
});

export type GlobalConfig = typeof globalConfigShape.runtimeType;

declare let VITE_INJECTED_DATA: GlobalConfig;

export const globalConfig: GlobalConfig = VITE_INJECTED_DATA;

setTimeout(() => {
    assertValidShape(globalConfig, globalConfigShape);
});
