# 07 — Motion & Shaders (GSAP + WebGL)

Webild sites are expected to MOVE. Beyond the entrance fades in `05-animation`,
use GSAP for scroll-driven storytelling and WebGL fragment shaders for living
backgrounds. Write the timelines and the GLSL yourself — two small host
components handle the plumbing.

## Intensity — read it from the brief

| Brief says | Level | What to ship |
|---|---|---|
| calm, minimal, corporate, clean | **subtle** | entrance reveals only (ScrollReveal / TextAnimation / motion) |
| modern, bold, creative, premium (default for agencies, studios, tech, fashion) | **expressive** | hero: shader background OR SplitText headline reveal; 1–2 sections with GSAP scroll effects |
| "insane", "wow", "crazy", "immersive", "awwwards", "gsap", "shader", "3D" | **insane** | hero: shader background + SplitText reveal; pinned or horizontal-scroll showcase; scrubbed parallax on media; staggered card choreography; at most 2 shaders per page |

Never let motion hide content: animate **from** a hidden state (`gsap.from`), so
the page is fully readable without JS and under `prefers-reduced-motion`
(both hosts already skip animation in that case).

## GsapScene — host for GSAP timelines

```tsx
import GsapScene from '@/components/effects/GsapScene';

<GsapScene
  className="…"
  setup={({ gsap, q, root, isMobile }) => {
    gsap.from(q('.card'), {
      y: 60, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: root, start: 'top 75%' },
    });
  }}
>
  …children with the classes you target…
</GsapScene>
```

`setup` receives `{ root, gsap, ScrollTrigger, SplitText, q, isMobile }`.
Plugins (ScrollTrigger, SplitText, DrawSVGPlugin) are registered; everything
created inside `setup` is reverted on unmount. Target elements by class inside
the scene (`q('.x')`) — never global selectors. Use `isMobile` to drop pinning
and shorten distances on phones.

### Recipes

**Headline split reveal (hero)**
```ts
setup={({ gsap, SplitText, q }) => {
  const split = SplitText.create(q('.headline')[0], { type: 'words,chars', mask: 'words' });
  gsap.from(split.chars, { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.015 });
}}
```

**Scrubbed parallax on media**
```ts
setup={({ gsap, q, root }) => {
  gsap.to(q('.parallax-img'), {
    yPercent: -18, ease: 'none',
    scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}}
```
(Give the image wrapper `overflow-hidden` and the image `scale-110` so the
movement never reveals an edge.)

**Pinned horizontal scroll showcase** (desktop only)
```ts
setup={({ gsap, q, root, isMobile }) => {
  if (isMobile) return; // on phones the track stays a normal vertical stack
  const track = q('.h-track')[0];
  gsap.to(track, {
    x: () => -(track.scrollWidth - root.clientWidth), ease: 'none',
    scrollTrigger: { trigger: root, pin: true, scrub: 1, end: () => `+=${track.scrollWidth}`, invalidateOnRefresh: true },
  });
}}
```
Markup: `root` is the full-width section content; `.h-track` is
`flex gap-6 w-max` on desktop and `flex-col` on mobile (`flex-col md:flex-row`).

**Card choreography**
```ts
setup={({ gsap, q, root }) => {
  gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 70%' } })
    .from(q('.card'), { y: 80, rotate: 3, opacity: 0, stagger: 0.1, duration: 1, ease: 'power4.out' })
    .from(q('.card-icon'), { scale: 0, stagger: 0.1, ease: 'back.out(2)' }, '-=0.6');
}}
```

**Scroll-scrubbed counter / progress line**
```ts
setup={({ gsap, q, root }) => {
  gsap.from(q('.progress'), { scaleX: 0, transformOrigin: 'left', ease: 'none',
    scrollTrigger: { trigger: root, start: 'top 80%', end: 'bottom 40%', scrub: true } });
}}
```

**SVG line draw** (DrawSVGPlugin)
```ts
setup={({ gsap, q, root }) => {
  gsap.from(q('.draw path'), { drawSVG: 0, duration: 1.6, ease: 'power2.inOut',
    scrollTrigger: { trigger: root, start: 'top 70%' } });
}}
```

## ShaderCanvas — host for fragment shaders

```tsx
import ShaderCanvas from '@/components/effects/ShaderCanvas';

<section className="relative overflow-hidden bg-background …">
  <ShaderCanvas fragmentShader={`…GLSL…`} colors={['--primary', '--background', '--accent']} />
  <div className="absolute inset-0 bg-background/40" />          {/* legibility veil */}
  <div className="relative z-10 …">…content…</div>
</section>
```

Uniforms provided: `u_time` (s), `u_resolution` (px), `u_mouse` (0..1, eased),
`u_color0..u_color3` (from `colors`, theme CSS variables or hex — so the
shader follows the site palette and the color editor). Write only
`void main(){ … gl_FragColor = vec4(…); }` in GLSL ES 1.0 (precision and
uniforms are prepended). Keep the parent's CSS background: it is the fallback
when WebGL is unavailable. Always put a veil or strong contrast between shader
and text.

Pass the shader as a template literal. Keep loops ≤ 6 octaves; no textures.

### Shader recipes (adapt, don't copy blindly — tune speed/scale/colors)

**Flowing gradient mesh** — calm premium hero
```glsl
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.15;
  float a = sin(uv.x * 3.0 + t) * 0.5 + 0.5;
  float b = cos(uv.y * 2.5 - t * 1.3 + uv.x) * 0.5 + 0.5;
  vec3 col = mix(mix(u_color1, u_color0, a), u_color2, b * 0.6);
  col += 0.08 * sin(10.0 * (uv.x + uv.y) + t * 4.0);
  gl_FragColor = vec4(col, 1.0);
}
```

**Aurora noise** — expressive, dark themes
```glsl
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.08;
  float n = fbm(vec2(uv.x * 3.0 + t, uv.y * 1.5 - t));
  float band = smoothstep(0.35, 0.75, n) * smoothstep(0.0, 0.7, uv.y);
  vec3 col = mix(u_color1, u_color0, band);
  col = mix(col, u_color2, smoothstep(0.6, 0.9, n) * 0.5);
  gl_FragColor = vec4(col, 1.0);
}
```

**Mouse-reactive glow** — interactive, any theme
```glsl
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 m = u_mouse;
  float d = distance(uv * vec2(u_resolution.x / u_resolution.y, 1.0), m * vec2(u_resolution.x / u_resolution.y, 1.0));
  float glow = exp(-d * 3.5) * (0.8 + 0.2 * sin(u_time * 2.0));
  vec3 col = mix(u_color1, u_color0, glow);
  gl_FragColor = vec4(col, 1.0);
}
```

**Liquid blobs (metaballs)** — insane, playful brands
```glsl
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float t = u_time * 0.5;
  float f = 0.0;
  for (int i = 0; i < 5; i++){
    float fi = float(i);
    vec2 c = 0.35 * vec2(sin(t * (0.7 + fi * 0.13) + fi * 1.7), cos(t * (0.9 + fi * 0.11) + fi * 2.3));
    f += 0.018 / dot(uv - c, uv - c);
  }
  float edge = smoothstep(0.9, 1.1, f);
  vec3 col = mix(u_color1, mix(u_color0, u_color2, uv.y + 0.5), edge);
  gl_FragColor = vec4(col, 1.0);
}
```

**Film-grain gradient** — editorial, subtle texture
```glsl
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = mix(u_color1, u_color0, smoothstep(0.0, 1.2, uv.x * 0.6 + uv.y * 0.8 + 0.1 * sin(u_time * 0.3)));
  col += (hash(uv * u_resolution + fract(u_time)) - 0.5) * 0.06;
  gl_FragColor = vec4(col, 1.0);
}
```

## Budget & safety

- Max **2** ShaderCanvas per page; pin at most **1** section. Shaders pause
  off-screen automatically.
- Every animated element must also look right in its final state (no
  `opacity-0` classes in markup — GSAP sets the start state).
- Imports allowed for motion: `gsap`, `gsap/ScrollTrigger`, `gsap/SplitText`,
  `gsap/DrawSVGPlugin`, `@gsap/react`, `@/components/effects/GsapScene`,
  `@/components/effects/ShaderCanvas`.
