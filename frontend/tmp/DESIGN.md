---
name: Serene Commerce
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#414752'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#717783'
  outline-variant: '#c1c6d4'
  surface-tint: '#005faf'
  primary: '#005dac'
  on-primary: '#ffffff'
  primary-container: '#1976d2'
  on-primary-container: '#fffdff'
  inverse-primary: '#a5c8ff'
  secondary: '#585f66'
  on-secondary: '#ffffff'
  secondary-container: '#dce3eb'
  on-secondary-container: '#5e656c'
  tertiary: '#944700'
  on-tertiary: '#ffffff'
  tertiary-container: '#ba5b00'
  on-tertiary-container: '#fffeff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a5c8ff'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#004786'
  secondary-fixed: '#dce3eb'
  secondary-fixed-dim: '#c0c7cf'
  on-secondary-fixed: '#151c22'
  on-secondary-fixed-variant: '#40484e'
  tertiary-fixed: '#ffdbc7'
  tertiary-fixed-dim: '#ffb688'
  on-tertiary-fixed: '#311300'
  on-tertiary-fixed-variant: '#733600'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is built to evoke a sense of serenity, reliability, and restorative rest. The brand personality is professional and authoritative yet approachable, positioning 'Quy Dung' as a specialist in sleep hygiene.

The visual style follows a **Minimalist-Modern** hybrid. It prioritizes clarity and breathability, utilizing generous whitespace to reflect the lightness of premium bedding. Every interface element is designed to feel intentional and uncluttered, reducing cognitive load for the customer to mirror the calming experience of a well-made bed.

## Colors

The palette is anchored by a trust-inducing primary blue, used strategically for calls to action and brand signifiers. The background remains a crisp, clinical white to emphasize product purity and cleanliness. 

- **Primary:** Used for primary buttons, active states, and key brand icons.
- **Secondary:** A soft tint used for subtle backgrounds, hover states, and categorizing content without competing with the primary action.
- **Neutral/Text:** A deep charcoal (#1A1A1A) provides high legibility while appearing softer and more modern than pure black.
- **Success/Error:** Reserved for functional feedback (e.g., "Added to Cart" or form validation).

## Typography

The typography strategy balances geometric modernity with high functional utility. 

**Manrope** is utilized for all headlines to provide a refined, balanced, and trustworthy appearance. Its open counters ensure readability at large scales while maintaining a premium boutique feel.

**Inter** is the workhorse for body copy and labels. Its systematic, neutral design ensures that product descriptions and technical specifications are effortless to digest. It provides the "professional" edge required for an e-commerce platform where clarity is paramount.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop and tablet, transitioning to a fluid model for mobile devices. The layout is structured around a 12-column grid with a maximum container width of 1280px.

The spacing rhythm is strictly based on an 8px scale. 
- Use **48px to 80px (lg/xl)** for vertical section padding to maintain the "minimal" and "breathable" aesthetic.
- Use **24px (md)** for gutters and internal component spacing (e.g., between product cards in a row).
- Use **12px (sm)** for tight groupings, such as text within a card or label-to-input relationships.

## Elevation & Depth

To maintain a professional and modern look, depth is communicated through **Ambient Shadows** rather than harsh borders. This mimics the soft, diffused light found in a bedroom setting.

- **Low Elevation:** A subtle 4px blur shadow used for resting product cards. This creates a gentle lift from the white background.
- **Medium Elevation:** An 8px - 16px blur shadow with low opacity (approx. 6-8%) used for hover states and dropdown menus.
- **High Elevation:** Reserved for modals and floating cart drawers, using a 32px blur to suggest significant proximity to the user.
- **Tonal Depth:** Surfaces that are not "raised" should use the Secondary Blue tint (#F0F7FF) to distinguish sections (e.g., a newsletter sign-up strip or a product specifications table).

## Shapes

The shape language is defined by **rounded corners (8px)** to evoke comfort and friendliness, contrasting with the structured layout.

All interactive elements—including primary buttons, text inputs, and product image containers—must adhere to the 8px radius. Secondary elements like tags or "chips" may use a fully pill-shaped (rounded-full) radius to distinguish them as metadata rather than primary structural elements.

## Components

### Buttons
- **Primary:** Solid #1976D2 with white text. 8px rounded corners. Heavy weight Manrope text.
- **Secondary:** Outline variant with 1px border in Primary Blue or a ghost button for less critical actions.

### Product Cards
- Clean white background with a Low Elevation shadow.
- The 8px radius is applied to the entire card container and the image within it.
- Title in H3 (Small) and price in a contrasting bold weight.

### Input Fields
- 1px border in a light neutral grey, switching to Primary Blue on focus.
- 8px rounded corners.
- Internal padding of 12px (sm) for a spacious, easy-to-tap feel.

### Selection Controls
- Checkboxes and Radios should use the Primary Blue for selected states.
- Fabric swatches (crucial for bedding) should be circular with a 2px stroke active state to distinguish color/texture selection clearly.

### Navigation
- A sticky top header with a slight backdrop blur and a fine 1px bottom border (#EEEEEE) to maintain hierarchy during scrolling.