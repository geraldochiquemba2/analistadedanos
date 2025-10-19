# Design Guidelines: Agente de Análise de Danos com Groq API

## Design Approach
**Selected System:** Material Design 3 with professional customization
**Rationale:** Enterprise-grade damage assessment tool requiring trustworthy presentation, clear data hierarchy, and professional credibility. Material Design provides robust components for forms, image handling, and structured data display while maintaining modern aesthetics.

## Core Design Principles
1. **Professional Trust:** Inspire confidence through clean layouts and authoritative design
2. **Visual Clarity:** Prioritize readability of analysis results and damage reports
3. **Guided Workflow:** Clear progression from upload → analysis → results
4. **Data Hierarchy:** Structured presentation of complex damage assessments

## Color Palette

### Light Mode
- **Primary:** 210 85% 45% (Professional blue - trust and authority)
- **Primary Container:** 210 90% 95%
- **Secondary:** 195 70% 40% (Supporting teal for accents)
- **Surface:** 0 0% 98%
- **Surface Container:** 210 15% 96%
- **Error:** 0 72% 51% (Critical damage indicators)
- **Success:** 142 71% 45% (Minor damage or completed analysis)
- **Warning:** 38 92% 50% (Moderate damage)
- **Text Primary:** 220 15% 20%
- **Text Secondary:** 220 10% 45%

### Dark Mode
- **Primary:** 210 85% 65%
- **Primary Container:** 210 60% 25%
- **Secondary:** 195 65% 55%
- **Surface:** 220 15% 11%
- **Surface Container:** 220 15% 16%
- **Error:** 0 72% 60%
- **Success:** 142 65% 55%
- **Warning:** 38 85% 60%
- **Text Primary:** 0 0% 95%
- **Text Secondary:** 0 0% 70%

## Typography
- **Primary Font:** 'Inter' from Google Fonts (clarity, professional)
- **Monospace Font:** 'JetBrains Mono' for technical details/IDs
- **Headings:** 
  - H1: 2.5rem/3rem, font-semibold (Main title)
  - H2: 1.875rem/2.25rem, font-semibold (Section headers)
  - H3: 1.5rem/2rem, font-medium (Subsections)
- **Body:** 1rem/1.5rem, font-normal
- **Small:** 0.875rem/1.25rem (metadata, timestamps)

## Layout System
**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 24
- Container max-width: 1280px (max-w-7xl)
- Section padding: py-16 desktop, py-12 mobile
- Card padding: p-6 to p-8
- Component gaps: gap-6 for major sections, gap-4 for related items

## Component Library

### Navigation
- **Top Bar:** Sticky header with logo, app title "Análise de Danos IA", history access
- **Height:** h-16
- **Styling:** backdrop-blur with semi-transparent background
- **Actions:** Primary CTA "Nova Análise" button always visible

### Upload Interface
- **Drag & Drop Zone:** Large, dashed border area (min-h-64)
- **Visual Feedback:** Blue border on drag-over, file preview thumbnails in grid
- **Multiple Files:** Grid display with remove buttons, max 10 images
- **Description Field:** Textarea with 4-row minimum height, character counter
- **Submit Button:** Large, full-width primary button "Analisar Danos"

### Analysis Display (Results)
- **Header Card:** Summary statistics (total items, severity classification)
- **Status Indicator:** Color-coded severity badge (success/warning/error)
- **Damage Categories:** Accordion-style sections expandable by category
- **Item Cards:** Each damaged item as distinct card with:
  - Item name/type as heading
  - Damage severity indicator
  - Detailed description
  - Estimated impact level
- **Visual Hierarchy:** Use surface-container backgrounds for nested information

### History Sidebar/Panel
- **List View:** Chronological list with timestamps
- **Preview Cards:** Mini cards showing date, number of items analyzed, severity
- **Click Action:** Load full report in main view
- **Search/Filter:** Input field to filter by date or item type

### Loading States
- **Analysis Progress:** Linear progress bar with percentage
- **Skeleton Loaders:** For report sections while processing
- **Status Messages:** "Analisando imagens..." with animated icon

### Data Visualization
- **Severity Distribution:** Horizontal bar chart showing damage levels
- **Category Breakdown:** Pill-style tags showing item categories found
- **Timeline:** If multiple analyses, show damage progression

### Modals & Overlays
- **Image Lightbox:** Full-screen image viewer for uploaded photos
- **Confirmation Dialogs:** For deleting history entries
- **Export Options:** PDF/JSON download modal

## Images
**Hero Section:** No traditional hero - this is a utility application
**In-App Images:**
- Uploaded damage photos displayed in responsive grid (2-3 columns desktop, 1 mobile)
- Image previews with 16:9 aspect ratio containers
- Zoom/expand functionality for detailed inspection
- Placeholder illustrations for empty states (upload area, no history)

## Interactions & Micro-animations
- **Button States:** Subtle scale on hover (scale-105), active state feedback
- **Card Hover:** Gentle elevation increase on history items
- **Loading:** Spinner during API calls, smooth fade-in for results
- **Minimize Distractions:** No unnecessary animations - focus on clarity

## Accessibility
- Maintain WCAG AA contrast ratios throughout
- All interactive elements keyboard accessible
- Screen reader labels for upload zones and analysis results
- Focus indicators clearly visible in both themes
- Error messages associated with form fields

## Responsive Behavior
- **Mobile First:** Stack all columns, full-width cards
- **Tablet (md:):** 2-column layout for image grid, side-by-side comparisons
- **Desktop (lg:):** 3-column image grid, sidebar history panel, wider content area
- **Breakpoints:** Follow Tailwind defaults (640px, 768px, 1024px, 1280px)

## Special Considerations
- **Portuguese Language:** All UI text, labels, and generated content in PT-BR
- **Professional Tone:** Formal language in reports, clear technical terminology
- **Trust Signals:** Display "Powered by Groq AI" badge, processing transparency
- **Data Privacy:** Indicate local processing, no permanent storage messaging
- **Export Ready:** Reports formatted for professional documentation/insurance claims