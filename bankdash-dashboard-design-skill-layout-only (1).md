# BankDash-Inspired Dashboard UI Skill — Layout/Design Only

## 1. Role of this file

This file is ONLY a visual design system and UI style reference.

It must define how the dashboard looks and behaves visually, but it must NOT define the final pages, final routes, final navigation labels, final business content, final metrics, final tables, or final dashboard modules.

The real pages and content will be provided in a separate content MD file.

Use this file as the visual layer. Use the content MD file as the content/structure layer.

## 2. Main instruction

Build a clean, modern, responsive dashboard UI inspired by the BankDash screenshots.

Important:

- Do not recreate the BankDash banking pages by default.
- Do not create pages like Accounts, Credit Cards, Loans, Investments, Services, or Settings unless they are explicitly listed in the separate content MD file.
- Do not keep banking labels, banking metrics, banking tables, or banking dummy data unless the content MD file asks for them.
- The final route names, sidebar items, page titles, sections, cards, charts, tables, forms, filters, and actions must come from the separate content MD file.
- This file only controls style, spacing, responsive rules, components, and visual behavior.

## 3. Tech stack

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Lucide React or similar clean outline icon library
- Recharts for charts when charts are needed by the content file
- Component-based architecture
- Responsive CSS Grid/Flexbox

Avoid:

- Dark mode unless requested in the content file
- Heavy shadows
- Dense visual noise
- Over-designed animations
- Hardcoded banking content

## 4. Global visual direction

The UI must feel:

- Clean
- Soft
- Spacious
- Minimal
- Professional
- Fintech/SaaS dashboard inspired
- Rounded
- Light
- Easy to scan
- Responsive

The design should look premium and calm, with a white-card system on a very light gray background.

## 5. Color system

Use these tokens:

```css
:root {
  --color-bg: #F5F7FA;
  --color-surface: #FFFFFF;
  --color-surface-soft: #F8FAFF;

  --color-primary: #1814F3;
  --color-primary-hover: #0F0CD8;
  --color-primary-light: #EEF2FF;

  --color-blue: #396AFF;
  --color-blue-soft: #E7EDFF;

  --color-cyan: #16DBCC;
  --color-cyan-soft: #DCFAF8;

  --color-pink: #FF82AC;
  --color-pink-soft: #FFE0EB;

  --color-yellow: #FCAA0B;
  --color-yellow-soft: #FFF5D9;

  --color-orange: #FF8A00;

  --color-success: #00B69B;
  --color-danger: #FE5C73;

  --color-text: #232323;
  --color-heading: #343C6A;
  --color-muted: #718EBF;
  --color-muted-light: #B1B1B1;

  --color-border: #E6EFF5;
  --color-divider: #F0F2F5;
}
```

Usage:

- App background: `#F5F7FA`
- Main cards: `#FFFFFF`
- Main headings: `#343C6A`
- Body text: `#232323`
- Muted labels: `#718EBF`
- Inactive nav items: `#B1B1B1`
- Primary active/action color: `#1814F3`
- Success values: `#00B69B`
- Negative/error values: `#FE5C73`
- Chart blue: `#1814F3`
- Chart cyan: `#16DBCC`
- Chart yellow/orange: `#FCAA0B`
- Chart pink: `#FF82AC`

## 6. Typography

Use `Inter` as the main font. If Inter is not available, use `Poppins` or a clean system sans-serif.

Typography scale:

```txt
Page title desktop: 28px / 36px / 600
Page title mobile: 20px / 28px / 600
Section title: 22px / 30px / 600
Card title: 18px / 26px / 600
Metric value: 20px / 28px / 600
Table text: 15px / 22px / 400
Body text: 15px / 24px / 400
Small label: 13px / 18px / 400
Tiny label: 12px / 16px / 400
Button text: 15px / 20px / 500
```

## 7. Layout system

### Desktop

For screens `>= 1200px`:

```txt
Sidebar width: 250px
Topbar height: 100px
Main padding: 30px to 40px
Content gap: 30px
Card radius: 25px
```

Layout:

```txt
[Fixed Sidebar] [Topbar]
                [Main content]
```

### Tablet

For screens `768px - 1199px`:

```txt
Sidebar width: 220px to 230px
Topbar height: 85px
Main padding: 24px
Grid gap: 24px
```

Cards should adapt to 2-column or 3-column grids depending on the content file.

### Mobile

For screens `< 768px`:

```txt
Hide desktop sidebar
Show mobile header
Place search below mobile header
Use single-column layout
Use horizontal scroll for repeated cards when needed
Transform dense tables into simplified card rows where possible
```

Mobile header:

```txt
Left: hamburger icon
Center: current page title
Right: avatar
```

Search input on mobile:

```txt
Width: 100%
Height: 40px to 44px
Border-radius: 999px
Background: #F5F7FA
```

## 8. Sidebar design

Desktop sidebar:

```txt
Width: 250px
Background: white
Border-right: 1px solid #E6EFF5
Padding top: 32px
Logo area height: 60px
Nav margin top: 40px
```

Nav items must be dynamic and come from the content MD file.

Nav item style:

```txt
Height: 58px to 60px
Display: flex
Align center
Gap: 22px
Padding-left: 40px
Font-size: 16px
Font-weight: 400
Inactive color: #B1B1B1
Active color: #1814F3
```

Active nav item:

```txt
Left indicator: 6px wide, 60px high, blue, rounded-right
Icon: blue
Text: blue, medium
```

Inactive nav item:

```txt
Icon: gray
Text: gray
Hover: blue text/icon or very light blue background
```

## 9. Topbar design

Desktop topbar:

```txt
Height: 100px
Background: white
Border-bottom: 1px solid #E6EFF5
Padding: 0 40px
Display: flex
Align center
Justify between
```

Left:

```txt
Current page title from content file
Color: #343C6A
Font-size: 28px
Font-weight: 600
```

Right:

```txt
Search input
Circular action icons when needed
Avatar/profile area
```

Search:

```txt
Width: 255px
Height: 50px
Background: #F5F7FA
Border radius: 999px
Icon left
Placeholder color: #8BA3CB
No visible border
```

Circular icon buttons:

```txt
Size: 50px
Background: #F5F7FA
Border radius: 50%
Icon color: muted blue or accent
```

Avatar:

```txt
Size: 60px desktop
Size: 40px mobile
Border radius: 50%
Object fit: cover
```

## 10. Card system

Base card:

```txt
Background: white
Border-radius: 25px
Padding: 25px to 30px
Border: none or 1px solid transparent
Shadow: none or very subtle
```

Use cards for:

- Metrics
- Charts
- Tables
- Lists
- Forms
- Quick actions
- User profile modules
- Any section defined in the content file

## 11. Metric cards

Metric card style:

```txt
Height: 110px to 120px desktop
Border radius: 25px
Padding: 25px 32px
Display: flex
Align center
Gap: 20px
Background: white
```

Icon badge:

```txt
Metric badge size: 60px to 70px
Border-radius: 50%
Icon size: 26px to 28px
```

Text:

```txt
Label: 14px, #718EBF
Value: 20px, #232323, 600
```

Metric grid must be generated according to the content MD file.

## 12. Icon badge system

Use soft pastel rounded icon containers.

Variants:

```txt
Blue:
background #E7EDFF
icon #396AFF

Cyan:
background #DCFAF8
icon #16DBCC

Pink:
background #FFE0EB
icon #FF82AC

Yellow:
background #FFF5D9
icon #FCAA0B
```

List icon badge:

```txt
Size: 55px to 60px
Border-radius: 16px to 18px
```

Metric icon badge:

```txt
Size: 60px to 70px
Border-radius: 50%
```

## 13. Buttons

Primary button:

```txt
Background: #1814F3
Hover: #0F0CD8
Text: white
Height: 50px
Padding: 0 32px
Border-radius: 12px
Font-size: 15px
Font-weight: 500
Transition: 180ms ease
```

Outline button:

```txt
Background: white
Border: 1px solid #1814F3
Text: #1814F3
Height: 38px to 44px
Border-radius: 999px
Padding: 0 24px
```

Link action:

```txt
Color: #1814F3
Font-size: 14px
Font-weight: 500
```

## 14. Tables

Desktop table card:

```txt
Background: white
Border-radius: 25px
Padding: 20px 30px
```

Table header:

```txt
Color: #718EBF
Font-size: 14px
Font-weight: 400
Border-bottom: 1px solid #E6EFF5
```

Rows:

```txt
Height: 58px to 68px
Border-bottom: 1px solid #F0F2F5
Font-size: 15px
Color: #232323
```

Value colors:

```txt
Positive: #00B69B
Negative: #FE5C73
```

Mobile table behavior:

- Do not force dense desktop tables on mobile.
- Either use horizontal scroll if all columns are essential, or convert rows into clean mobile cards.
- Mobile cards should show only the most important fields from the content file.

## 15. Forms

Form card:

```txt
Background: white
Border-radius: 25px
Padding: 30px
```

Input:

```txt
Height: 50px
Border: 1px solid #DFEAF2
Border-radius: 12px
Padding: 0 18px
Color: #718EBF
Font-size: 14px
Background: white
```

Label:

```txt
Color: #232323
Font-size: 14px
Margin-bottom: 10px
```

Desktop form grid:

```txt
2 columns when enough space
Gap: 24px horizontal
Gap: 20px vertical
```

Mobile form:

```txt
1 column
Full width
Primary button full width if inside form
```

Tabs:

```txt
Tab text: #718EBF
Active tab: #1814F3
Active underline: 3px blue
```

## 16. Charts

Use Recharts only when charts are defined in the content MD file.

Bar chart:

```txt
Bar radius: 8px 8px 0 0
Grid lines: #EEF2F7
Axis text: #718EBF
```

Line chart:

```txt
Line color: #1814F3 or #16DBCC
Stroke width: 3
Area fill: very light blue
Grid dashed
Dots optional
```

Pie/donut chart:

```txt
Flat colors
Readable labels
No 3D effects
No excessive decoration
```

## 17. Responsive rules

Breakpoints:

```txt
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1440px
```

Desktop:

```txt
Sidebar visible
Desktop topbar visible
Mobile header hidden
Content uses grids from content file
```

Tablet:

```txt
Reduce padding
Use 2-column layouts where appropriate
Allow horizontal scroll for tables when required
```

Mobile:

```txt
Sidebar hidden
Mobile header visible
Topbar desktop hidden
All sections become single column
Repeated card groups can horizontally scroll
Tables simplify
Charts remain inside rounded white cards
```

Mobile spacing:

```txt
body content: 25px
section gap: 24px
card padding: 20px
```

Desktop spacing:

```txt
main content: 30px to 40px
section gap: 30px
card padding: 25px to 30px
```

## 18. Animation and interaction

Keep interactions subtle:

```txt
Card hover: translateY(-2px), 180ms ease
Button hover: slightly darker background
Sidebar hover: text/icon blue
Mobile drawer: slide-in from left with soft overlay
Charts: simple load animation
```

Avoid:

- Large motion
- Parallax
- Heavy blur
- Bouncy animations
- Complex transitions

## 19. Tailwind tokens

Recommended Tailwind config extension:

```js
colors: {
  dashboard: {
    bg: "#F5F7FA",
    surface: "#FFFFFF",
    primary: "#1814F3",
    primaryHover: "#0F0CD8",
    heading: "#343C6A",
    text: "#232323",
    muted: "#718EBF",
    border: "#E6EFF5",
    success: "#00B69B",
    danger: "#FE5C73",
    cyan: "#16DBCC",
    pink: "#FF82AC",
    yellow: "#FCAA0B"
  }
},
borderRadius: {
  card: "25px",
  input: "12px",
  pill: "999px"
}
```

## 20. Required reusable components

Create these reusable components without hardcoding final page content:

```txt
DashboardShell
Sidebar
Topbar
MobileHeader
SearchInput
DashboardCard
SectionHeader
MetricCard
IconBadge
PrimaryButton
OutlineButton
LinkAction
ResponsiveTable
FormInput
Tabs
ChartCard
BarChartCard
LineChartCard
DonutChartCard
ListCard
ActionList
EmptyState
LoadingState
```

Each component must accept props and data from the content file or future API.

## 21. Content separation rule

This is the most important rule:

The visual system comes from this file.
The real dashboard structure comes from the separate content MD file.

Never decide final pages from this design file.
Never create BankDash banking routes unless the content file requests them.
Never use BankDash sample labels as final content.

When the content file is provided:

1. Read this design skill file.
2. Read the content MD file.
3. Extract the real routes, navigation items, page titles, sections, cards, metrics, forms, tables, charts, CTAs, and empty states from the content MD file.
4. Build those real pages using the BankDash-inspired UI style from this file.
5. Keep the design clean, responsive, and consistent.
