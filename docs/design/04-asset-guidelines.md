# Asset Guidelines

## Required development assets
1. Primary logo
2. Dark/light logo variants
3. Favicon
4. Vehicle model generic images
5. Optional realistic fleet vehicle images
6. Interior images: dashboard/seats/boot
7. Coimbatore/Western Ghats location imagery
8. Booking/travel/success illustrations
9. Small UI/action icons
10. Placeholder/fallback images

## Image policy
- Use the provided/approved local assets for the prototype.
- Do not ask Bob to invent or source arbitrary stock imagery during implementation.
- Keep asset filenames stable and descriptive.
- Use WebP/AVIF where appropriate for raster images in production, while SVG remains preferred for logos/icons/illustrations.
- Store image references in data/config rather than hard-coding URLs across components.

## Fleet photos
Real fleet photos are associated with physical vehicles.
Generic model images are associated with vehicle models.
Public gallery can combine them.

## Accessibility
Provide useful alt text for informative images; decorative images can use empty alt where appropriate.
