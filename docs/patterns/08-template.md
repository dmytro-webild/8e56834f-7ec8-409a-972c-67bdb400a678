# 08 — This project's template

Built from the designer template **cobalt**. Sections are React components under `src/components/sections/<category>/`; the page (`src/pages/HomePage.tsx`) composes them and holds ALL content in their props. Navbar + footer live in `src/components/Layout.tsx`.

- Content edits → change the props in the page/Layout, never fork the component.
- Structural edits → edit the component file in place (keep its props interface).
- New section → reuse a component from the same template family or write one in the same visual language; wrap it in `<div id data-webild-section data-webild-section-id>` like its siblings.
- Backgrounds are GLOBAL: the page already renders its atmosphere (fixed background primitive in HomePage / section surfaces). A new section is transparent or `bg-background`/`bg-muted` — never its own background primitive, shader or gradient.
- 3D is page-level too: keep `ModelStage`, `ParticleYardStage`, `ParticleDriftStage`, `TerrainDotStage` and their `src`/`modelSrc`/`variant`/`shape` props as they are unless the user asks to change the 3D, and never add a second 3D canvas. Keep the section wrappers' `data-*` attributes (`data-terrain`, `data-scene`): the stage reads them; give a new section a `data-terrain` like its neighbours.
- New page → also add it to the navbar: the `navItems` prop of the navbar component in `src/components/Layout.tsx` (`{ name, href: '/<slug>' }`), and switch in-page anchors to `/#anchor` so they work from the new page.
- Sections used: HeroFluidDashboard, FeaturesFluidUseCases, IntegrationsTileGrid, PricingFluidPlans, ContactFluidForm.
