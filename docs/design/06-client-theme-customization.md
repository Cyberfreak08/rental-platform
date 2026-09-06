# Client Theme Customization

The same product should support different client brands without changing the business logic.

## Customizable tokens
- brand primary/strong/soft
- background/surface
- text/muted/border
- logo
- favicon
- typography choice where licensing permits
- button radius
- card radius
- photography

## Not customizable by default
- booking status semantics
- availability rules
- API contracts
- database relationships
- security rules
- required booking fields

## Theme strategy
Use semantic CSS variables/tokens and a single theme object/config source. Avoid hard-coded brand colours in individual components.
