import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AboutPage } from "./pages/AboutPage";
import { ApodPage } from "./pages/ApodPage";
import { AsteroidDetailPage } from "./pages/AsteroidDetailPage";
import { AsteroidsPage } from "./pages/AsteroidsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { MediaDetailPage } from "./pages/MediaDetailPage";
import { MediaLibraryPage } from "./pages/MediaLibraryPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SpaceWeatherPage } from "./pages/SpaceWeatherPage";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "apod", element: <ApodPage /> },
      { path: "asteroids", element: <AsteroidsPage /> },
      { path: "asteroids/:asteroidId", element: <AsteroidDetailPage /> },
      { path: "media", element: <MediaLibraryPage /> },
      { path: "media/:nasaId", element: <MediaDetailPage /> },
      { path: "space-weather", element: <SpaceWeatherPage /> },
      { path: "favorites", element: <FavoritesPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
export function App() {
  return <RouterProvider router={router} />;
}
