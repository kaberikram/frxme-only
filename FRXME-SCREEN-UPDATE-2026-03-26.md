# FRXME Screen Material Update (2026-03-26)

## Objective

Replace the default `m_screen` material texture on the FRXME 3D model and display a custom video texture instead.

## Files Updated

- `components/FrxmePanel.tsx`

## Changes Implemented

1. **Removed default `m_screen` texture behavior**
   - Added explicit handling for material name `m_screen`.
   - Cleared all texture map slots to prevent baked/default textures from showing:
     - `map`, `alphaMap`, `aoMap`, `bumpMap`, `displacementMap`
     - `emissiveMap`, `lightMap`
     - `metalnessMap`, `normalMap`, `roughnessMap`, `envMap`

2. **Applied video as screen texture**
   - Integrated Drei video texture hook:
     - `useVideoTexture('/2a13e544-5795-4a4a-98d2-f504b623798d.mp4')`
   - Bound video texture to `m_screen` as:
     - `material.map`
     - `material.emissiveMap`
   - Tuned screen material to improve visibility:
     - `material.color = white`
     - `material.emissive = white`
     - `material.emissiveIntensity = 1`
     - `material.metalness = 0`
     - `material.roughness = 1`
     - `material.toneMapped = false`

3. **Fixed orientation issue**
   - Video appeared upside down initially.
   - Corrected UV orientation with:
     - `screenVideoTexture.repeat.set(1, -1)`
     - `screenVideoTexture.offset.set(0, 1)`

## Result

- `m_screen` no longer shows the GLB default texture.
- `m_screen` now displays the provided MP4 video from `public/2a13e544-5795-4a4a-98d2-f504b623798d.mp4`.
- Video orientation is corrected (no longer upside down).

## Notes for Handover

- Current implementation targets material name **exactly** `m_screen`.
- If a future model revision changes material naming, update the material match condition in `FrxmePanel.tsx`.
