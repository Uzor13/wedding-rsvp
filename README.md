# Wedding RSVP Frontend

React SPA that admins use to manage guests, tags, SMS outreach, QR verification, and live event theming. It consumes the backend API and reads configurable invitation settings from the shared `settings` document.

## Requirements

- Node.js 18+
- npm
- Backend API running (see `wedding-rsvp-backend`)

## Environment

Create a `.env` file with:

```
REACT_APP_SERVER_LINK=http://localhost:3001
REACT_APP_SITE_LINK=https://your-backend-host
REACT_APP_USERNAME=...
REACT_APP_SMS_SENDER_NAME=...
REACT_APP_SMS_API_KEY=...
REACT_APP_SMS_USERNAME=...
REACT_APP_AFRICA_IS_TALKING_API_KEY=...
```

Only variables prefixed with `REACT_APP_` are exposed to the browser build.

## Development

```bash
npm install
npm start          # launches CRA dev server on http://localhost:3000
```

- Login with the seeded credentials (`admin` / `admin1234`).
- Use the Settings page to update invitation copy, colors, and event details; changes persist in MongoDB and update the invitation/verification UI instantly.
- `npm run build` produces a production bundle in `build/`.

## Linting & Testing

```bash
npm run lint   # if you add ESLint scripts
npm test       # CRA test runner
```

## Deployment

- Build with `npm run build` and deploy the `build/` directory.
- Set matching environment variables on the hosting provider (Vercel, Netlify, Render, etc.).
