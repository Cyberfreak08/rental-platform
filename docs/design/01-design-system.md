# Visual Design System V1

Status: PHASE 1 FROZEN BASELINE

## Brand direction
Premium, trustworthy, modern local business. Avoid looking like a generic template or an enterprise admin system.

## Palette
```text
Background       #F7F7F5
Surface          #FFFFFF
Surface Alt      #EFEFEC
Text             #171717
Muted Text       #666666
Border           #DCDCD6
Brand            #1F5D54
Brand Strong     #16483F
Brand Soft       #E7F2EF
Success          #1F7A4D
Warning          #A86A00
Danger           #B42318
Info             #175CD3
```

Use semantic tokens. Do not scatter arbitrary hex values through components.

## Typography
Plus Jakarta Sans (Modern sans-serif loaded via `next/font/google`).
- Display: 48–64 desktop, 34–42 mobile
- H1: 40–48 desktop, 30–36 mobile
- H2: 28–36
- H3: 20–24
- Body: 16
- Meta: 13–14

Use 600 for key headings/buttons and 400–500 for body.

## Spacing
8px rhythm where practical: `4 8 12 16 24 32 40 48 64 80`.

## Radius
- Controls 8
- Inputs/cards 12
- Feature cards 16
- Hero media 20

## Buttons
- Primary: solid brand
- Secondary: bordered/surface
- Danger: destructive actions only
- Labels should describe actions (`Search Cars`, `Confirm Booking`, `Block Vehicle`)

## Interaction
- 150–250ms subtle transitions
- card hover/elevation
- skeletons for remote data
- toast/snackbar after actions
- success feedback on request submission
- subtle calendar/event interactions
- no excessive parallax, auto-play or decorative motion

## Forms
- labels above fields
- inline validation
- required indicator
- sensible date/time grouping
- do not make users re-enter data already selected
