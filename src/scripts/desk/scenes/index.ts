import type { Scene } from '../types';
import { move } from './move';
import { resize } from './resize';
import { menu } from './menu';
import { close } from './close';
import { maximize } from './maximize';
import { workspace } from './workspace';
import { scroll } from './scroll';
import { switcher } from './switcher';

/** Every scene, in the order the story tells them. Each begins where the one before it ended. */
export const SCENES: Scene[] = [move, resize, menu, close, maximize, workspace, scroll, switcher];
export const sceneById = (id: string): Scene => SCENES.find((s) => s.id === id) || SCENES[0];
