# Environment & Configuration Specification

Never commit real secrets.

## Suggested environment variables
```text
NODE_ENV=
APP_BASE_URL=
PUBLIC_WEB_URL=

DATABASE_URL=

AUTH_SECRET=

STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

WHATSAPP_MODE=click_to_chat|api
WHATSAPP_BUSINESS_NUMBER=
WHATSAPP_API_BASE_URL=
WHATSAPP_API_TOKEN=

ANALYTICS_ID=
GOOGLE_SITE_VERIFICATION=
```

Only define the variables required by the selected deployment/providers. Remove unused secrets.

## Rules
- `.env.local`/production secret files are ignored by Git.
- `.env.example` contains names and safe placeholder values only.
- Client-exposed variables must never contain server secrets.
- Production values are configured in the hosting platform's secret/environment manager.

## Configuration areas
- business profile defaults
- booking limits
- public site branding
- storage
- authentication
- notifications
- analytics
- feature flags where necessary
