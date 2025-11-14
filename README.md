# Tumlinson Frontend

A modern, full-featured file management dashboard built with Next.js 16, featuring authentication, file/folder management, real-time upload progress, and tracking capabilities.

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Hooks (useState, useEffect, useCallback)
- **Real-time:** WebSocket for upload progress tracking
- **Development:** ESLint for code quality

## ✨ Features

### 🔐 Authentication & Security
- Complete login system with form validation
- Server Actions for secure authentication
- Protected routes with automatic redirect
- Session management via HTTP-only cookies and localStorage
- User avatar with auto-generated initials
- Logout functionality

### 📁 File & Folder Management
- **Browse & Navigate:** Hierarchical folder navigation with breadcrumb trail
- **Upload Folders:** Upload entire folder structures with progress tracking
- **Delete Items:** Delete files and folders with confirmation dialogs
- **Search:** Real-time search across all files and folders
- **Pagination:** Customizable items per page (10, 25, 50, 100, All)
- **Navigation History:** Browser-like back/forward navigation
- **Visual Feedback:** Loading states, error handling, empty states

### 📊 Tracking Page
- CSV data visualization in table format
- Server-side data fetching with Suspense
- Search functionality for tracking data
- Horizontal scrolling with navigation buttons
- Dynamic column headers from CSV
- Loading states and error handling

### 🎨 Modern UI/UX
- Responsive design with mobile-first approach
- Loading spinners and skeleton screens
- Toast notifications for user feedback
- Confirmation dialogs for destructive actions
- Progress bars with real-time updates
- Empty states with helpful messages
- Error messages with proper styling

## 🏗️ Project Structure

```
src/
├── app/
│   ├── (auth)/                    # Authentication routes
│   │   ├── layout.tsx
│   │   └── login/
│   │       └── page.tsx
│   ├── actions/                   # Server Actions
│   │   ├── auth.ts               # Authentication server actions
│   │   └── tracking.ts           # Tracking data server actions
│   ├── dashboard/                 # Dashboard page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── tracking/                  # Tracking page
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── components/
│   ├── ui/                        # Reusable UI components
│   │   ├── alert-dialog.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── progress.tsx
│   └── UploadModal.tsx
├── features/
│   ├── auth/                      # Authentication feature
│   │   └── components/
│   │       └── LoginForm.tsx
│   ├── dashboard/                 # Dashboard feature
│   │   ├── components/
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── ConfigBadge.tsx
│   │   │   ├── DashboardSection.tsx
│   │   │   ├── FolderList.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LogoutButton.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── UserAvatar.tsx
│   │   └── utils/
│   │       └── userUtils.ts
│   └── tracking/                  # Tracking feature
│       └── components/
│           └── TrackingTable.tsx
├── hooks/
│   └── useAuth.ts                 # Authentication hook
├── lib/
│   ├── api.ts                     # API configuration
│   └── utils.ts                   # Utility functions
├── services/
│   └── dashboardService.ts        # API service layer
└── types/
    ├── api.ts                     # API type definitions
    ├── dashboard.ts               # Dashboard type definitions
    └── global.d.ts                # Global types
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tumlinson-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | Yes |

### API Endpoints

The application integrates with the following API endpoints:

- `GET /api/config` - Get storage configuration
- `GET /api/structure?page=1&limit=50&search=query` - Get file/folder structure
- `POST /api/upload-multiple` - Upload multiple files
- `DELETE /api/files/:path` - Delete a file
- `DELETE /api/folders/:path` - Delete a folder
- `GET /api/tracking?search=query` - Get tracking data
- `WS /ws/:clientId` - WebSocket for upload progress
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

## 📖 Usage Guide

### Dashboard Features

#### File Management
1. **Browse Files & Folders:**
   - Click on folders to navigate into them
   - Use back/forward buttons to navigate history
   - Click breadcrumb paths to jump to specific locations
   - Use the Home button to return to root directory

2. **Search:**
   - Type in the search bar to find files/folders
   - Search is performed in real-time
   - Results are filtered and displayed immediately

3. **Upload Folders:**
   - Click "Upload Folder" button (only visible in `accepted_invites` folder)
   - Select a folder from your computer
   - Watch real-time progress updates via WebSocket
   - Dashboard refreshes automatically after successful upload

4. **Delete Items:**
   - Click trash icon on any file/folder
   - Confirm deletion in the dialog
   - Delete button shows loading state during deletion
   - Dashboard refreshes automatically after deletion

5. **Pagination:**
   - Use pagination controls at the bottom
   - Select items per page (10, 25, 50, 100, All)
   - Navigate between pages using First, Previous, Next, Last buttons

### Tracking Page

1. Navigate to `/tracking` using the sidebar
2. View CSV data in a scrollable table format
3. Use search to filter tracking data
4. Use Forward/Back buttons to scroll horizontally through columns
5. Refresh data using the refresh button

### Authentication

- All dashboard routes are protected
- Automatic redirect to login if not authenticated
- User avatar displays in header with initials
- Logout button available in user menu
- Session persists across page refreshes

## 🎨 Design System

### Color Palette

- **Primary Teal:** `#009689`, `#007f75` (Primary actions, accents)
- **Background:** `#f5f5f5`, `#fafafa`, `#fff`
- **Text:** `#000`, `#333`, `#666`, `#999`
- **Borders:** `#e0e0e0`, `#ddd`
- **Success:** `#4caf50`, `#d4edda`
- **Error:** `#d32f2f`, `#f8d7da`
- **Warning:** `#ff9800`, `#fff3cd`

### Typography

- **Headings:** Bold, 1.4-2em
- **Body:** 0.9-0.95em, Regular
- **Small:** 0.8-0.85em

## 🔐 Security

- **Authentication:** Token-based authentication with Bearer tokens
- **Protected Routes:** All dashboard routes require authentication
- **Session Management:** HTTP-only cookies for server-side, localStorage for client-side
- **Auto Logout:** Automatic logout on token expiration (401 responses)
- **Secure Headers:** All API requests include Authorization headers

## 🚀 Recent Updates

### Server Actions Implementation
- **Tracking Page:** Converted to server component with server actions
- **Data Fetching:** Server-side data fetching with Suspense for better performance
- **Loading States:** Improved loading states with skeleton screens

### UI Improvements
- **Delete Functionality:** Added loading states and disabled buttons during deletion
- **Progress Bar:** Fixed progress bar to show 100% only on completion
- **Tracking Table:** Added horizontal scrolling with navigation buttons
- **Responsive Design:** Improved mobile responsiveness

### Code Quality
- **Type Safety:** Full TypeScript implementation with strict mode
- **Component Architecture:** Modular, reusable components
- **Error Handling:** Comprehensive error handling throughout
- **Performance:** Optimized with React hooks and memoization

## 🐛 Troubleshooting

### Issue: "Failed to load structure"
- **Cause:** Backend API not running or wrong URL
- **Fix:** Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

### Issue: "Session expired" or redirect to login
- **Cause:** Authentication token expired or invalid
- **Fix:** Re-login to get a new token

### Issue: Upload progress not showing
- **Cause:** WebSocket connection failed
- **Fix:** Ensure backend WebSocket server is running and accessible

### Issue: Tracking page shows "No data found"
- **Cause:** CSV file not found in storage
- **Fix:** Ensure the tracking CSV file exists in the configured storage location

### Issue: Page not rendering or taking too long
- **Cause:** Server action or API call is slow
- **Fix:** Check network tab for failed requests, verify API is accessible

## 🧩 Component Architecture

### Server Components
- `app/tracking/page.tsx` - Server component with Suspense
- `app/actions/*.ts` - Server Actions for data fetching

### Client Components
- `features/dashboard/components/*` - Interactive dashboard components
- `features/tracking/components/TrackingTable.tsx` - Interactive table component

### Shared Components
- `components/ui/*` - Reusable UI primitives
- `features/dashboard/components/Header.tsx` - Shared header component

## 📱 Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Folder upload requires `webkitdirectory` support
- WebSocket support required for upload progress
- ES6+ JavaScript features

## 🚀 Deployment

### Deploy on Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy with zero configuration

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

Built with ❤️ using Next.js 16, TypeScript, and Tailwind CSS
