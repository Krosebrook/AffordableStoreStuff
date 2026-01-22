# FlashFusion v2.1 Design Guidelines

## Design Approach
**Reference-Based:** Drawing from Linear's dashboard clarity, Vercel's dark theme execution, and Stripe's premium aesthetic. Custom glass-morphism system optimized for SaaS platforms.

## Core Design Principles
- **Premium Dark Foundation:** Deep backgrounds with elevated glass surfaces
- **Gradient Accents:** Vibrant gradients for CTAs, highlights, and feature emphasis
- **Depth Through Layering:** Glass-morphism creates hierarchy and visual interest
- **Futuristic Polish:** Subtle animations, smooth transitions, premium micro-interactions

---

## Typography System

**Font Families:**
- Primary: Inter (UI, body text, data)
- Display: Space Grotesk (headings, hero, feature titles)

**Scale:**
- Hero Display: 4xl-6xl, font-bold, tracking-tight
- Section Headings: 2xl-3xl, font-semibold
- Card Titles: lg-xl, font-medium
- Body Text: base, font-normal
- Labels/Meta: sm-xs, font-medium, uppercase tracking-wide

---

## Layout System

**Spacing Primitives:** Tailwind units 2, 4, 6, 8, 12, 16, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6
- Grid gaps: gap-4 to gap-6

**Container Strategy:**
- Dashboard: max-w-screen-2xl with side navigation
- Marketing pages: max-w-7xl centered
- Content blocks: max-w-4xl for readability

---

## Component Library

### Navigation
**Top Navigation:** Fixed glass nav bar with backdrop-blur, logo left, main links center, user profile/notifications right. Height: h-16. Background: bg-black/40 with border-b border-white/10

**Sidebar (Dashboard):** w-64 fixed glass sidebar, sections with icon+label navigation items, collapsed state to icon-only on smaller screens

### Hero Section
**Layout:** Full-width gradient background (subtle purple-to-blue), centered content with max-w-4xl. Two-column split on desktop: left side headline/description/CTAs, right side futuristic AI illustration/dashboard preview mockup image.

**Hero Image:** Abstract 3D rendered AI/tech visualization showing interconnected nodes, data streams, or holographic interface elements. Style: glowing purple/blue gradient tones matching brand, floating in dark space with depth-of-field blur.

**CTA Buttons:** Primary gradient button (purple-to-pink), secondary glass button with border. Both with backdrop-blur background when over images.

### Dashboard Cards
**Glass Card Pattern:** bg-white/5, backdrop-blur-xl, border border-white/10, rounded-2xl, p-6. Hover: subtle border glow with gradient

**Analytics Cards:** Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-4), each card shows metric title, large number display with gradient text, sparkline chart, percentage change indicator

**Chart Components:** Dark-themed charts with gradient fills, glowing accent colors, minimalist axes

### Product Catalog
**Product Cards:** Glass cards in grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3), product image top with gradient overlay on hover, title, price with gradient text, "Add to Cart" gradient button, wishlist icon top-right

**Filters Sidebar:** Left-aligned glass panel with categorized filter groups, checkboxes with custom glass styling, price range slider with gradient track

### Shopping Cart
**Slide-over Panel:** Right-side drawer, full-height glass panel with backdrop-blur, item list with thumbnails, quantity controls, subtotal section, gradient "Checkout" button at bottom

### AI Content Generators
**Tool Cards:** Large glass cards showcasing each AI tool (text generator, image creator, etc.), icon with gradient background, description, usage stats, "Launch Tool" gradient button

**Generator Interface:** Modal or full-page with split view - left side input form in glass container, right side live preview/output area with glass background

### Project Management
**Kanban Board:** Horizontal columns with glass backgrounds, drag-and-drop task cards (smaller glass cards), status indicators with gradient accents, member avatars

**Task Cards:** Compact glass cards with task title, assignee avatars, due date badge, priority indicator (gradient color-coded)

### Forms & Inputs
**Input Fields:** bg-white/5, border border-white/10, rounded-lg, p-3, focus state with gradient border glow

**Buttons:** Primary (gradient bg), Secondary (glass with border), Destructive (red gradient). All with subtle shadow and hover scale transform

### Data Tables
**Table Style:** Glass container, header with gradient text, rows with subtle hover bg-white/5, alternating row backgrounds for readability, action buttons in last column

---

## Visual Effects

**Glass-morphism Formula:**
- Background: bg-white/5 to bg-white/10
- Border: border-white/10 to border-white/20
- Blur: backdrop-blur-xl
- Shadow: subtle shadow-2xl with colored glow

**Gradient Accents:**
- Primary: purple (#8B5CF6) to pink (#EC4899)
- Secondary: blue (#3B82F6) to cyan (#06B6D4)
- Success: green (#10B981) to emerald (#059669)

**Elevation Layers:**
- Base: Dark background (#0a0a0a to #111)
- Layer 1: Glass cards (bg-white/5)
- Layer 2: Elevated modals/panels (bg-white/10)
- Layer 3: Popovers/tooltips (bg-white/15)

---

## Images

**Hero Image:** Required. 3D abstract tech visualization (1200x800px) with AI/network theme, purple-blue gradient glow, positioned right side of hero on desktop, full-width on mobile.

**Product Images:** Product catalog requires high-quality product photos (square format, 800x800px) with transparent or subtle gradient backgrounds.

**Dashboard Illustrations:** Small accent illustrations for empty states, onboarding - line art style with gradient strokes.

---

## Page-Specific Layouts

**Landing Page:** Hero with image → Feature grid (3-col) with glass cards → AI Tools showcase (2-col alternating) → Pricing table with glass cards → CTA section with gradient background → Footer

**Dashboard:** Sidebar navigation + Top bar → Stats grid (4-col) → Charts section (2-col) → Recent activity table → Quick actions panel

**Product Page:** Breadcrumb nav → Product gallery (left) + Details glass card (right) → Tabs (Description, Reviews, Related) → Footer

**Checkout:** Multi-step indicator → Order summary glass sidebar (right) → Form sections in glass cards (left) → Payment with security badges