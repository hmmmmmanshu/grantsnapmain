# Grants Snap - Your Grant Application Launchpad

## Project Overview

Grants Snap is a comprehensive platform for discovering, applying, and tracking grant opportunities. Built with modern web technologies, it provides an intuitive interface for managing grant applications and staying organized throughout the funding process.

## Features

- **Grant Discovery**: Find relevant grant opportunities based on your organization's needs
- **Application Management**: Track and manage multiple grant applications
- **Deadline Tracking**: Never miss important deadlines with built-in reminders
- **Document Management**: Organize and store grant-related documents
- **Progress Monitoring**: Track the status of your applications

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd grants-snap
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Technology Stack

This project is built with:

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

The application can be deployed to various platforms:

- **Vercel**: Connect your GitHub repository to Vercel for automatic deployments
- **Netlify**: Use the build command `npm run build` and publish the `dist` folder
- **Supabase**: Deploy directly from the Supabase dashboard

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@grantsnap.pro or join our community discussions.
