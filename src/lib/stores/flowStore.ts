import { writable } from 'svelte/store';

type FlowStep = 'create' | 'join';

export const flowStep = writable<FlowStep>('create');
