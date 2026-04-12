# Design System Document: Swiss Editorial Modernism

## 1. Overview & Creative North Star
The **Creative North Star** for this design system is **"The Digital Broadside."** 

This system rejects the "SaaS-standard" layout of cards and shadows in favor of a high-end editorial experience. It draws inspiration from mid-century Swiss graphic design—specifically the International Typographic Style—reimagined for a modern, tactile digital age. It treats the browser as a sheet of premium, heavy-weight paper.

We achieve a custom, premium feel through:
*   **The Tension of Contrasts:** We pair sharp, structural 1px dividers (0px radius) with soft, organic container corners (12-16px).
*   **Asymmetric Breathing Room:** We use intentional whitespace and asymmetrical grid placement to guide the eye, rather than filling every pixel.
*   **Tactile Depth:** By layering varying "paper" tones (Soft Cream to Surface-Container-High) and selective glassmorphism, we create a sense of physical objects resting on a desk.

---

## 2. Colors
Our palette is rooted in the "Modern Paper" concept. We use tonal depth rather than heavy ornamentation.

### Core Palette
*   **Background (`#fbf9f4`):** The primary canvas. A soft, tactile cream that reduces eye strain and feels more expensive than pure white.
*   **On-Background (`#1b1c19`):** Our "Ink." Used for all primary body text to maintain a high-contrast, editorial feel.
*   **Primary (`#b02600`):** Vibrant Signal Red. Reserved for high-priority CTAs and brand moments.
*   **Secondary (`#0058be`):** Glow Blue. Used exclusively for interactive elements like links, progress bars, and active states.

### The "No-Line" Rule for Sectioning
While the user requested 1px separator lines for the grid, they must **never** be used to wrap sections or create boxes. 
*   **Boundaries** are defined solely through background color shifts. For example, a header might sit on `surface`, while the main content area shifts to `surface-container-low`.
*   **The Grid:** Use the 1px `on-surface` line only for vertical or horizontal "structural breaks" that mimic a newspaper column, never a closed box.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of paper. 
1.  **Level 0 (Base):** `surface` (`#fbf9f4`)
2.  **Level 1 (Sections):** `surface-container-low` (`#f5f3ee`)
3.  **Level 2 (Cards/Interactions):** `surface-container` (`#f0eee9`) or `surface-container-highest` (`#e4e2dd`) for emphasis.

### Signature Textures
To move beyond a flat look, apply a subtle gradient to the **Primary CTA**. Use a linear transition from `primary` (`#b02600`) to `primary_container` (`#dd3200`) at a 135-degree angle. This adds a "lithographic" quality to buttons.

---

## 3. Typography
We use **Inter** as a structural powerhouse. The hierarchy is designed to mirror a premium magazine layout.

*   **Display (Large/Medium):** Set to **Extra Bold**. Use negative letter-spacing (-0.02em) to create a "tight" editorial headline feel.
*   **Headline & Titles:** Set to **Bold**. These are the anchors of your layout. Use them to break the grid—don't be afraid to let a headline span across 8 columns of a 12-column grid.
*   **Body (Large/Medium):** Set to **Medium (500)** or **Regular (400)**. Line height should be generous (1.6) to emphasize the "Modern Paper" readability.
*   **Labels:** Small, **Semi-Bold**, and often Uppercase with +0.05em letter spacing to provide a technical, Swiss-style contrast to the organic body text.

---

## 4. Elevation & Depth
In this system, depth is **felt**, not seen. We avoid the heavy drop shadows of the early 2010s.

*   **Tonal Layering:** Most hierarchy is achieved by placing a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft "lift" via color value.
*   **Ambient Shadows:** If a component (like a floating modal or a FAB) must float, use an **Ambient Shadow**:
    *   `box-shadow: 0 20px 40px rgba(27, 28, 25, 0.06);` (A tinted version of our `on-surface` black).
*   **The Ghost Border:** For input fields or cards where definition is required against a similar background, use `outline-variant` at **15% opacity**. This provides a "suggestion" of a boundary without cluttering the editorial aesthetic.
*   **Glassmorphism:** Use `backdrop-blur: 12px` on overlays using a semi-transparent `surface_container_lowest` (80% opacity). This allows the "Paper" background to bleed through, maintaining a sense of place.

---

## 5. Components

### Buttons
*   **Primary:** Sharp 1px black outline for "Secondary" buttons; **Primary** buttons use `primary` red with a 12px corner radius. No shadow.
*   **Tertiary:** Text-only in `secondary` Glow Blue, bold weight, with an underline that appears only on hover.

### Cards
*   **Rule:** Forbid divider lines within cards.
*   **Separation:** Use vertical whitespace (e.g., 24px or 32px) to separate the title from the body.
*   **Style:** `surface-container-lowest` background, 16px corner radius, and a "Ghost Border."

### Input Fields
*   **Style:** 1px `on-surface` border for the bottom only (editorial style), or a fully enclosed box with a 12px radius and a `surface-container-high` background.
*   **Focus State:** The border transitions to `secondary` (Glow Blue) with a subtle 2px glow.

### Separators
*   **Implementation:** Vertical or horizontal 1px lines in `on-surface` black. These should be "hanging"—meaning they don't always connect to other lines, creating an open, airy grid.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts. Place a large headline on the left and a small body paragraph on the far right, leaving the center empty.
*   **Do** use Signal Red (`primary`) sparingly. It is a "Signal," not a decoration.
*   **Do** favor large typography over icons. Let the words do the heavy lifting.
*   **Do** use the 1px black lines to create "anchor points" for your text to sit on.

### Don't:
*   **Don't** use standard grey shadows. Shadows must always be low-opacity and slightly tinted by the background.
*   **Don't** wrap everything in a box. Use the "No-Line" rule for sectioning to keep the layout feeling open.
*   **Don't** use rounded corners on your 1px separator lines. Dividers must be sharp and precise.
*   **Don't** overcrowd. If a screen feels "busy," increase the whitespace between sections by 2x.

### Accessibility Note:
While we utilize low-opacity borders ("Ghost Borders"), ensure that the contrast between text (`on-surface`) and background (`surface`) always meets WCAG AAA standards for readability. The signal red and glow blue must only be used for interactive states to maintain a clear "Color = Action" mental model for the user.