# Netflix Clone - Movie Streaming App

A React.js web application for showing and streaming movies and TV shows with a header, sidebar, and multiple pages.

## Features

- Browse movies and TV shows
- Filter content by genre
- Video player with full controls
- Responsive design
- Modern UI similar to Netflix

## Pages

- Home - Featured movies and categories
- Movies - Browse all movies with filters
- TV Shows - Browse all TV shows with filters
- Video Player - Stream content with controls

## Tech Stack

- React.js
- React Router
- Tailwind CSS
- Webpack
- Babel

## Getting Started

### Prerequisites

- Node.js (version 14.x or higher)
- npm (version 6.x or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Building for Production

Build the application for production:

```bash
npm run build
```

The build will be created in the `dist` directory.

## Project Structure

```
netflix-clone/
  ├── public/               # Public assets
  │   └── index.html        # HTML template
  ├── src/                  # Source code
  │   ├── components/       # Reusable components
  │   ├── pages/            # Page components
  │   ├── data/             # Mock data
  │   ├── styles/           # Global styles with Tailwind CSS
  │   ├── App.js            # Main app component
  │   └── index.js          # Entry point
  ├── webpack.config.js     # Webpack configuration
  ├── tailwind.config.js    # Tailwind CSS configuration
  ├── postcss.config.js     # PostCSS configuration
  ├── package.json          # Dependencies and scripts
  └── README.md             # Project documentation
```

## License

MIT 