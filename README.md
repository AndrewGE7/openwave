# OpenWave

OpenWave is an original, browser-based audio session designer. It uses the Web Audio API for realtime playback and client-side WAV export, with no backend, tracking, or account required.

The core was inspired by the workflow of classic brainwave tools, but the code and included presets were written independently.

## Current web build

- Binaural, monaural amplitude-modulation, isochronic, and white/pink/brown noise modes
- Multi-segment timeline with carrier, rate, depth, pan, volume, and ramp controls
- Gentle starting templates and browser-local custom presets
- Realtime playback and offline WAV rendering
- CSV preset import, theme selection, preset notes, and descriptions
- Optional visual strobe, off by default and capped at 12 Hz

Open `index.html` in a current browser or serve the repository as a static site. There is no build step.

## Safety and scope

Start at low volume. Avoid the optional visual strobe if you are photosensitive or unsure of your sensitivity. Do not use awareness-reducing audio while driving or operating equipment. Stop immediately if you feel discomfort.

OpenWave is provided for general comfort, relaxation, focus, noise masking, and experimentation. It is not a medical device; it is not intended to diagnose, treat, cure, or prevent disease; and it does not block or neutralize EMF or radiation.

## Repository plan

This repository begins with the verified static web build. Electron, Tauri, Android, asset-manager, adaptive-sleep, biofeedback, mixer, updater, and expanded preset packages from the development archive will be reviewed and integrated in separate, testable milestones.

## License

The core application is available under the [MIT License](LICENSE). Add-on packages should be reviewed before they are incorporated into a public release.

Project page: https://ageoldllc.com/projects/openwave
