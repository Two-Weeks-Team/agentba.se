import { cpSync, rmSync } from 'node:fs';

// Publish only the selected design's runtime assets, never research/QA captures.
rmSync('public/landing', { recursive: true, force: true });
cpSync('assets/landing', 'public/landing', { recursive: true });
