# Tumlinson Frontend

A modern web application built with Next.js, featuring authentication and a clean, responsive user interface.

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives
- **Icons:** [Lucide React](https://lucide.dev/)
- **Development:** ESLint for code quality

## ✨ Features

- 🔐 **Authentication System** - Complete login functionality
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🎨 **Modern UI Components** - Built with Radix UI primitives
- ⚡ **Performance Optimized** - Next.js 16 with latest React features
- 🛡️ **Type Safety** - Full TypeScript implementation
- 🧩 **Component Architecture** - Modular and reusable components

## 🏗️ Project Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication routes
│   │   └── login/        # Login page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── input.tsx
│       └── label.tsx
├── features/
│   └── auth/             # Authentication feature module
│       └── components/
│           └── LoginForm.tsx
├── lib/
│   └── utils.ts          # Utility functions
└── types/
    └── global.d.ts       # Global type definitions
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EmaanSiddiqui/Tumlinson-Frontend.git
   cd Tumlinson-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 UI Components

This project uses a custom component library built on top of Radix UI primitives with Tailwind CSS for styling. Components are designed to be:

- **Accessible** - Following WAI-ARIA guidelines
- **Composable** - Easy to combine and extend
- **Consistent** - Unified design system
- **Customizable** - Easy to theme and modify

### Adding New Components

To add new UI components using shadcn/ui:

```bash
npx shadcn@latest add [component-name]
```

## 🔐 Authentication

The application includes a complete authentication system with:

- Login form with validation
- Password visibility toggle
- Form error handling
- Loading states
- Responsive design

## 🚀 Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Deploy with zero configuration

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EmaanSiddiqui/Tumlinson-Frontend)

### Other Deployment Options

- **Netlify:** Connect your Git repository for automatic deployments
- **AWS Amplify:** Use AWS for hosting and backend services
- **Docker:** Build and deploy using containers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 📞 Support

For support and questions, please contact the development team or open an issue in the repository.

---

Built with ❤️ using Next.js and TypeScript
