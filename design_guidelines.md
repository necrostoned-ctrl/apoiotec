# Design Guidelines: Technical Service Management Application

## Design Approach
**System-Based**: Utilizing Material Design 3 principles adapted for professional B2B context, emphasizing clarity, efficiency, and data hierarchy. The card-based architecture provides clear information grouping essential for service ticket management.

## Typography System
**Font Family**: Inter (Google Fonts) - exceptional legibility for data-heavy interfaces
- **Headings**: 
  - H1: text-3xl font-bold (Dashboard titles)
  - H2: text-2xl font-semibold (Section headers)
  - H3: text-xl font-semibold (Card titles)
- **Body**: text-base font-normal (General content)
- **Small**: text-sm (Labels, metadata, timestamps)
- **Tiny**: text-xs (Status badges, auxiliary info)

## Layout System
**Spacing Scale**: Tailwind units 2, 4, 6, 8, 12
- Card padding: p-6
- Section spacing: mb-8
- Element gaps: gap-4 for grids, gap-2 for tight groups
- Container max-width: max-w-7xl mx-auto px-4

**Grid Patterns**:
- Mobile: Single column
- Tablet (md:): 2 columns for cards
- Desktop (lg:): 3 columns for service ticket cards, 4 for stat cards

## Component Library

### Navigation
**Top Bar**: Sticky header with logo, search bar, notification bell, user avatar
- Height: h-16
- Shadow: shadow-md
- Search: Prominent centered search with icon (w-full md:w-96)

**Sidebar** (Desktop md:+): Collapsible navigation
- Width: w-64 expanded, w-16 collapsed
- Icons with labels for Dashboard, Tickets, Clientes, Técnicos, Relatórios

### Cards (Primary UI Pattern)
**Service Ticket Cards**:
- Rounded corners: rounded-lg
- Shadow: shadow-md hover:shadow-lg transition
- Header with ticket number + status badge
- Client name, device type, issue description
- Footer with assigned technician, priority indicator, date

**Stat Cards** (Dashboard):
- Compact design: p-4
- Large number display: text-3xl font-bold
- Label below: text-sm
- Icon top-right corner

### Status System
**Badges**: rounded-full px-3 py-1 text-xs font-semibold
- Aberto: Blue background variant
- Em Andamento: Green accent
- Aguardando Peças: Orange/yellow
- Concluído: Muted gray
- Cancelado: Red variant

### Forms
**Input Fields**:
- Height: h-12
- Rounded: rounded-lg
- Clear focus states with border emphasis
- Labels: text-sm font-medium mb-2
- Helper text: text-xs text-gray-500

**Buttons**:
- Primary: px-6 py-3 rounded-lg font-semibold
- Secondary: Outlined variant
- Icon buttons: w-10 h-10 rounded-full for actions

### Data Tables
**Structure**:
- Striped rows for readability
- Sticky header on scroll
- Row hover states
- Action column (right) with icon buttons
- Sortable columns with indicators
- Pagination at bottom

### Dashboard Layout
**Hero Section**: NO large hero image - dashboard opens directly to stats
- 4-stat card row (Tickets Abertos, Em Andamento, Concluídos Hoje, SLA Compliance)
- Recent activity feed card (left 2/3 width)
- Quick actions sidebar (right 1/3 width)

### Modal Overlays
- Backdrop: bg-black/50
- Content: max-w-2xl rounded-xl p-6
- Close button: top-right
- Form modals for creating/editing tickets

## Images
**Profile Photos**: Circular avatars for technicians and clients (w-10 h-10, larger w-16 h-16 in profiles)
**Device Photos**: Optional thumbnail in ticket cards (aspect-video, rounded-md)
**Company Logo**: Header top-left, compact size
**NO hero images** - this is a utility application, not marketing

## Accessibility
- ARIA labels on all interactive elements
- Focus visible states: ring-2 ring-offset-2
- Minimum touch targets: 44x44px
- High contrast text ratios maintained in both themes
- Screen reader friendly status announcements

## Animations
**Minimal & Purposeful**:
- Card hover lift: transform transition-transform hover:scale-[1.02]
- Page transitions: Fade in (opacity 0 to 1, 200ms)
- Status badge updates: Gentle color transition
- **NO** complex scroll animations, parallax, or decorative motion