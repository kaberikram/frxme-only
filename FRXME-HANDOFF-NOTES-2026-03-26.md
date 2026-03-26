# FRXME Handoff Notes (2026-03-26)

Use this as the prompt context for another AI to reproduce/refine the same work in a copied repo.

## Goal Completed

- Kept desktop experience intact.
- Made mobile flow readable and usable across all scroll phases.
- Tuned 3D motion transitions to feel smoother and avoid awkward camera jumps.
- Removed Gemini/env wiring from the boilerplate.
- Documented clone/build/deploy flow in README for handoff.

## Key Product/UX Changes

### 1) Mobile content layout fixes (major)

- Converted core info/customization overlays to mobile-friendly card presentation while preserving desktop alignment:
  - Specifications
  - Purpose / Use Case
  - Finish (color picker)
  - Branding (logo picker)
  - Features now has a background treatment for readability.
- Added stronger mobile contrast/readability:
  - background blur + border cards
  - mobile text size/spacing adjustments
- Improved interaction affordance:
  - larger touch targets for color/logo options
  - horizontal scrolling rows for option groups

### 2) Mobile model framing and camera/motion behavior

- Added mobile-specific motion tuning in `FrxmePanel.tsx`:
  - reduced side offsets
  - centered framing for info-heavy sections
  - tuned Y/Z position for better overlap avoidance with cards
- Ensured Features shares Purpose positioning behavior (no unnecessary transition drift).
- Held center framing through Branding/Request Access phases where needed.
- Added shortest-path angular interpolation so rotations return to center via the nearest path (no long spin).
- Added smoothed scroll-driven motion (damped progression and damped transforms) for a more premium feel.

### 3) Transition bug fixes in scroll phases

- Smoothed Specs -> Purpose depth handoff to remove the brief zoom-in/zoom-out wobble.
- Added targeted mobile X-lock during Specs -> Purpose to prevent temporary offset detours.
- Adjusted CTA timing to align with Branding visibility.
- Tuned branding panel vertical spacing to reduce overlap with CTA and 3D model.

### 4) Color picker mobile clipping fixes

- Reduced swatch and spacing sizes on mobile.
- Added scroller padding + `shrink-0` handling to avoid edge clipping.


## Tech/Code Changes Summary

- `components/Frxme.tsx`
  - mobile overlay/card layout and spacing tuning
  - CTA timing/position updates
  - color/logo picker mobile interaction updates
  - temporary postprocessing integration was removed for stability
- `components/FrxmePanel.tsx`
  - mobile position/rotation phase logic refinements
  - shortest-path rotation interpolation
  - damped motion smoothing
  - transition-lock logic for cleaner phase handoffs
- `vite.config.ts`
  - removed Gemini env define wiring
- `README.md`
  - converted to clone/build/deploy boilerplate guidance


## Suggested Prompt for AI

Use this prompt in the copied repo:

"Keep desktop layout unchanged. Improve mobile scroll-story UX for FRXME sections with bottom-card readability, centered 3D framing during info sections, smooth phase transitions (no long rotation paths or depth wobble), and touch-friendly color/logo controls.

